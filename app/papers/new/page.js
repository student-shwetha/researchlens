import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth.js';
import { getMeta } from '@/lib/papers.js';
import PaperForm from '@/components/PaperForm.js';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Add paper · ResearchLens' };

export default async function NewPaperPage({ searchParams }) {
  const user = await getSessionUser();
  if (!user) redirect('/login?next=/papers/new');
  if (user.role !== 'ADMIN') redirect('/papers?denied=1');
  const params = await searchParams;
  const meta = await getMeta();
  return (
    <>
      <h1>Add a paper</h1>
      <PaperForm meta={meta} initial={null} initialPdfUrl={params?.pdfUrl ?? ''} />
    </>
  );
}
