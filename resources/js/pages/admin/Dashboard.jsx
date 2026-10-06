import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import AdminGuard from './AdminGuard';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api('/admin/stats');
      setData(res);
    } catch (err) {
      setError(err.message || 'Gagal memuat statistik dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const getIconForStat = (key) => {
    const k = key.toLowerCase();
    if (k.includes('user') || k.includes('pengguna')) return '👤';
    if (k.includes('soal') || k.includes('question')) return '📝';
    if (k.includes('materi') || k.includes('topic')) return '📚';
    if (k.includes('puzzle')) return '🧩';
    return '📊';
  };

  return (
    <AdminGuard>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', margin: '8px 0 0 0', fontSize: '0.9rem' }}>
            Ringkasan data dan evaluasi performa aplikasi B3Matika.
          </p>
        </div>
      </div>

      {error && !loading && (
        <div className="admin-error-state" style={{ marginBottom: '24px' }}>
          <span>⚠️</span> <div><strong>Terjadi Kesalahan</strong><br/>{error}</div>
          <button className="btn btn-sm" style={{ marginLeft: 'auto', background: '#fff', color: '#000' }} onClick={loadData}>Coba Lagi</button>
        </div>
      )}

      {loading ? (
        <>
          <div className="dashboard-stats-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="admin-card stat-card" style={{ padding: '20px' }}>
                <div className="skeleton skeleton-avatar" style={{ width: '48px', height: '48px', borderRadius: '12px' }}></div>
                <div className="skeleton skeleton-text" style={{ width: '80px' }}></div>
                <div className="skeleton skeleton-text" style={{ width: '40px', height: '32px' }}></div>
              </div>
            ))}
          </div>
          <div className="admin-card" style={{ minHeight: '300px' }}>
            <div className="skeleton skeleton-text" style={{ width: '250px', height: '24px', marginBottom: '20px' }}></div>
            <div className="skeleton skeleton-text" style={{ width: '100%', height: '40px' }}></div>
            <div className="skeleton skeleton-text" style={{ width: '100%', height: '40px' }}></div>
            <div className="skeleton skeleton-text" style={{ width: '100%', height: '40px' }}></div>
          </div>
        </>
      ) : data ? (
        <>
          <div className="dashboard-stats-grid">
            {Object.entries(data.stats).map(([k, v]) => (
              <div key={k} className="admin-card stat-card">
                <div className="stat-card-icon" style={{ background: 'var(--primary-gradient)', color: '#fff' }}>
                  {getIconForStat(k)}
                </div>
                <div className="stat-card-title">{k.replace(/_/g, ' ')}</div>
                <div className="stat-card-value">{v}</div>
              </div>
            ))}
          </div>

          <div className="admin-card">
            <h2 style={{ fontSize: '1.25rem', marginTop: 0, marginBottom: '8px' }}>Evaluasi Tingkat Kesulitan Soal</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
              Berdasarkan persentase jawaban benar pada percobaan pertama (minimal 3 jawaban per soal).
            </p>
            
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Soal</th>
                    <th>Total Jawaban</th>
                    <th>% Benar</th>
                    <th>Penilaian Sistem</th>
                  </tr>
                </thead>
                <tbody>
                  {data.evaluation.length > 0 ? (
                    data.evaluation.map((r) => (
                      <tr key={r.id}>
                        <td style={{ maxWidth: '300px' }}>
                          <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {r.text}
                          </div>
                        </td>
                        <td>{r.total}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '60px', height: '8px', background: 'var(--line)', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${r.rate}%`, background: r.rate > 70 ? 'var(--ok)' : r.rate < 40 ? 'var(--bad)' : 'var(--warn)' }}></div>
                            </div>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{r.rate}%</span>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${r.verdict === 'Terlalu Mudah' ? 'badge-ok' : r.verdict === 'Terlalu Sulit' ? 'badge-bad' : 'badge-warn'}`}>
                            {r.verdict}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4">
                        <div className="admin-empty-state" style={{ padding: '24px 0' }}>
                          <p style={{ margin: 0 }}>Belum cukup data jawaban dari pengguna untuk dievaluasi.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </AdminGuard>
  );
}
