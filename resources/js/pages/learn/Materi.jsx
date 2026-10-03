import { Link } from 'react-router-dom';

const LEVEL_INFO = [
  {
    level: 'SD',
    grades: [1, 2, 3, 4, 5, 6],
    emoji: '🏫',
    color: 'level-sd',
    desc: 'Fondasi Konkret',
    skills: ['Operasi Hitung Dasar', 'Pecahan & Desimal', 'KPK & FPB', 'Keliling & Luas', 'Volume 3D', 'Data Dasar'],
  },
  {
    level: 'SMP',
    grades: [7, 8, 9],
    emoji: '🏛️',
    color: 'level-smp',
    desc: 'Transisi ke Aljabar',
    skills: ['Himpunan & Aljabar', 'Persamaan Linear', 'Fungsi & Grafik', 'Teorema Pythagoras', 'Persamaan Kuadrat', 'Transformasi Geometri'],
  },
  {
    level: 'SMA/SMK',
    grades: [10, 11, 12],
    emoji: '🎓',
    color: 'level-sma',
    desc: 'Analisis & Penerapan',
    skills: ['Eksponen & Logaritma', 'Trigonometri', 'Matriks', 'Kalkulus Dasar', 'Statistika Lanjut', 'Peluang & Kombinatorika'],
  },
];

export default function Materi() {
  return (
    <>
      <div className="materi-page-hero">
        <h1>📚 Materi Pembelajaran</h1>
        <p className="hero-sub">Pilih kelas untuk mulai belajar. Setiap topik berisi penjelasan materi lengkap beserta latihan soal interaktif.</p>
      </div>

      {LEVEL_INFO.map(({ level, grades, emoji, color, desc, skills }) => (
        <section key={level} className={`level-section ${color}`}>
          <div className="level-section-header">
            <div className="level-badge-wrap">
              <span className="level-emoji">{emoji}</span>
              <div>
                <h2 className="level-title">{level}</h2>
                <p className="level-desc">{desc}</p>
              </div>
            </div>
            <div className="level-skills">
              {skills.map(s => <span key={s} className="level-skill-chip">{s}</span>)}
            </div>
          </div>

          <div className="grades-row">
            {grades.map((g) => (
              <Link key={g} to={`/kelas/${g}`} className={`grade-card-v2 ${color}`}>
                <div className="grade-card-v2-num">{g}</div>
                <div className="grade-card-v2-label">Kelas {g}</div>
                <div className="grade-card-v2-arrow">→</div>
              </Link>
            ))}
          </div>
        </section>
      ))}

      {/* Learning path tip */}
      <div className="learning-tip">
        <div className="tip-icon">💡</div>
        <div>
          <strong>Tips Belajar Efektif:</strong> Pelajari materi terlebih dahulu, pahami contoh soal yang diberikan, lalu kerjakan latihan soal. Gunakan fitur <Link to="/ai-tutor">AI Tutor</Link> jika ada bagian yang kurang dipahami!
        </div>
      </div>
    </>
  );
}
