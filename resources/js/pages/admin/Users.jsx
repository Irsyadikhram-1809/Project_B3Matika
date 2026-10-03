import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import AdminGuard from './AdminGuard';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [msg, setMsg] = useState('');
  const load = () => api('/admin/users').then((d) => setUsers(d.users)).catch(() => {});
  useEffect(() => { load(); }, []);
  const act = async (fn) => { try { await fn(); setMsg(''); load(); } catch (e) { setMsg(e.message); } };
  return (
    <AdminGuard>
      <h1>Pengguna</h1>
      {msg && <div className="alert">{msg}</div>}
      <div className="card table-wrap">
        <table>
          <thead><tr><th>Nama</th><th>Email</th><th>Peran</th><th>Poin</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td><td>{u.email}</td><td>{u.role}</td><td>{u.points}</td>
                <td>{u.is_active ? 'Aktif' : 'Diblokir'}</td>
                <td className="row">
                  <button className="btn btn-sm btn-outline" onClick={() => act(() => api(`/admin/users/${u.id}/toggle`, { method: 'POST' }))}>{u.is_active ? 'Blokir' : 'Aktifkan'}</button>
                  <button className="btn btn-sm btn-danger" onClick={() => confirm('Hapus pengguna ini?') && act(() => api(`/admin/users/${u.id}`, { method: 'DELETE' }))}>Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminGuard>
  );
}
