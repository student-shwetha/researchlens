'use client';

import { useState } from 'react';
import { api } from '@/lib/client.js';

export default function SavePaperButton({ paperId, initiallySaved = false }) {
  const [saved, setSaved] = useState(initiallySaved);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    try {
      const res = await api(`/api/saved-papers?paper_id=${paperId}`, {
        method: saved ? 'DELETE' : 'POST',
        body: saved ? undefined : { paper_id: paperId },
      });
      setSaved(!saved);
      if (res?.message) window.dispatchEvent(new CustomEvent('researchlens:toast', { detail: res.message }));
    } catch (err) {
      window.alert(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button type="button" className={saved ? 'btn secondary' : 'btn'} disabled={busy} onClick={toggle}>
      {busy ? 'Saving…' : saved ? 'Saved to library' : 'Save paper'}
    </button>
  );
}
