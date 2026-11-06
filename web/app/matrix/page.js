import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth.js';
import ResearchMatrix from '@/components/matrix/ResearchMatrix.jsx';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Data Matrix · ResearchLens' };

export default async function MatrixPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login?next=/matrix');

  return <ResearchMatrix user={user} />;
}
