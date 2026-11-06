import { readFile } from 'node:fs/promises';
import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth.js';
import { handler, HttpError } from '@/lib/errors.js';
import { uploadedPdfPath } from '@/lib/uploads.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const GET = handler(async (_request, { params }) => {
  await requireUser();
  const { id } = await params;
  if (!UUID_RE.test(id)) throw new HttpError(404, 'PDF not found.');

  let contents;
  try {
    contents = await readFile(uploadedPdfPath(id));
  } catch (error) {
    if (error.code === 'ENOENT') throw new HttpError(404, 'PDF not found.');
    throw error;
  }

  return new NextResponse(contents, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="paper.pdf"',
      'Cache-Control': 'private, max-age=3600',
      'X-Content-Type-Options': 'nosniff',
    },
  });
});
