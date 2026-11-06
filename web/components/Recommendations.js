'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/client.js';

export default function Recommendations({ paperId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignored = false;
    api(`/api/papers/${paperId}/recommendations`)
      .then((data) => { if (!ignored) setItems(data.recommendations || []); })
      .catch(() => setItems([]))
      .finally(() => { if (!ignored) setLoading(false); });
    return () => { ignored = true; };
  }, [paperId]);

  if (loading) return <p className="muted">Loading recommendations…</p>;
  if (!items.length) return <p className="muted">No strong related papers found yet.</p>;

  return (
    <div className="stack">
      {items.map((paper) => (
        <div key={paper.paper_id} className="card">
          <Link href={`/papers/${paper.paper_id}`}><strong>{paper.title}</strong></Link>
          <div className="small muted">{paper.authors || 'Unknown authors'} · {paper.publication_year || '—'}</div>
          {paper.topics && <div className="small muted">{paper.topics}</div>}
        </div>
      ))}
    </div>
  );
}
