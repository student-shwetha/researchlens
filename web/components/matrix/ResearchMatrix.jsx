'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import TopBar from './TopBar.jsx';
import Sidebar from './Sidebar.jsx';
import DataMatrixTable from './DataMatrixTable.jsx';
import CopilotPane from './CopilotPane.jsx';
import { PanelRightIcon } from './icons.jsx';

const ALL_COLUMNS = [
  { key: 'summary', label: 'Abstract Summary', width: 'w-[320px] min-w-[320px]' },
  { key: 'methodology', label: 'Methodology', width: 'w-[300px] min-w-[300px]' },
  { key: 'sample_size', label: 'Sample Size', width: 'w-[200px] min-w-[200px]' },
  { key: 'limitations', label: 'Limitations', width: 'w-[300px] min-w-[300px]' },
];

// "Saved templates" = which extracted columns are shown
const TEMPLATES = [
  { id: 'full', name: 'Full extraction', description: 'All four extracted fields', columns: ['summary', 'methodology', 'sample_size', 'limitations'] },
  { id: 'methods', name: 'Methods and sample', description: 'Methodology and sample size', columns: ['methodology', 'sample_size'] },
  { id: 'appraisal', name: 'Critical appraisal', description: 'Summary and limitations', columns: ['summary', 'limitations'] },
];

