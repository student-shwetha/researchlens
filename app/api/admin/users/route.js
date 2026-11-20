import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth.js';
import { handler, HttpError, readJson } from '@/lib/errors.js';
import { validateRegistration } from '@/lib/validate.js';
import { query } from '@/lib/db.js';

// POST /api/admin/users -> create an account (ADMIN only)
export const POST = handler(async (request) => {
  await requireAdmin();
  const body = await readJson(request);
  const { name, email, password } = validateRegistration(body);
  const role = body.role ?? 'STUDENT';
  if (!['STUDENT', 'ADMIN'].includes(role)) {
    throw new HttpError(400, 'Role must be STUDENT or ADMIN.');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const result = await query(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    [name, email, passwordHash, role]
  );
  return NextResponse.json(
    { user: { user_id: result.insertId, name, email, role } },
    { status: 201 }
  );
});
