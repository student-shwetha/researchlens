'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/client.js';
import PaperCard from '@/components/PaperCard.js';

export default function LibraryClient({ initialItems = [] }) {
  const [items, setItems] = useState(initialItems);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    try {
      setError('');
      setLoading(true);
      const data = await api('/api/saved-papers');
      setItems(data.saved || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function removeSaved(id) {
    try {
      await api(`/api/saved-papers?paper_id=${id}`, { method: 'DELETE' });
      setItems((current) => current.filter((paper) => Number(paper.paper_id) !== Number(id)));
    } catch (err) {
      setError(err.message);
    }
  }

  if (error) {
    return <div className="alert error">{error}</div>;
  }

  return (
    <>
      {loading && <p className="muted">Loading your library…</p>}
      {!loading && items.length === 0 && (
        <div className="card">
          <p style={{ margin: 0 }}>Your library is empty. Save a paper to build a reading list.</p>
        </div>
      )}

      <div className="stack">
        {items.map((paper) => (
          <div key={paper.paper_id}>
            <PaperCard paper={paper} />
            <div style={{ marginTop: 8 }}>
              <button type="button" className="btn secondary" onClick={() => removeSaved(paper.paper_id)}>
                Remove from library
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
