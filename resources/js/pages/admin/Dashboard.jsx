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

  const getLabelForStat = (key) => {
    const k = key.toLowerCase();
    if (k.includes('user') || k.includes('pengguna')) return 'Total Pengguna';
    if (k.includes('soal') || k.includes('question')) return 'Total Soal';
    if (k.includes('materi') || k.includes('topic')) return 'Total Materi';
    if (k.includes('puzzle')) return 'Total Puzzle';
    // Fallback: capitalize dan replace underscore
    return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

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
            {Object.entries(data.stats).map(([k, v], i) => {
              const gradients = [
                'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
                'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
                'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)'
              ];
              const bg = gradients[i % gradients.length];
              return (
                <div key={k} className="admin-card stat-card stat-card-hover" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '24px' }}>
                  <div>
                    <div className="stat-card-title">{getLabelForStat(k)}</div>
                    <div className="stat-card-value" style={{ marginTop: '8px' }}>{v}</div>
                  </div>
                  <div className="stat-card-icon-wrap" style={{ background: bg, color: '#fff' }}>
                    {getIconForStat(k)}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="admin-card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--line)' }}>
              <h2 style={{ fontSize: '1.25rem', marginTop: 0, marginBottom: '8px' }}>Evaluasi Tingkat Kesulitan Soal</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0' }}>
                Berdasarkan persentase jawaban benar pada percobaan pertama (minimal 3 jawaban per soal).
              </p>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: 'var(--surface)' }}>
                  <tr>
                    <th style={{ padding: '16px 24px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Soal</th>
                    <th style={{ padding: '16px 24px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Jawaban</th>
                    <th style={{ padding: '16px 24px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tingkat Keberhasilan</th>
                    <th style={{ padding: '16px 24px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Penilaian</th>
                  </tr>
                </thead>
                <tbody>
                  {data.evaluation.length > 0 ? (
                    data.evaluation.map((r) => (
                      <tr key={r.id} style={{ borderBottom: '1px solid var(--line)' }}>
                        <td style={{ padding: '16px 24px', maxWidth: '300px' }}>
                          <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: '500' }}>
                            {r.text}
                          </div>
                        </td>
                        <td style={{ padding: '16px 24px', textAlign: 'center', fontWeight: '600' }}>{r.total}</td>
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ flex: 1, height: '8px', background: 'var(--line)', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${r.rate}%`, background: r.rate > 70 ? '#10b981' : r.rate < 40 ? '#ef4444' : '#f59e0b', transition: 'width 1s ease-in-out' }}></div>
                            </div>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, minWidth: '40px', textAlign: 'right' }}>{r.rate}%</span>
                          </div>
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <span className={`badge ${r.verdict === 'Terlalu Mudah' ? 'badge-ok' : r.verdict === 'Terlalu Sulit' ? 'badge-bad' : 'badge-warn'}`} style={{ padding: '6px 12px' }}>
                            {r.verdict}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4">
                        <div className="admin-empty-state" style={{ padding: '48px 24px' }}>
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
