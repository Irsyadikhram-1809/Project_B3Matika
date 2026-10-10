import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '@/components/Logo';
import Reveal from '@/components/Reveal';
import IconTile from '@/components/IconTile';
import { BookOpen, PencilLine, Gamepad2, Blocks, Compass, GraduationCap } from 'lucide-react';
import { api } from '@/lib/api';

export default function Home() {
  const [counts, setCounts] = useState({});
  useEffect(() => { api('/home').then((d) => setCounts(d.counts)).catch(() => {}); }, []);
  return (
    <>
      <section className="hero">
        <Reveal>
          <Logo size={110} big />
        </Reveal>
        <Reveal delay={0.2}>
          <p className="hero-sub">Belajar matematika dari kelas 1 SD sampai 12 SMA/SMK — dengan materi, latihan soal, game, dan puzzle yang seru.</p>
        </Reveal>
        <Reveal delay={0.4}>
          <div className="row center-row">
            <Link to="/materi" className="btn btn-lg">Mulai Belajar</Link>
            <Link to="/games" className="btn btn-lg btn-outline">Main Game</Link>
          </div>
        </Reveal>
      </section>

      <section className="grid-3">
        <Reveal delay={0.1}>
          <Link to="/materi" className="card feature"><IconTile icon={BookOpen} color="blue" /><h3>Belajar</h3><p>Materi ringkas untuk setiap kelas, mudah dipahami.</p></Link>
        </Reveal>
        <Reveal delay={0.2}>
          <Link to="/materi" className="card feature"><IconTile icon={PencilLine} color="orange" /><h3>Berlatih</h3><p>Latihan soal pilihan ganda lengkap dengan penjelasan.</p></Link>
        </Reveal>
        <Reveal delay={0.3}>
          <Link to="/games" className="card feature"><IconTile icon={Gamepad2} color="green" /><h3>Bermain</h3><p>Game kilat hitung dan puzzle untuk mengasah otak.</p></Link>
        </Reveal>
      </section>

      <Reveal delay={0.1}>
        <h2 className="section-title">Pilih Kelas</h2>
      </Reveal>
      <div className="grades">
        {Array.from({ length: 12 }, (_, i) => i + 1).map((g, i) => (
          <Reveal key={g} delay={0.1 + (i * 0.05)} style={{ width: 'auto' }}>
            <Link to={`/kelas/${g}`} className={`card grade-card level-${g <= 6 ? 'sd' : g <= 9 ? 'smp' : 'sma'}`}>
              <div className={`grade-card-icon level-${g <= 6 ? 'sd' : g <= 9 ? 'smp' : 'sma'}-icon`}>
                {g <= 6 ? <Blocks size={26} strokeWidth={2.2} /> : g <= 9 ? <Compass size={26} strokeWidth={2.2} /> : <GraduationCap size={26} strokeWidth={2.2} />}
              </div>
              <span className="grade-num">{g}</span>
              <span className="grade-label">{g <= 6 ? 'SD' : g <= 9 ? 'SMP' : 'SMA/SMK'}</span>
              <span className="muted small">{counts[g] || 0} materi</span>
            </Link>
          </Reveal>
        ))}
      </div>
    </>
  );
}
