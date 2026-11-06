'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import LogoutButton from '@/components/LogoutButton.js';
import NavLinks from '@/components/NavLinks.js';
import Aperture from '@/components/Aperture.js';

export default function AppShell({ children, user }) {
  const pathname = usePathname() || '';
  const isMatrixRoute = pathname === '/matrix' || pathname.startsWith('/matrix/');

  if (isMatrixRoute) return children;

  return (
    <div className="shell">
      <aside className="rail">
        <Link href="/" className="brand">
          <Aperture size={30} />
          <span>ResearchLens</span>
        </Link>

        {user ? <NavLinks isAdmin={user.role === 'ADMIN'} /> : <div className="nav" />}

        <div className="rail-foot">
          {user ? (
            <>
              <div className="who">
                <span className="avatar" aria-hidden="true">{user.name.trim().charAt(0).toUpperCase()}</span>
                <span>
                  <span className="who-name">{user.name}</span>
                  <span className={`role role-${user.role.toLowerCase()}`}>
                    {user.role === 'ADMIN' ? 'Admin' : 'Student'}
                  </span>
                </span>
              </div>
              <LogoutButton />
            </>
          ) : (
            <div className="row">
              <Link href="/login" className="btn secondary">Log in</Link>
              <Link href="/register" className="btn">Register</Link>
            </div>
          )}
        </div>
      </aside>

      <div className="main">
        <main className="container">{children}</main>
        <footer className="footer">ResearchLens, a DBMS Level 3 project built on MySQL, Qdrant and Next.js</footer>
      </div>
    </div>
  );
}
