import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import AdminGuard from './AdminGuard';

export default function Dashboard() {
  const [d, setD] = useState(null);
  useEffect(() => { api('/admin/stats').then(setD).catch(() => {}); }, []);
  return (
    <AdminGuard>
      <h1>Dashboard Admin</h1>
      <div className="stats">
        {d && Object.entries(d.stats).map(([k, v]) => <div key={k} className="card stat"><span className="muted small">{k}</span><b>{v}</b></div>)}
      </div>
      <h2 className="section-title">Evaluasi Tingkat Kesulitan Soal</h2>
      <p className="muted small mb">Berdasarkan % jawaban benar pada percobaan pertama (minimal 3 jawaban).</p>
      <div className="card table-wrap">
        <table>
          <thead><tr><th>Soal</th><th>Jawaban</th><th>% Benar</th><th>Penilaian</th></tr></thead>
          <tbody>
            {d?.evaluation.map((r) => <tr key={r.id}><td>{r.text}</td><td>{r.total}</td><td>{r.rate}%</td><td>{r.verdict}</td></tr>)}
            {d && !d.evaluation.length && <tr><td colSpan="4" className="muted">Belum cukup data.</td></tr>}
          </tbody>
        </table>
      </div>
    </AdminGuard>
  );
}
