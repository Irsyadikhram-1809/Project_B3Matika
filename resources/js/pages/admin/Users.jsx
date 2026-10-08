import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import AdminGuard from './AdminGuard';
import { useAuth } from '@/context/AuthContext';

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [msg, setMsg] = useState('');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api('/admin/users');
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message || 'Gagal memuat data pengguna');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const isOnline = (lastSeen) => {
    if (!lastSeen) return false;
    const diff = Date.now() - new Date(lastSeen).getTime();
    return diff < 5 * 60 * 1000;
  };

  const act = async (fn) => {
    try { 
      await fn(); 
      setMsg('Tindakan berhasil dilakukan'); 
      load(); 
      setTimeout(() => setMsg(''), 3000);
    } catch (e) { 
      setError(e.message); 
    } 
  };

  return (
    <AdminGuard>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Manajemen Pengguna</h1>
          <p style={{ color: 'var(--text-muted)', margin: '8px 0 0 0', fontSize: '0.9rem' }}>
            Kelola daftar pengguna, peran, dan status akun.
          </p>
        </div>
      </div>

      {msg && <div className="alert" style={{ background: 'var(--ok-bg)', color: 'var(--ok-text)', border: '1px solid var(--ok-border)', marginBottom: '20px' }}>✅ {msg}</div>}
      
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
                <div className="skeleton skeleton-avatar"></div>
                <div className="skeleton skeleton-text" style={{ width: '200px', margin: 0 }}></div>
                <div className="skeleton skeleton-text" style={{ width: '150px', margin: 0 }}></div>
                <div className="skeleton skeleton-text" style={{ width: '80px', margin: 0 }}></div>
              </div>
            ))}
          </div>
        ) : users.length === 0 && !error ? (
          <div className="admin-empty-state">
            <div className="admin-empty-icon">👥</div>
            <h3 style={{ margin: '0 0 8px 0', color: 'var(--text)' }}>Belum ada pengguna</h3>
            <p style={{ margin: 0 }}>Daftar pengguna akan muncul di sini ketika ada yang mendaftar.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Pengguna</th>
                  <th>Peran</th>
                  <th>Poin</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {u.name}
                        <span
                          className={`user-status-dot ${isOnline(u.last_seen) ? 'online' : 'offline'}`}
                          aria-label={isOnline(u.last_seen) ? 'Sedang online' : 'Offline'}
                          title={isOnline(u.last_seen) ? 'Online' : 'Offline'}
                          role="img"
                        />
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.email}</div>
                    </td>
                    <td>
                      {currentUser?.role === 'superadmin' && u.role !== 'superadmin' ? (
                        <select 
                          className="input" 
                          style={{ padding: '4px 8px', width: 'auto', textTransform: 'capitalize' }}
                          value={u.role}
                          onChange={(e) => act(() => api(`/admin/users/${u.id}/role`, { method: 'PATCH', body: { role: e.target.value } }))}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <span className={`badge ${u.role === 'admin' || u.role === 'superadmin' ? 'badge-warn' : 'badge-ok'}`} style={{ textTransform: 'capitalize' }}>
                          {u.role}
                        </span>
                      )}
                    </td>
                    <td><strong style={{ color: 'var(--blue)' }}>{u.points}</strong></td>
                    <td>
                      <span className={`badge ${u.is_active ? 'badge-ok' : 'badge-bad'}`}>
                        {u.is_active ? 'Aktif' : 'Diblokir'}
                      </span>
                    </td>
                    <td className="aksi-cell">
                      {u.role !== 'superadmin' ? (
                        <div className="aksi-cell-inner">
                          <button 
                            className="btn btn-sm btn-outline" 
                            onClick={() => act(() => api(`/admin/users/${u.id}/block`, { method: 'PATCH', body: { blocked: u.is_active } }))}
                          >
                            {u.is_active ? 'Blokir' : 'Aktifkan'}
                          </button>
                          <button 
                            className="btn btn-sm btn-danger" 
                            onClick={() => {
                              if(confirm('Hapus pengguna ini secara permanen?')) {
                                act(() => api(`/admin/users/${u.id}`, { method: 'DELETE' }));
                              }
                            }}
                          >
                            Hapus
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Protected</span>
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
