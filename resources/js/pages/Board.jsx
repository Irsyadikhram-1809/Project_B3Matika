import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function Board() {
  const [users, setUsers] = useState(null);
  useEffect(() => { api('/leaderboard').then((d) => setUsers(d.users)); }, []);
  const medal = ['🥇', '🥈', '🥉'];
  return (
    <>
      <h1>Papan Skor</h1>
      <p className="muted mb">20 pemain dengan poin tertinggi.</p>
      <div className="card table-wrap">
        <table>
          <thead><tr><th>#</th><th>Nama</th><th>Level</th><th>Poin</th></tr></thead>
          <tbody>
            {(users || []).map((u, i) => (
              <tr key={u.id}><td>{medal[i] || i + 1}</td><td>{u.name}</td><td>Lv {u.level}</td><td><b>{u.points}</b></td></tr>
            ))}
            {users && !users.length && <tr><td colSpan="4" className="muted">Belum ada pemain.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
