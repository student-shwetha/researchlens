import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth.js';
import { handler, parseId } from '@/lib/errors.js';
import { getPaperRecommendations } from '@/lib/papers.js';

export const GET = handler(async (_request, { params }) => {
  await requireUser();
  const paperId = parseId((await params).id);
  const recommendations = await getPaperRecommendations(paperId, 5);
  return NextResponse.json({ recommendations });
});
