'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { CloseIcon, ExternalIcon, InfoIcon } from './icons.jsx';

const nf = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });

const filterInput =
  'mt-2 h-8 w-full rounded-md border border-gray-200 bg-white px-2 text-xs font-normal text-[#1F2937] placeholder:text-gray-400 focus:border-[#1E3A8A] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/15';

function OriginBadge({ origin }) {
  const labels = {
    demo: 'Synthetic demo',
    abstract: 'Abstract-based',
    unavailable: 'Needs full text',
    source: 'Full-text source',
  };
  const label = labels[origin];
  if (!label) return null;
  const demo = origin === 'demo';
  return (
    <span className={`ml-1.5 inline-block rounded border px-1.5 py-px align-middle text-[11px] font-medium ${
      demo
        ? 'border-amber-200 bg-amber-50 text-amber-800'
        : origin === 'unavailable'
          ? 'border-gray-200 bg-gray-100 text-gray-600'
          : 'border-blue-200 bg-blue-50 text-blue-800'
    }`}>
      {label}
    </span>
  );
}

/** Popover showing the passage an extracted value came from. */
function SourcePopover({ source, onClose }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ top: -9999, left: -9999 });

  useLayoutEffect(() => {
    if (!source || !ref.current) return;
    const { rect } = source;
    const w = ref.current.offsetWidth;
    const h = ref.current.offsetHeight;
    const left = Math.min(Math.max(12, rect.left - w + rect.width), window.innerWidth - w - 12);
    const below = rect.bottom + 8;
    const top = below + h > window.innerHeight - 12 ? Math.max(12, rect.top - h - 8) : below;
    setPos({ top, left });
  }, [source]);

  useEffect(() => {
    if (!source) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    const onDown = (e) => { if (!ref.current?.contains(e.target)) onClose(); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onDown); };
  }, [source, onClose]);

  if (!source) return null;
  const { paper, label, cell } = source;

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label={`Source for ${label}`}
      style={{ top: pos.top, left: pos.left }}
      className="fixed z-50 w-[22rem] rounded-xl border border-gray-200 bg-white p-4 text-sm shadow-xl"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-[#1E3A8A]">{label}</p>
          <p className="mt-0.5 line-clamp-2 font-medium leading-snug">{paper.title}</p>
        </div>
        <button type="button" onClick={onClose} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600" aria-label="Close source">
          <CloseIcon />
        </button>
      </div>

      {cell.quote ? (
        <blockquote className="mt-3 border-l-2 border-[#1E3A8A] bg-[#F9FAFB] py-2 pl-3 pr-2 leading-relaxed text-gray-700">
          “{cell.quote}”
        </blockquote>
      ) : cell.origin === 'abstract' ? (
        <p className="mt-3 rounded-md border border-blue-200 bg-blue-50 p-2.5 leading-relaxed text-blue-900">
          This note is derived from the catalog abstract. It is not a verified quotation from the linked full text.
        </p>
      ) : cell.origin === 'unavailable' ? (
        <p className="mt-3 rounded-md border border-gray-200 bg-gray-50 p-2.5 leading-relaxed text-gray-700">
          The catalog abstract does not provide this information. Review the linked full text before drawing a conclusion.
        </p>
      ) : cell.origin === 'demo' ? (
        <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-2.5 leading-relaxed text-amber-900">
          Synthetic demonstration assumption only. This value is not reported by the paper and must not be cited as a research finding.
        </p>
      ) : (
        <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-2.5 leading-relaxed text-amber-900">
          Demo value: there is no source passage for this cell. Replace it with text from the paper.
        </p>
      )}

      <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div>
          <dt className="text-gray-500">Source</dt>
          <dd className="font-medium">{cell.section || '—'}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Confidence</dt>
          <dd className="font-medium tabular-nums">{cell.confidence == null ? '—' : `${Math.round(cell.confidence * 100)}%`}</dd>
        </div>
      </dl>

      <a href={`/papers/${paper.id}`} className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[#1E3A8A] hover:underline">
        Open the paper in ResearchLens <ExternalIcon className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}

function ExtractedCell({ paper, column, onShowSource }) {
  const cell = paper.fields[column.key];
  if (!cell) return <span className="text-gray-400">Not extracted</span>;

  const info = (
    <button
      type="button"
      onClick={(e) => onShowSource({ paper, label: column.label, cell, rect: e.currentTarget.getBoundingClientRect() })}
      className="ml-1 inline-flex align-middle text-gray-400 hover:text-[#1E3A8A] focus:outline-none focus-visible:text-[#1E3A8A]"
      aria-label={`Show source for ${column.label}`}
    >
      <InfoIcon className="h-4 w-4" />
    </button>
  );

  if (column.key === 'sample_size') {
    return (
      <div>
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-semibold tabular-nums text-[#1F2937]">
            {paper.sampleN != null ? nf.format(paper.sampleN) : '—'}
          </span>
          {info}
          <OriginBadge origin={cell.origin} />
        </div>
        <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{cell.text.replace(/^Demo value:\s*/, '')}</p>
      </div>
    );
  }

  return (
    <p className="leading-relaxed text-gray-700">
      <span className="line-clamp-4">{cell.text.replace(/^Demo value:\s*/, '')}</span>
      {info}
      <OriginBadge origin={cell.origin} />
    </p>
  );
}

/**
 * Spreadsheet-style matrix. The Paper column is frozen (position: sticky) so it
 * stays in view while the extracted columns scroll horizontally.
 */
export default function DataMatrixTable({
  papers, columns,
  filters, onFilter,
  selected, onToggle, onToggleAll,
  highlightId,
}) {
  const scrollRef = useRef(null);
  const rowRefs = useRef({});
  const [scrolledX, setScrolledX] = useState(false);
  const [source, setSource] = useState(null);

  useEffect(() => {
    if (highlightId && rowRefs.current[highlightId]) {
      rowRefs.current[highlightId].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [highlightId]);

  const allSelected = papers.length > 0 && papers.every((p) => selected.has(p.id));
  const someSelected = papers.some((p) => selected.has(p.id));

  const frozen = `sticky left-0 border-r border-gray-200 ${scrolledX ? 'shadow-[6px_0_8px_-6px_rgba(31,41,55,0.18)]' : ''}`;

  return (
    <>
      <div
        ref={scrollRef}
        onScroll={(e) => {
          setScrolledX(e.currentTarget.scrollLeft > 0);
          if (source) setSource(null);
        }}
        className="relative min-h-0 min-w-0 flex-1 overflow-auto rounded-xl border border-gray-200 bg-white"
      >
        <table className="w-max min-w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th scope="col" className={`${frozen} top-0 z-30 w-[220px] min-w-[220px] sm:w-[320px] sm:min-w-[320px] border-b bg-[#F9FAFB] px-4 py-3 text-left align-top`}>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => { if (el) el.indeterminate = !allSelected && someSelected; }}
                    onChange={() => onToggleAll(!allSelected)}
                    className="h-4 w-4 rounded border-gray-300 accent-[#1E3A8A]"
                    aria-label="Select all papers for the Copilot and export"
                  />
                  <span className="font-semibold text-[#1F2937]">Paper title &amp; year</span>
                </div>
                <label className="sr-only" htmlFor="filter-paper">Filter by title or author</label>
                <input id="filter-paper" value={filters.paper || ''} onChange={(e) => onFilter('paper', e.target.value)} placeholder="Filter title or author" className={filterInput} />
              </th>
              {columns.map((c) => (
                <th key={c.key} scope="col" className={`sticky top-0 z-20 ${c.width} border-b border-gray-200 bg-[#F9FAFB] px-4 py-3 text-left align-top`}>
                  <span className="font-semibold text-[#1F2937]">{c.label}</span>
                  <label className="sr-only" htmlFor={`filter-${c.key}`}>Filter {c.label}</label>
                  {c.key === 'sample_size' ? (
                    <input id={`filter-${c.key}`} type="number" min="0" inputMode="numeric" value={filters[c.key] || ''} onChange={(e) => onFilter(c.key, e.target.value)} placeholder="Minimum N" className={filterInput} />
                  ) : (
                    <input id={`filter-${c.key}`} value={filters[c.key] || ''} onChange={(e) => onFilter(c.key, e.target.value)} placeholder={`Filter ${c.label.toLowerCase()}`} className={filterInput} />
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {papers.map((p) => {
              const hl = highlightId === p.id;
              const rowBg = hl ? 'bg-[#EEF2FA]' : 'bg-white';
              return (
                <tr key={p.id} ref={(el) => { rowRefs.current[p.id] = el; }} className="group">
                  <th scope="row" className={`${frozen} z-10 w-[220px] min-w-[220px] sm:w-[320px] sm:min-w-[320px] border-b px-4 py-4 text-left align-top font-normal transition-colors ${rowBg} group-hover:bg-[#F9FAFB]`}>
                    <div className="flex gap-3">
                      <input
                        type="checkbox"
                        checked={selected.has(p.id)}
                        onChange={() => onToggle(p.id)}
                        className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 accent-[#1E3A8A]"
                        aria-label={`Select ${p.title}`}
                      />
                      <div className="min-w-0">
                        <a href={`/papers/${p.id}`} className="font-semibold leading-snug text-[#1F2937] hover:text-[#1E3A8A] hover:underline">
                          {p.title}
                        </a>
                        <p className="mt-1 text-xs text-gray-500">
                          <span className="font-semibold tabular-nums text-[#1E3A8A]">{p.year ?? 'n.d.'}</span>
                          {p.journal ? <span>, {p.journal}</span> : null}
                        </p>
                        <p className="mt-1 truncate text-xs text-gray-500" title={p.authors || ''}>{p.authors}</p>
                      </div>
                    </div>
                  </th>
                  {columns.map((c) => (
                    <td key={c.key} className={`${c.width} border-b border-gray-200 px-4 py-4 align-top transition-colors ${rowBg} group-hover:bg-[#F9FAFB]`}>
                      <ExtractedCell paper={p} column={c} onShowSource={setSource} />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>

        {papers.length === 0 && (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <p className="font-medium">No papers match these filters.</p>
            <p className="mt-1 text-sm text-gray-500">Clear the search box or a column filter to see papers again.</p>
          </div>
        )}
      </div>

      <SourcePopover source={source} onClose={() => setSource(null)} />
    </>
  );
}
