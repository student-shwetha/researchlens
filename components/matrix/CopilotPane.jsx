'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CloseIcon, SendIcon, SparkleIcon } from './icons.jsx';

const PROMPTS = ['Compare the sample sizes', 'What are the main limitations?', 'Which methods were used?', 'Which paper is about query optimizers?'];

/** Agreement across the loaded papers for one claim (paper_claim_stance). */
function ConsensusMeter({ claims, papers }) {
  const [i, setI] = useState(0);
  const claim = claims[i];
  const counts = useMemo(() => {
    const c = { supports: 0, mixed: 0, contradicts: 0 };
    if (claim) for (const p of papers) { const s = claim.stances[p.id]; if (s) c[s] += 1; }
    return c;
  }, [claim, papers]);
  const rated = counts.supports + counts.mixed + counts.contradicts;
  const pct = rated ? Math.round((counts.supports / rated) * 100) : 0;

  if (!claim) return null;
  const seg = (n) => `${rated ? (n / rated) * 100 : 0}%`;

  return (
    <section aria-label="Consensus meter" className="border-b border-gray-200 px-5 py-4">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-semibold">Consensus meter</h3>
        {claim.basis === 'demo' && <span className="text-[11px] text-amber-800">Demo stance labels</span>}
      </div>
      <label htmlFor="claim" className="sr-only">Claim</label>
      <select
        id="claim"
        value={i}
        onChange={(e) => setI(Number(e.target.value))}
        className="mt-2 w-full rounded-md border border-gray-200 bg-white px-2 py-1.5 text-sm text-gray-700 focus:border-[#1E3A8A] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/15"
      >
        {claims.map((c, idx) => <option key={c.claim} value={idx}>{c.claim}</option>)}
      </select>

      <div className="mt-3 flex items-end gap-3">
        <p className="text-4xl font-semibold tabular-nums leading-none text-[#1E3A8A]">{rated ? `${pct}%` : '—'}</p>
        <p className="pb-0.5 text-sm text-gray-500">
          {rated ? `${counts.supports} of ${rated} loaded papers agree` : 'No loaded paper is rated on this claim'}
        </p>
      </div>

      <div className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-gray-100" role="img" aria-label={`${counts.supports} support, ${counts.mixed} mixed, ${counts.contradicts} contradict`}>
        <span className="bg-[#1E3A8A] transition-all duration-500" style={{ width: seg(counts.supports) }} />
        <span className="bg-[#93A4CC] transition-all duration-500" style={{ width: seg(counts.mixed) }} />
        <span className="bg-gray-300 transition-all duration-500" style={{ width: seg(counts.contradicts) }} />
      </div>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
        <li className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#1E3A8A]" />Supports {counts.supports}</li>
        <li className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#93A4CC]" />Mixed {counts.mixed}</li>
        <li className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-gray-300" />Contradicts {counts.contradicts}</li>
      </ul>
    </section>
  );
}

