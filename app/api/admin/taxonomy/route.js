import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth.js';
import { handler, HttpError, parseId, readJson } from '@/lib/errors.js';
import { query } from '@/lib/db.js';

const taxonomyTypes = {
  domain: { table: 'research_domain', nameColumn: 'domain_name', maxLength: 100 },
  subdomain: { table: 'research_subdomain', nameColumn: 'subdomain_name', maxLength: 150 },
  topic: { table: 'research_topic', nameColumn: 'topic_name', maxLength: 150 },
};

// POST /api/admin/taxonomy -> add a domain, subdomain, or topic (ADMIN only)
export const POST = handler(async (request) => {
  await requireAdmin();
  const body = await readJson(request);
  const config = taxonomyTypes[body.type];
  if (!config) throw new HttpError(400, 'Choose a domain, subdomain, or topic.');

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!name || name.length > config.maxLength) {
    throw new HttpError(400, `Name must be between 1 and ${config.maxLength} characters.`);
  }
  const description = typeof body.description === 'string' ? body.description.trim() : '';
  if (description.length > 2000) throw new HttpError(400, 'Description is too long.');

  let result;
  if (body.type === 'domain') {
    result = await query(
      'INSERT INTO research_domain (domain_name, description) VALUES (?, ?)',
      [name, description || null]
    );
  } else if (body.type === 'subdomain') {
    const domainId = parseId(body.parentId);
    const parent = await query('SELECT domain_id FROM research_domain WHERE domain_id = ?', [domainId]);
    if (!parent.length) throw new HttpError(404, 'Domain not found.');
    result = await query(
      'INSERT INTO research_subdomain (domain_id, subdomain_name, description) VALUES (?, ?, ?)',
      [domainId, name, description || null]
    );
  } else {
    const subdomainId = parseId(body.parentId);
    const parent = await query(
      'SELECT subdomain_id FROM research_subdomain WHERE subdomain_id = ?',
      [subdomainId]
    );
    if (!parent.length) throw new HttpError(404, 'Subdomain not found.');
    result = await query(
      'INSERT INTO research_topic (subdomain_id, topic_name, description) VALUES (?, ?, ?)',
      [subdomainId, name, description || null]
    );
  }

  return NextResponse.json({ id: result.insertId, type: body.type, name }, { status: 201 });
});
