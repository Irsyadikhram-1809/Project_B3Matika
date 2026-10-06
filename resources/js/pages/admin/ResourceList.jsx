import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '@/lib/api';
import NotFound from '@/components/NotFound';
import AdminGuard from './AdminGuard';
import { RESOURCES } from './config';

export default function ResourceList() {
  const { res } = useParams();
  const cfg = RESOURCES[res];
  
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    if (!cfg) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api(`/admin/${res}`);
      setRows(data.rows || []);
    } catch (err) {
      setError(err.message || `Gagal memuat data ${cfg.label}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [res]);

  if (!cfg) return <NotFound />;

  const short = (v) => (typeof v === 'string' && v.length > 70 ? v.slice(0, 70) + '…' : v);

  return (
    <AdminGuard>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">{cfg.label}</h1>
          <p style={{ color: 'var(--text-muted)', margin: '8px 0 0 0', fontSize: '0.9rem' }}>
            Kelola daftar {cfg.label.toLowerCase()} dalam sistem.
          </p>
        </div>
        <Link className="btn" style={{ background: 'var(--navy)', color: '#fff' }} to={`/panel-rahasia/${res}/create`}>
          + Tambah Data
        </Link>
      </div>

      {error && !loading && (
        <div className="admin-error-state" style={{ marginBottom: '24px' }}>
          <span>⚠️</span> <div><strong>Terjadi Kesalahan</strong><br/>{error}</div>
          <button className="btn btn-sm" style={{ marginLeft: 'auto', background: '#fff', color: '#000' }} onClick={load}>Coba Lagi</button>
        </div>
      )}

      <div className="admin-card">
        {loading ? (
          <div style={{ padding: '20px' }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: '20px', marginBottom: '20px', alignItems: 'center' }}>
                <div className="skeleton skeleton-text" style={{ width: '150px', margin: 0 }}></div>
                <div className="skeleton skeleton-text" style={{ width: '250px', margin: 0 }}></div>
                <div className="skeleton skeleton-text" style={{ width: '100px', margin: 0 }}></div>
              </div>
            ))}
          </div>
        ) : rows.length === 0 && !error ? (
          <div className="admin-empty-state">
            <div className="admin-empty-icon">📂</div>
            <h3 style={{ margin: '0 0 8px 0', color: 'var(--text)' }}>Data masih kosong</h3>
            <p style={{ margin: 0, marginBottom: '20px' }}>Belum ada data {cfg.label.toLowerCase()} yang ditambahkan.</p>
            <Link className="btn" style={{ background: 'var(--navy)', color: '#fff' }} to={`/panel-rahasia/${res}/create`}>
              Mulai Tambah Data
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  {cfg.cols.map((c) => (
                    <th key={c} style={{ textTransform: 'capitalize' }}>{c.replace(/_/g, ' ')}</th>
                  ))}
                  <th style={{ width: '160px' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    {cfg.cols.map((c) => (
                      <td key={c}>
                        {typeof r[c] === 'boolean' ? (
                          <span className={`badge ${r[c] ? 'badge-ok' : 'badge-bad'}`}>
                            {r[c] ? 'Ya' : 'Tidak'}
                          </span>
                        ) : (
                          <span title={String(r[c])}>{short(r[c])}</span>
                        )}
                      </td>
                    ))}
                    <td style={{ display: 'flex', gap: '8px' }}>
                      <Link className="btn btn-sm btn-outline" to={`/panel-rahasia/${res}/${r.id}/edit`}>Ubah</Link>
                      <button 
                        className="btn btn-sm btn-danger" 
                        onClick={async () => { 
                          if (confirm('Hapus data ini secara permanen?')) { 
                            try {
                              await api(`/admin/${res}/${r.id}`, { method: 'DELETE' }); 
                              load(); 
                            } catch (e) {
                              setError(e.message);
                            }
                          } 
                        }}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
