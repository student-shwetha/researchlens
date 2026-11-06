import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth.js';
import { handler, HttpError, readJson } from '@/lib/errors.js';
import { answerMatrixQuestion } from '@/lib/matrix.js';

export const POST = handler(async (request) => {
  await requireUser();
  const body = await readJson(request);
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new HttpError(400, 'Request body must be a JSON object.');
  }
  const question = typeof body.question === 'string' ? body.question.trim() : '';
  if (question.length < 3 || question.length > 500) {
    throw new HttpError(400, 'Question must be between 3 and 500 characters.');
  }
  if (!Array.isArray(body.paperIds) || body.paperIds.length === 0 || body.paperIds.length > 100) {
    throw new HttpError(400, 'Select between 1 and 100 papers.');
  }
  const paperIds = [...new Set(body.paperIds)];
  if (paperIds.some((id) => !Number.isSafeInteger(id) || id <= 0)) {
    throw new HttpError(400, 'Paper ids must be positive integers.');
  }

  return NextResponse.json(await answerMatrixQuestion(question, paperIds));
});
