'use client';
import { useRef } from 'react';
import { CloseIcon, FolderIcon, LayersIcon, TemplateIcon, UploadIcon } from './icons.jsx';

function NavSection({ title, children }) {
  return (
    <div>
      <h2 className="px-3 pb-1.5 text-xs font-medium text-gray-500">{title}</h2>
      <ul className="space-y-0.5">{children}</ul>
    </div>
  );
}

function NavItem({ icon: Icon, label, count, active, onClick, hint }) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        title={hint}
        className={`group flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A]/40 ${
          active ? 'bg-[#1E3A8A]/[0.07] font-medium text-[#1E3A8A]' : 'text-gray-600 hover:bg-gray-100 hover:text-[#1F2937]'
        }`}
      >
        <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-[#1E3A8A]' : 'text-gray-400 group-hover:text-gray-500'}`} />
        <span className="min-w-0 flex-1 truncate">{label}</span>
        {count != null && <span className="text-xs tabular-nums text-gray-400">{count}</span>}
      </button>
    </li>
  );
}

/**
 * Workspace folders = research domains · Extracted collections = topics
 * Saved templates = column sets. Sticky on large screens, a drawer below lg.
 */
export default function Sidebar({
  open, onClose,
  total, domains, topics, templates,
  scope, onScope,
  templateId, onTemplate,
  onUpload, onUploadDenied, uploading, isAdmin,
}) {
  const fileRef = useRef(null);

  const content = (
    <div className="flex h-full flex-col gap-6 overflow-y-auto px-3 py-5">
      <div className="px-1">
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => { onUpload(Array.from(e.target.files || [])); e.target.value = ''; }}
        />
        <button
          type="button"
          onClick={() => (isAdmin ? fileRef.current?.click() : onUploadDenied())}
          disabled={uploading}
          title={isAdmin ? 'Choose PDFs to add' : 'Only admins can add papers'}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#1E3A8A]/40 bg-white px-3 py-2.5 text-sm font-medium text-[#1E3A8A] hover:border-[#1E3A8A] hover:bg-[#1E3A8A]/[0.04] disabled:cursor-wait disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A]/40"
        >
          <UploadIcon />
          {uploading ? 'Uploading PDF…' : 'Upload PDF'}
        </button>
        {!isAdmin && <p className="mt-2 text-center text-xs text-gray-500">Administrator access required</p>}
      </div>

      <NavSection title="Workspace folders">
        <NavItem icon={FolderIcon} label="All papers" count={total} active={!scope} onClick={() => onScope(null)} />
        {domains.map((d) => (
          <NavItem key={d.name} icon={FolderIcon} label={d.name} count={d.count}
            active={scope?.type === 'domain' && scope.value === d.name}
            onClick={() => onScope({ type: 'domain', value: d.name })} />
        ))}
      </NavSection>

      <NavSection title="Extracted collections">
        {topics.map((t) => (
          <NavItem key={t.name} icon={LayersIcon} label={t.name} count={t.count}
            active={scope?.type === 'topic' && scope.value === t.name}
            onClick={() => onScope({ type: 'topic', value: t.name })} />
        ))}
      </NavSection>

      <NavSection title="Saved templates">
        {templates.map((t) => (
          <NavItem key={t.id} icon={TemplateIcon} label={t.name} hint={t.description}
            active={templateId === t.id} onClick={() => onTemplate(t.id)} />
        ))}
      </NavSection>

      <a href="/papers" className="mt-auto rounded-lg border border-gray-200 bg-white p-3 text-xs leading-relaxed text-gray-500 hover:border-[#1E3A8A]/40">
        Extractions come from the <span className="font-medium text-[#1F2937]">paper_extraction</span> table.
        <span className="mt-1 block font-medium text-[#1E3A8A]">Browse all papers in ResearchLens</span>
      </a>
    </div>
  );

  return (
    <>
      <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 border-r border-gray-200 bg-[#F9FAFB] lg:block">
        {content}
      </aside>

      <div className={`fixed inset-0 z-40 lg:hidden ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
        <div className={`absolute inset-0 bg-gray-900/30 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
        <aside
          className={`absolute inset-y-0 left-0 w-72 bg-[#F9FAFB] shadow-xl transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}
          aria-label="Navigation"
        >
          <div className="flex h-16 items-center justify-end border-b border-gray-200 px-3">
            <button type="button" onClick={onClose} className="rounded-md p-2 text-gray-500 hover:bg-gray-100" aria-label="Close navigation">
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="h-[calc(100%-4rem)]">{content}</div>
        </aside>
      </div>
    </>
  );
}
