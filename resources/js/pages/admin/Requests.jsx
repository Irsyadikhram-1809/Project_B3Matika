import { useEffect, useState } from 'react';
import { Mailbox, AlertTriangle, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';
import AdminGuard from './AdminGuard';
import { useAuth } from '@/context/AuthContext';

export default function Requests() {
  const { user: currentUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [msg, setMsg] = useState('');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api('/admin/requests');
      setRequests(data.requests || []);
    } catch (err) {
      setError(err.message || 'Gagal memuat daftar pengajuan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const act = async (id, action) => {
    try { 
      const res = await api(`/admin/requests/${id}/${action}`, { 
        method: 'POST' 
      }); 
      setMsg(res.message || 'Tindakan berhasil dilakukan'); 
      load(); 
      setTimeout(() => setMsg(''), 3000);
    } catch (e) { 
      setError(e.message); 
      setTimeout(() => setError(null), 3000);
    } 
  };

  return (
    <AdminGuard>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Pengajuan Admin</h1>
          <p style={{ color: 'var(--text-muted)', margin: '8px 0 0 0', fontSize: '0.9rem' }}>
            Tinjau dan proses pengajuan pengguna untuk menjadi Admin.
          </p>
        </div>
      </div>

      {msg && <div className="alert" style={{ background: 'var(--ok-bg)', color: 'var(--ok-text)', border: '1px solid var(--ok-border)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={18} /> {msg}</div>}
      
      {error && !loading && (
        <div className="admin-error-state" style={{ marginBottom: '24px' }}>
          <span><AlertTriangle size={24} color="var(--danger)" /></span> <div><strong>Terjadi Kesalahan</strong><br/>{error}</div>
          <button className="btn btn-sm" style={{ marginLeft: 'auto', background: '#fff', color: '#000' }} onClick={load}>Coba Lagi</button>
        </div>
      )}

      <div className="admin-card">
        {loading ? (
          <div style={{ padding: '20px' }}>
            <p className="muted">Memuat pengajuan...</p>
          </div>
        ) : requests.length === 0 && !error ? (
          <div className="admin-empty-state">
            <div className="admin-empty-icon" style={{ display: 'flex', justifyContent: 'center' }}><Mailbox size={48} color="var(--text-muted)" /></div>
            <h3 style={{ margin: '0 0 8px 0', color: 'var(--text)' }}>Belum ada pengajuan</h3>
            <p style={{ margin: 0 }}>Daftar pengajuan admin akan muncul di sini.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Pengguna</th>
                  <th>Alasan</th>
                  <th>Tanggal</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{r.name || 'Pengguna B3Matika'}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{r.email}</div>
                    </td>
                    <td style={{ maxWidth: '300px', whiteSpace: 'pre-wrap' }}>{r.request_reason}</td>
                    <td className="small muted">
                      {new Date(r.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td>
                      <span className={`badge ${r.status === 'pending' ? 'badge-warn' : r.status === 'approved' ? 'badge-ok' : 'badge-bad'}`}>
                        {r.status === 'pending' ? 'Menunggu' : r.status === 'approved' ? 'Disetujui' : 'Ditolak'}
                      </span>
                    </td>
                    <td style={{ display: 'flex', gap: '8px' }}>
                      {r.status === 'pending' && currentUser?.role === 'superadmin' ? (
                        <>
                          <button 
                            className="btn btn-sm" 
                            style={{ background: 'var(--ok)', color: '#fff', border: 'none' }}
                            onClick={() => {
                              if (confirm('Setujui pengajuan ini? Pengguna akan menjadi Admin.')) {
                                act(r.id, 'approve');
                              }
                            }}
                          >
                            Setujui
                          </button>
                          <button 
                            className="btn btn-sm btn-danger" 
                            onClick={() => {
                              if (confirm('Tolak pengajuan ini?')) {
                                act(r.id, 'reject');
                              }
                            }}
                          >
                            Tolak
                          </button>
                        </>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          {r.status !== 'pending' ? 'Selesai' : 'Hanya Superadmin'}
                        </span>
                      )}
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
