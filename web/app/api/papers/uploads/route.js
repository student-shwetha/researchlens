import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth.js';
import { handler, HttpError } from '@/lib/errors.js';
import { UPLOAD_DIRECTORY, uploadedPdfPath } from '@/lib/uploads.js';

const MAX_FILE_SIZE = 25 * 1024 * 1024;

export const runtime = 'nodejs';

export const POST = handler(async (request) => {
  await requireAdmin();

  let formData;
  try {
    formData = await request.formData();
  } catch {
    throw new HttpError(400, 'Choose a PDF file to upload.');
  }

  const file = formData.get('file');
  if (!file || typeof file.arrayBuffer !== 'function') {
    throw new HttpError(400, 'Choose a PDF file to upload.');
  }
  if (!file.name?.toLowerCase().endsWith('.pdf')) {
    throw new HttpError(415, 'The selected file must have a .pdf extension.');
  }
  if (!file.size || file.size > MAX_FILE_SIZE) {
    throw new HttpError(413, 'PDF files must be between 1 byte and 25 MB.');
  }

  const contents = Buffer.from(await file.arrayBuffer());
  if (contents.subarray(0, 5).toString('ascii') !== '%PDF-') {
    throw new HttpError(415, 'The selected file does not have a valid PDF signature.');
  }

  const uploadId = randomUUID();
  await mkdir(UPLOAD_DIRECTORY, { recursive: true });
  await writeFile(uploadedPdfPath(uploadId), contents, { flag: 'wx', mode: 0o600 });

  return NextResponse.json(
    { pdf_url: `/api/papers/uploads/${uploadId}` },
    { status: 201 }
  );
});