function Message({ m, onCite }) {
  if (m.role === 'user') {
    return (
      <div className="flex justify-end">
        <p className="max-w-[85%] rounded-2xl rounded-br-md bg-[#1E3A8A] px-3.5 py-2 text-sm text-white">{m.text}</p>
      </div>
    );
  }
  return (
    <div className="flex gap-2.5">
      <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#1E3A8A]/10 text-[#1E3A8A]">
        <SparkleIcon className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className={`text-sm leading-relaxed ${m.error ? 'text-red-700' : 'text-[#1F2937]'}`}>{m.text}</p>
        {m.citations?.length > 0 && (
          <ol className="mt-2 space-y-2">
            {m.citations.map((c, idx) => (
              <li key={`${c.paperId}-${idx}`} className="rounded-lg border border-gray-200 bg-white p-2.5">
                <button
                  type="button"
                  onClick={() => onCite(c.paperId)}
                  className="text-left text-xs font-semibold text-[#1E3A8A] hover:underline"
                  title="Highlight this paper in the table"
                >
                  [{idx + 1}] {c.title}
                </button>
                <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-gray-600">{c.snippet.replace(/^Demo value:\s*/, '')}</p>
                <div className="mt-1 flex gap-2 text-[11px] text-gray-500">
                  {c.score != null && <span className="tabular-nums">{Math.round(c.score * 100)}% match</span>}
                  {c.origin === 'demo' && <span className="font-semibold text-amber-800">Synthetic demo — not paper-reported</span>}
                  {c.origin === 'abstract' && <span className="text-blue-800">Catalog abstract</span>}
                  {c.origin === 'unavailable' && <span>Full-text review needed</span>}
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

/**
 * Answers come from stored extraction fields in MySQL; no text is generated.
 */
export default function CopilotPane({ open, onClose, papers, claims, onCite }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const listRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 250);
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  async function ask(question) {
    const q = question.trim();
    if (!q || busy) return;
    setText('');
    setMessages((m) => [...m, { role: 'user', text: q }]);
    if (!papers.length) {
      setMessages((m) => [...m, { role: 'assistant', text: 'Select at least one paper in the table first.', error: true }]);
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/matrix/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, paperIds: papers.map((p) => p.id) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
      setMessages((m) => [...m, { role: 'assistant', text: data.answer, citations: data.citations }]);
    } catch (err) {
      setMessages((m) => [...m, { role: 'assistant', text: err.message, error: true }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <aside
      aria-label="AI Copilot"
      aria-hidden={!open}
      className={`fixed inset-y-0 right-0 z-40 w-full border-l border-gray-200 bg-[#F9FAFB] shadow-2xl transition-[transform,width] duration-300 ease-out sm:w-[420px]
        lg:static lg:z-auto lg:h-full lg:shadow-none lg:translate-x-0 lg:overflow-hidden
        ${open ? 'translate-x-0 lg:w-[35%] lg:min-w-[320px]' : 'translate-x-full lg:hidden'}`}
    >
      <div className="flex h-full w-full min-w-[320px] flex-col">
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-5">
          <div className="flex items-center gap-2">
            <SparkleIcon className="h-4 w-4 text-[#1E3A8A]" />
            <h2 className="text-sm font-semibold">Copilot</h2>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs tabular-nums text-gray-600">
              {papers.length} {papers.length === 1 ? 'paper' : 'papers'} loaded
            </span>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100" aria-label="Close Copilot" tabIndex={open ? 0 : -1}>
            <CloseIcon />
          </button>
        </div>

        <div className="bg-white">
          <ConsensusMeter claims={claims} papers={papers} />
        </div>

        <div ref={listRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4" aria-live="polite">
          {messages.length === 0 && (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-4 text-sm text-gray-600">
              <p>
                Ask about the {papers.length} selected {papers.length === 1 ? 'paper' : 'papers'}.
                Ask about extracted summaries, methods, sample sizes, or limitations. Matches are ranked against stored fields.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {PROMPTS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => ask(p)}
                    tabIndex={open ? 0 : -1}
                    className="rounded-full border border-gray-200 bg-[#F9FAFB] px-3 py-1 text-xs text-[#1F2937] hover:border-[#1E3A8A]/40 hover:text-[#1E3A8A]"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, idx) => <Message key={idx} m={m} onCite={onCite} />)}
          {busy && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="flex gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#1E3A8A] [animation-delay:-0.2s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#1E3A8A] [animation-delay:-0.1s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#1E3A8A]" />
              </span>
              Reading {papers.length} papers…
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); ask(text); }}
          className="shrink-0 border-t border-gray-200 bg-white p-3"
        >
          <div className="flex items-end gap-2 rounded-xl border border-gray-200 bg-[#F9FAFB] p-1.5 focus-within:border-[#1E3A8A] focus-within:ring-2 focus-within:ring-[#1E3A8A]/15">
            <label htmlFor="copilot-input" className="sr-only">Ask the Copilot</label>
            <textarea
              id="copilot-input"
              ref={inputRef}
              rows={1}
              value={text}
              maxLength={500}
              tabIndex={open ? 0 : -1}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(text); } }}
              placeholder="Ask about the selected papers' extracted fields..."
              className="max-h-32 min-h-[2.25rem] flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-[#1F2937] placeholder:text-gray-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={busy || !text.trim()}
              tabIndex={open ? 0 : -1}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#1E3A8A] text-white hover:bg-[#1A3278] disabled:opacity-40"
              aria-label="Send"
            >
              <SendIcon />
            </button>
          </div>
          <p className="mt-1.5 px-1 text-[11px] text-gray-500">Responses use stored extraction fields; no text is generated.</p>
        </form>
      </div>
    </aside>
  );
}
