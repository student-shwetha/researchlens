'use client';
import { useEffect, useRef, useState } from 'react';
import { ChevronDownIcon, DownloadIcon, LogoMark, MenuIcon, SearchIcon } from './icons.jsx';

const selectClass =
  'h-9 cursor-pointer rounded-md border-0 bg-transparent pl-2 pr-7 text-sm text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A]/30';

/**
 * Logo (left) · search with Year / Journal filters (centre) · Export + profile (right)
 */
export default function TopBar({
  user,
  query, onQueryChange,
  year, onYearChange, years,
  journal, onJournalChange, journals,
  onExport, exportCount,
  onOpenSidebar,
  onLogout,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const initials = user.name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  useEffect(() => {
    if (!menuOpen) return undefined;
    const close = (e) => { if (!menuRef.current?.contains(e.target)) setMenuOpen(false); };
    const esc = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc); };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="flex h-full items-center gap-3 px-4 lg:px-6">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="rounded-md p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
          aria-label="Open navigation"
        >
          <MenuIcon className="h-5 w-5" />
        </button>

        <a href="/" className="flex shrink-0 items-center gap-2.5 lg:w-56">
          <LogoMark />
          <span className="hidden leading-tight sm:block">
            <span className="block text-[15px] font-semibold tracking-tight text-[#1F2937]">ResearchLens</span>
            <span className="block text-xs text-gray-500">Data Matrix</span>
          </span>
        </a>

        <div className="mx-auto flex min-w-0 max-w-2xl flex-1 items-center rounded-lg border border-gray-200 bg-[#F9FAFB] focus-within:border-[#1E3A8A] focus-within:ring-2 focus-within:ring-[#1E3A8A]/15">
          <SearchIcon className="ml-3 h-4 w-4 shrink-0 text-gray-400" />
          <label htmlFor="matrix-search" className="sr-only">Search papers</label>
          <input
            id="matrix-search"
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search titles, authors, extracted text…"
            className="h-10 min-w-0 flex-1 bg-transparent px-2.5 text-sm text-[#1F2937] placeholder:text-gray-400 focus:outline-none"
          />
          <div className="hidden items-center border-l border-gray-200 md:flex">
            <label htmlFor="filter-year" className="sr-only">Filter by year</label>
            <select id="filter-year" value={year} onChange={(e) => onYearChange(e.target.value)} className={selectClass}>
              <option value="">All years</option>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <span className="h-5 w-px bg-gray-200" aria-hidden="true" />
            <label htmlFor="filter-journal" className="sr-only">Filter by journal</label>
            <select id="filter-journal" value={journal} onChange={(e) => onJournalChange(e.target.value)} className={`${selectClass} max-w-[11rem]`}>
              <option value="">All journals</option>
              {journals.map((j) => <option key={j} value={j}>{j}</option>)}
            </select>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 lg:w-56 lg:justify-end">
          <button
            type="button"
            onClick={onExport}
            disabled={exportCount === 0}
            className="inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-lg bg-[#1E3A8A] px-3 text-sm font-medium text-white shadow-sm hover:bg-[#1A3278] disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A]/40 focus-visible:ring-offset-2"
            title="Download the rows you can see as a CSV file"
          >
            <DownloadIcon />
            <span className="hidden sm:inline">Export data</span>
            <span className="rounded bg-white/15 px-1.5 text-xs tabular-nums">{exportCount}</span>
          </button>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2 rounded-lg p-1 pr-2 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A]/40"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label="Account menu"
            >
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[#1E3A8A]/10 text-xs font-semibold text-[#1E3A8A]">{initials}</span>
              <span className="hidden text-left leading-tight xl:block">
                <span className="block max-w-[8rem] truncate text-sm font-medium">{user.name}</span>
                <span className="block text-xs text-gray-500">{user.role === 'ADMIN' ? 'Admin' : 'Student'}</span>
              </span>
              <ChevronDownIcon className="hidden h-4 w-4 text-gray-400 xl:block" />
            </button>
            {menuOpen && (
              <div role="menu" className="absolute right-0 mt-2 w-52 rounded-lg border border-gray-200 bg-white py-1 text-sm shadow-lg">
                <div className="border-b border-gray-100 px-3 py-2 text-xs text-gray-500">{user.email}</div>
                <a role="menuitem" href="/papers" className="block px-3 py-2 hover:bg-gray-50">Back to ResearchLens</a>
                <a role="menuitem" href="/history" className="block px-3 py-2 hover:bg-gray-50">History and saved searches</a>
                {user.role === 'ADMIN' && <a role="menuitem" href="/admin" className="block px-3 py-2 hover:bg-gray-50">Admin</a>}
                <button role="menuitem" type="button" onClick={onLogout} className="block w-full px-3 py-2 text-left text-red-700 hover:bg-gray-50">Log out</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
