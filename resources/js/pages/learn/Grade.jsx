import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '@/lib/api';
import NotFound from '@/components/NotFound';

const GRADE_INFO = {
  1: { desc: 'Pengenalan bilangan, penjumlahan & pengurangan, bangun datar dasar.', icon: '🔢' },
  2: { desc: 'Operasi hitung lanjut, pengukuran dasar, dan pengenalan pecahan.', icon: '➕' },
  3: { desc: 'Perkalian & pembagian, pecahan senilai, keliling bangun datar.', icon: '✖️' },
  4: { desc: 'KPK & FPB, desimal, persen, dan luas bangun datar.', icon: '📐' },
  5: { desc: 'Perbandingan, kecepatan, volume bangun ruang, bilangan bulat.', icon: '📦' },
  6: { desc: 'Lingkaran, skala, statistik dasar (mean, median, modus).', icon: '🔵' },
  7: { desc: 'Himpunan, bilangan bulat & pecahan, aljabar dasar, PLSV, aritmetika sosial.', icon: '🔣' },
  8: { desc: 'Bidang Kartesius, fungsi, gradien, Pythagoras, SPLDV.', icon: '📈' },
  9: { desc: 'Eksponen, bentuk akar, persamaan kuadrat, transformasi geometri.', icon: '⚡' },
  10: { desc: 'Eksponen, logaritma, trigonometri dasar, SPLTV, fungsi komposisi.', icon: '📡' },
  11: { desc: 'Matriks, barisan & deret, limit, turunan, integral.', icon: '∫' },
  12: { desc: 'Dimensi tiga, statistika lanjut, permutasi & kombinasi, peluang majemuk.', icon: '🎲' },
};

export default function Grade() {
  const { g } = useParams();
  const [data, setData] = useState(null);
  const [err, setErr] = useState(false);
  useEffect(() => {
    setData(null);
    api(`/grades/detail?grade=${g}`)
      .then(res => {
        if (!res || !res.topics) {
          setData({ grade: parseInt(g), topics: [] });
        } else {
          setData(res);
        }
      })
      .catch(() => setErr(true));
  }, [g]);

  if (err) return <NotFound />;
  if (!data) return (
    <div className="loading-state">
      <div className="loading-spinner" />
      <p className="muted">Memuat daftar materi…</p>
    </div>
  );

  const grade = parseInt(g);
  const levelLabel = grade <= 6 ? 'SD' : grade <= 9 ? 'SMP' : 'SMA/SMK';
  const levelColor = grade <= 6 ? 'level-sd' : grade <= 9 ? 'level-smp' : 'level-sma';
  const info = GRADE_INFO[grade] || {};

  return (
    <>
      <div className="breadcrumb-nav">
        <Link to="/materi" className="back">← Semua Kelas</Link>
      </div>

      <div className={`grade-page-header ${levelColor}`}>
        <div className="grade-page-icon">{info.icon || '📚'}</div>
        <div>
          <div className="grade-page-tag">{levelLabel}</div>
          <h1 className="grade-page-title">Kelas {g}</h1>
          <p className="grade-page-desc">{info.desc}</p>
        </div>
      </div>

      <div className="grade-nav-strip">
        {Array.from({ length: (grade <= 6 ? 6 : grade <= 9 ? 9 : 12) - (grade <= 6 ? 1 : grade <= 9 ? 7 : 10) + 1 }, (_, i) => {
          const gNum = (grade <= 6 ? 1 : grade <= 9 ? 7 : 10) + i;
          return (
            <Link key={gNum} to={`/kelas/${gNum}`} className={`grade-nav-pill ${gNum === grade ? 'active' : ''}`}>
              {gNum}
            </Link>
          );
        })}
      </div>

      {data.topics.length === 0 && (
        <div className="card center" style={{ padding: '40px 20px', marginTop: '20px' }}>
          <p className="muted">Belum ada materi untuk kelas ini. Pantau terus ya!</p>
        </div>
      )}

      <div className="topics-grid mt">
        {data.topics.map((t) => (
          <Link key={t.id} to={`/materi/${t.id}`} className="topic-card-v2">
            <div className="topic-card-v2-body">
              <h3 className="topic-card-v2-title">{t.title}</h3>
              <p className="muted small topic-card-v2-count">
                {t.questions_count} soal latihan
              </p>
            </div>
            <div className="topic-card-v2-action">
              <span className="topic-card-v2-btn">Belajar →</span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
