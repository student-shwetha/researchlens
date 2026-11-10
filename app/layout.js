import './globals.css';
import { Atkinson_Hyperlegible, Bricolage_Grotesque } from 'next/font/google';
import { getSessionUser } from '@/lib/auth.js';
import AppShell from '@/components/AppShell.js';

// Display face with character for headings, and a typeface designed for
// legibility for reading - fitting for a product called "Lens".
const display = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-display', display: 'swap' });
const body = Atkinson_Hyperlegible({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-body', display: 'swap' });

export const metadata = {
  title: 'ResearchLens',
  description: 'Bring research papers into focus: browse, search by keyword, or search by meaning.',
};

async function safeUser() {
  try {
    return await getSessionUser();
  } catch {
    return null; // DB down -> still render the page shell
  }
}

export default async function RootLayout({ children }) {
  const user = await safeUser();
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <AppShell user={user}>{children}</AppShell>
      </body>
    </html>
  );
}
