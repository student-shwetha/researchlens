import path from 'node:path';
import { unlink } from 'node:fs/promises';

export const UPLOAD_DIRECTORY = path.resolve(process.cwd(), 'storage', 'uploads');
export const UPLOADED_PDF_URL_RE =
  /^\/api\/papers\/uploads\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

export function uploadedPdfId(url) {
  return UPLOADED_PDF_URL_RE.exec(url || '')?.[1] ?? null;
}

export function uploadedPdfPath(id) {
  return path.join(UPLOAD_DIRECTORY, `${id}.pdf`);
}

export async function removeUploadedPdf(url) {
  const id = uploadedPdfId(url);
  if (!id) return null;
  try {
    await unlink(uploadedPdfPath(id));
    return null;
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    console.error('[uploads] Could not remove uploaded PDF:', error.message);
    return 'The paper was deleted, but its uploaded PDF could not be removed from storage.';
  }
}
