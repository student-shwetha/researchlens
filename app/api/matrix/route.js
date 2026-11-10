import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth.js';
import { handler } from '@/lib/errors.js';
import { getMatrixData } from '@/lib/matrix.js';

export const GET = handler(async () => {
  await requireUser();
  return NextResponse.json(await getMatrixData());
});
