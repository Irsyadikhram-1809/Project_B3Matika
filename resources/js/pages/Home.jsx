import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '@/components/Logo';
import { api } from '@/lib/api';

export default function Home() {
  const [counts, setCounts] = useState({});
  useEffect(() => { api('/home').then((d) => setCounts(d.counts)).catch(() => {}); }, []);
  return (
    <>
      <section className="hero">
        <Logo size={110} big />
        <p className="hero-sub">Belajar matematika dari kelas 1 SD sampai 12 SMA/SMK — dengan materi, latihan soal, game, dan puzzle yang seru.</p>
        <div className="row center-row">
          <Link to="/materi" className="btn btn-lg">Mulai Belajar</Link>
          <Link to="/games" className="btn btn-lg btn-outline">Main Game</Link>
        </div>
      </section>

      <section className="grid-3">
        <Link to="/materi" className="card feature"><span className="emoji">📘</span><h3>Belajar</h3><p>Materi ringkas untuk setiap kelas, mudah dipahami.</p></Link>
        <Link to="/materi" className="card feature"><span className="emoji">✏️</span><h3>Berlatih</h3><p>Latihan soal pilihan ganda lengkap dengan penjelasan.</p></Link>
        <Link to="/games" className="card feature"><span className="emoji">🎮</span><h3>Bermain</h3><p>Game kilat hitung dan puzzle untuk mengasah otak.</p></Link>
      </section>

      <h2 className="section-title">Pilih Kelas</h2>
      <div className="grades">
        {Array.from({ length: 12 }, (_, i) => i + 1).map((g) => (
          <Link key={g} to={`/kelas/${g}`} className="card grade-card">
            <span className="grade-num">{g}</span>
            <span className="grade-label">{g <= 6 ? 'SD' : g <= 9 ? 'SMP' : 'SMA/SMK'}</span>
            <span className="muted small">{counts[g] || 0} materi</span>
          </Link>
        ))}
      </div>
    </>
  );
}
