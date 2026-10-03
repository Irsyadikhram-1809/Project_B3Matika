import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const GAME_LABELS = {
  kilat: '⚡ Kilat Hitung', '2048': '🎯 2048', threes: '🎲 Threes!',
  riddle: '🧩 Math Riddles', crypt_basic: '🔤 Cryptarithm Dasar',
  sudoku: '🟦 Sudoku', kenken: '🔢 KenKen', calculords: '🃏 Calculords',
  crypt_adv: '🔐 Cryptarithm Lanjutan',
};

function gradeLabel(g) {
  if (g <= 6) return `SD Kelas ${g}`;
  if (g <= 9) return `SMP Kelas ${g}`;
  return `SMA Kelas ${g}`;
}

function fmtDate(dt) {
  if (!dt) return '-';
  return new Date(dt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Riwayat() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/masuk" replace />;

  const [data, setData] = useState(null);
  const [tab, setTab] = useState('materi');

  useEffect(() => {
    api('/me/history').then(setData).catch(() => {});
  }, []);

  if (!data) return <p className="muted">Memuat riwayat…</p>;

  const { topics, games } = data;
  const totalCorrect = topics.reduce((s, t) => s + t.correct, 0);
  const totalWrong   = topics.reduce((s, t) => s + t.wrong, 0);
  const accuracy     = totalCorrect + totalWrong > 0
    ? Math.round(totalCorrect / (totalCorrect + totalWrong) * 100) : 0;

  return (
    <>
      <h1>📚 Riwayat Belajar</h1>

      {/* Ringkasan */}
      <div className="riwayat-summary">
        <div className="card riwayat-stat"><b>{topics.length}</b><span>Topik Dipelajari</span></div>
        <div className="card riwayat-stat"><b>{totalCorrect}</b><span>Jawaban Benar</span></div>
        <div className="card riwayat-stat"><b>{accuracy}%</b><span>Akurasi</span></div>
        <div className="card riwayat-stat"><b>{games.length}</b><span>Jenis Game</span></div>
      </div>

      <div className="profil-tabs mt">
        <button className={tab === 'materi' ? 'active' : ''} onClick={() => setTab('materi')}>📖 Riwayat Materi</button>
        <button className={tab === 'game' ? 'active' : ''} onClick={() => setTab('game')}>🎮 Riwayat Game</button>
      </div>

      {tab === 'materi' && (
        <>
          {!topics.length && <p className="muted mt">Belum ada materi yang dikerjakan. <Link to="/materi">Mulai belajar</Link>!</p>}
          {topics.length > 0 && (
            <div className="table-wrap card mt">
              <table>
                <thead>
                  <tr>
                    <th>Jenjang</th>
                    <th>Topik</th>
                    <th>✅ Benar</th>
                    <th>❌ Salah</th>
                    <th>Akurasi</th>
                    <th>Terakhir</th>
                  </tr>
                </thead>
                <tbody>
                  {topics.map(t => {
                    const total = t.correct + t.wrong;
                    const acc = total > 0 ? Math.round(t.correct / total * 100) : 0;
                    return (
                      <tr key={t.topic_id}>
                        <td><span className="tag">{gradeLabel(t.grade)}</span></td>
                        <td><Link to={`/materi/${t.topic_id}`}>{t.topic_title}</Link></td>
                        <td style={{ color: 'var(--ok)', fontWeight: 600 }}>{t.correct}</td>
                        <td style={{ color: 'var(--bad)', fontWeight: 600 }}>{t.wrong}</td>
                        <td>
                          <div className="acc-bar">
                            <div className="acc-fill" style={{ width: `${acc}%` }} />
                          </div>
                          <span className="small">{acc}%</span>
                        </td>
                        <td className="small muted">{fmtDate(t.last_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {tab === 'game' && (
        <>
          {!games.length && <p className="muted mt">Belum pernah main game. <Link to="/games">Main sekarang</Link>!</p>}
          {games.length > 0 && (
            <div className="table-wrap card mt">
              <table>
                <thead>
                  <tr>
                    <th>Game</th>
                    <th>Skor Terbaik</th>
                    <th>Total Poin</th>
                    <th>Dimainkan</th>
                    <th>Terakhir</th>
                  </tr>
                </thead>
                <tbody>
                  {games.map(g => (
                    <tr key={g.game_type}>
                      <td>{GAME_LABELS[g.game_type] || g.game_type}</td>
                      <td><b>{g.best_score}</b></td>
                      <td><span className="pts">+{g.total_points} poin</span></td>
                      <td>{g.plays}×</td>
                      <td className="small muted">{fmtDate(g.last_played)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </>
  );
}
