import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';

export default function PuzzleList() {
  const [d, setD] = useState(null);
  useEffect(() => { api('/puzzles').then(setD); }, []);
  if (!d) return <p className="muted">Memuat…</p>;
  return (
    <>
      <h1>🧩 Puzzle</h1>
      <p className="muted mb">Selesaikan puzzle untuk mendapat poin tambahan.</p>
      <div className="grid-2">
        {d.puzzles.map((p) => (
          <Link key={p.id} to={`/puzzle/${p.id}`} className="card topic-card">
            <div className="row between">
              <span className="tag">{p.type}</span>
              {d.solved.includes(p.id) ? <span className="tag tag-ok">✓ Selesai</span> : <span className="pts">+{p.points} poin</span>}
            </div>
            <h3>{p.title}</h3>
            <p className="muted small">{p.description}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
