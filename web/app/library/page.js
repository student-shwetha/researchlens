import Link from 'next/link';
import { getSessionUser } from '@/lib/auth.js';
import LibraryClient from '@/components/LibraryClient.js';

export const metadata = { title: 'My library · ResearchLens' };

export default async function LibraryPage() {
  const user = await getSessionUser();
  if (!user) {
    return <div className="card"><p className="muted">Please <Link href="/login">log in</Link> to build a personal library.</p></div>;
  }

  return (
    <>
      <h1>My library</h1>
      <p className="muted">Saved papers for later reading, annotation, and follow-up research.</p>
      <LibraryClient />
    </>
  );
}
