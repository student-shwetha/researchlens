import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth.js';
import { handler, HttpError, readJson } from '@/lib/errors.js';
import { listSavedPapers, savePaperForUser, unsavePaperForUser } from '@/lib/papers.js';

export const GET = handler(async () => {
  const user = await requireUser();
  const saved = await listSavedPapers(user.user_id);
  return NextResponse.json({ saved });
});

export const POST = handler(async (request) => {
  const user = await requireUser();
  const body = await readJson(request);
  const paperId = Number(body.paper_id);
  if (!Number.isInteger(paperId) || paperId <= 0) throw new HttpError(400, 'A valid paper id is required.');

  const result = await savePaperForUser(user.user_id, paperId);
  return NextResponse.json({
    saved: true,
    message: result.alreadySaved ? 'Paper already in your library.' : 'Paper saved to your library.',
    paper_id: paperId,
  }, { status: result.alreadySaved ? 200 : 201 });
});

export const DELETE = handler(async (request) => {
  const user = await requireUser();
  const { searchParams } = new URL(request.url);
  const paperId = Number(searchParams.get('paper_id'));
  if (!Number.isInteger(paperId) || paperId <= 0) throw new HttpError(400, 'A valid paper id is required.');

  const result = await unsavePaperForUser(user.user_id, paperId);
  return NextResponse.json({
    removed: result.removed,
    message: result.removed ? 'Paper removed from your library.' : 'Paper was not in your library.',
  });
});