function countBy(papers, key) {
  const m = new Map();
  for (const p of papers) for (const v of p[key]) m.set(v, (m.get(v) || 0) + 1);
  return [...m].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

// CSV cell: quoted, and formula-looking values neutralised (CSV injection)
function csvCell(v) {
  let s = v == null ? '' : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export default function ResearchMatrix({ user }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [year, setYear] = useState('');
  const [journal, setJournal] = useState('');
  const [scope, setScope] = useState(null);
  const [templateId, setTemplateId] = useState('full');
  const [filters, setFilters] = useState({});
  const [selected, setSelected] = useState(new Set());
  const [splitOpen, setSplitOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [highlightId, setHighlightId] = useState(null);
  const [toast, setToast] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/matrix', { cache: 'no-store' })
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (res.status === 401) { window.location.href = '/login?next=/matrix'; return; }
        if (!res.ok) throw new Error(body.error || `Could not load the matrix (${res.status})`);
        if (!cancelled) {
          setData(body);
          setSelected(new Set(body.papers.map((p) => p.id)));
        }
      })
      .catch((err) => !cancelled && setError(err.message));
    if (window.matchMedia('(min-width: 1024px)').matches) setSplitOpen(true);
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(t);
  }, [toast]);

  const papers = data?.papers ?? [];
  const columns = ALL_COLUMNS.filter((c) => TEMPLATES.find((t) => t.id === templateId).columns.includes(c.key));
  const years = useMemo(() => [...new Set(papers.map((p) => p.year).filter(Boolean))].sort((a, b) => b - a), [papers]);
  const journals = useMemo(() => [...new Set(papers.map((p) => p.journal).filter(Boolean))].sort(), [papers]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return papers.filter((p) => {
      if (scope?.type === 'domain' && !p.domains.includes(scope.value)) return false;
      if (scope?.type === 'topic' && !p.topics.includes(scope.value)) return false;
      if (year && String(p.year) !== year) return false;
      if (journal && p.journal !== journal) return false;
      const fieldText = (k) => (p.fields[k]?.text || '').toLowerCase();
      if (q) {
        const hay = [p.title, p.authors, p.journal, ...Object.keys(p.fields).map(fieldText)].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (filters.paper && !`${p.title} ${p.authors}`.toLowerCase().includes(filters.paper.toLowerCase())) return false;
      for (const c of ['summary', 'methodology', 'limitations']) {
        if (filters[c] && !fieldText(c).includes(filters[c].toLowerCase())) return false;
      }
      if (filters.sample_size && !(p.sampleN != null && p.sampleN >= Number(filters.sample_size))) return false;
      return true;
    });
  }, [papers, scope, year, journal, query, filters]);

  const loaded = useMemo(() => visible.filter((p) => selected.has(p.id)), [visible, selected]);

  const toggle = useCallback((id) => {
    setSelected((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  }, []);
  const toggleAll = useCallback((on) => {
    setSelected((s) => { const n = new Set(s); for (const p of visible) { if (on) n.add(p.id); else n.delete(p.id); } return n; });
  }, [visible]);

  const cite = useCallback((id) => {
    if (!visible.some((p) => p.id === id)) { setScope(null); setQuery(''); setFilters({}); setYear(''); setJournal(''); }
    setHighlightId(id);
    setTimeout(() => setHighlightId((h) => (h === id ? null : h)), 2500);
  }, [visible]);

  function exportCsv() {
    const header = ['paper_id', 'title', 'year', 'journal', 'authors', ...columns.flatMap((c) => [c.label, `${c.label} (origin)`])];
    const rows = loaded.map((p) => [p.id, p.title, p.year, p.journal, p.authors,
      ...columns.flatMap((c) => [p.fields[c.key]?.text ?? '', p.fields[c.key]?.origin ?? ''])]);
    const csv = [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `researchlens-matrix-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setToast({ text: `Exported ${rows.length} ${rows.length === 1 ? 'paper' : 'papers'} to CSV.` });
  }

  async function onUpload(files) {
    if (!files.length) return;
    const formData = new FormData();
    formData.set('file', files[0]);
    setUploading(true);
    setToast({ text: 'Uploading PDF…' });
    try {
      const response = await fetch('/api/papers/uploads', { method: 'POST', body: formData });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || `Upload failed (${response.status}).`);
      window.location.assign(`/papers/new?pdfUrl=${encodeURIComponent(result.pdf_url)}`);
    } catch (err) {
      setToast({ text: err.message });
      setUploading(false);
    }
  }

  function onUploadDenied() {
    setToast({ text: 'Uploading and adding papers requires an administrator account. Ask your project admin for access.' });
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    window.location.href = '/login';
  }

  const activeChips = [
    scope && { label: scope.value, clear: () => setScope(null) },
    year && { label: year, clear: () => setYear('') },
    journal && { label: journal, clear: () => setJournal('') },
    templateId !== 'full' && { label: TEMPLATES.find((t) => t.id === templateId).name, clear: () => setTemplateId('full') },
  ].filter(Boolean);

  return (
    <div className="research-matrix-root min-h-screen overflow-x-clip bg-[#F9FAFB] font-sans text-[#1F2937] antialiased">
      <TopBar
        user={user}
        query={query} onQueryChange={setQuery}
        year={year} onYearChange={setYear} years={years}
        journal={journal} onJournalChange={setJournal} journals={journals}
        onExport={exportCsv} exportCount={loaded.length}
        onOpenSidebar={() => setNavOpen(true)}
        onLogout={logout}
      />

      <div className="flex">
        <Sidebar
          open={navOpen} onClose={() => setNavOpen(false)}
          total={papers.length}
          domains={countBy(papers, 'domains')}
          topics={countBy(papers, 'topics')}
          templates={TEMPLATES}
          scope={scope} onScope={(s) => { setScope(s); setNavOpen(false); }}
          templateId={templateId} onTemplate={(id) => { setTemplateId(id); setNavOpen(false); }}
          onUpload={onUpload}
          onUploadDenied={onUploadDenied}
          uploading={uploading}
          isAdmin={user.role === 'ADMIN'}
        />

        <main className="flex h-[calc(100vh-4rem)] min-w-0 flex-1">
          <section className="flex min-w-0 flex-1 flex-col gap-4 p-4 lg:p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-2xl font-semibold tracking-tight">Data Matrix</h1>
                <p className="mt-1 text-sm text-gray-500">
                  {data
                    ? `${visible.length} papers · ${visible.filter((p) => Object.keys(p.fields).length > 0).length} with extracted fields · ${loaded.length} selected for the Copilot`
                    : 'Loading extracted fields…'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSplitOpen((o) => !o)}
                aria-pressed={splitOpen}
                className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A]/40 ${
                  splitOpen
                    ? 'border-[#1E3A8A] bg-[#1E3A8A]/[0.07] text-[#1E3A8A]'
                    : 'border-gray-200 bg-white text-[#1F2937] hover:border-gray-300'
                }`}
              >
                <PanelRightIcon />
                {splitOpen ? 'Close split screen' : 'Toggle split screen'}
              </button>
            </div>

            {activeChips.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {activeChips.map((c) => (
                  <button key={c.label} type="button" onClick={c.clear} className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-gray-600 hover:border-gray-300">
                    {c.label} <span aria-hidden="true">×</span><span className="sr-only">Remove filter</span>
                  </button>
                ))}
              </div>
            )}

            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
                {error} Check that <code className="rounded bg-white px-1">sql/04b_extractions.sql</code> has been run.
              </div>
            ) : !data ? (
              <div className="flex-1 animate-pulse rounded-xl border border-gray-200 bg-white" />
            ) : (
              <DataMatrixTable
                papers={visible}
                columns={columns}
                filters={filters}
                onFilter={(k, v) => setFilters((f) => ({ ...f, [k]: v }))}
                selected={selected}
                onToggle={toggle}
                onToggleAll={toggleAll}
                highlightId={highlightId}
              />
            )}
          </section>

          {splitOpen && (
            <div className="fixed inset-0 z-30 bg-gray-900/20 lg:hidden" onClick={() => setSplitOpen(false)} aria-hidden="true" />
          )}
          <CopilotPane
            open={splitOpen}
            onClose={() => setSplitOpen(false)}
            papers={loaded}
            claims={data?.claims ?? []}
            onCite={cite}
          />
        </main>
      </div>

      {toast && (
        <div role="status" className="fixed bottom-4 left-4 z-50 max-w-sm rounded-lg border border-gray-200 bg-white p-3 text-sm shadow-lg">
          <p>{toast.text}</p>
          {toast.href && <a href={toast.href} className="mt-1 inline-block font-medium text-[#1E3A8A] hover:underline">{toast.link}</a>}
        </div>
      )}
    </div>
  );
}
