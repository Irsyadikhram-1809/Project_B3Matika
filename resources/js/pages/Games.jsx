import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import KilatHitung from './games/KilatHitung';
import Game2048 from './games/Game2048';
import Threes from './games/Threes';
import MathRiddles from './games/MathRiddles';
import CryptarithmBasic from './games/CryptarithmBasic';
import Sudoku from './games/Sudoku';
import KenKen from './games/KenKen';
import Calculords from './games/Calculords';
import CryptarithmAdvanced from './games/CryptarithmAdvanced';

function GameTutorialPanel({ game }) {
  const [open, setOpen] = useState(true);
  return (
    <div className={`game-tutorial-panel ${open ? 'open' : ''}`}>
      <button className="game-tutorial-toggle" onClick={() => setOpen(o => !o)}>
        <span className="tutorial-toggle-icon">{game.emoji}</span>
        <span className="tutorial-toggle-title">ℹ️ Cara Bermain & Tujuan Belajar</span>
        <span className="tutorial-chevron">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="game-tutorial-body">
          <div className="game-tutorial-section">
            <h4>🕹️ Cara Bermain</h4>
            <p>{game.tutorial}</p>
          </div>
          <div className="game-tutorial-section">
            <h4>🎓 Tujuan Belajar</h4>
            <p>{game.learningGoal}</p>
          </div>
          {game.tips && (
            <div className="game-tutorial-section">
              <h4>💡 Tips Strategi</h4>
              <ul className="tutorial-tips-list">
                {game.tips.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const GAMES = [
  {
    id: 'kilat', label: 'Kilat Hitung', emoji: '⚡', level: 'Sederhana',
    desc: 'Jawab sebanyak mungkin soal dalam 30 detik!',
    tutorial: 'Selesaikan operasi matematika (tambah, kurang, kali, atau campuran) secepat mungkin. Kamu punya waktu 30 detik. Ketikkan jawabanmu di kotak yang tersedia, lalu tekan Enter atau klik Jawab.',
    learningGoal: 'Melatih kecepatan dan ketepatan berhitung dasar (penjumlahan, pengurangan, perkalian). Sangat baik untuk meningkatkan fluensi aritmetika dan refleks matematika.',
    tips: ['Pilih mode "Penjumlahan" dulu untuk pemanasan', 'Mode Campuran memberi poin lebih karena lebih menantang', 'Fokus pada kecepatan, bukan keakuratan 100% — lanjut ke soal berikutnya!'],
    component: KilatHitung,
  },
  {
    id: '2048', label: '2048', emoji: '🎯', level: 'Sederhana',
    desc: 'Geser dan gabungkan blok angka hingga mencapai 2048.',
    tutorial: 'Gunakan tombol panah (←→↑↓) atau WASD di keyboard, atau swipe di layar sentuh, untuk menggeser semua kotak sekaligus. Dua kotak bernilai sama yang bersentuhan akan bergabung menjadi satu dengan nilai dua kali lipat. Target: buat kotak bernilai 2048!',
    learningGoal: 'Melatih pemahaman deret ukur dan eksponen basis 2 (2¹, 2², 2³, ..., 2¹¹ = 2048). Melatih perencanaan strategi dan berpikir beberapa langkah ke depan.',
    tips: ['Coba pertahankan angka terbesar di sudut (pojok kanan bawah)', 'Jangan geser ke arah yang memecah susunan angka besar', 'Selalu sisakan ruang untuk tile baru muncul'],
    component: Game2048,
  },
  {
    id: 'threes', label: 'Threes!', emoji: '🎲', level: 'Sederhana',
    desc: 'Gabungkan 1+2=3, lalu 3+3, 6+6 … raih skor tertinggi!',
    tutorial: 'Gunakan panah untuk menggeser kotak. Aturan penggabungan UNIK: angka 1 HANYA bisa digabung dengan angka 2 (hasilnya 3). Setelah itu, hanya angka yang identik yang bisa digabung (3+3=6, 6+6=12, dst). Permainan berakhir saat papan penuh.',
    learningGoal: 'Melatih perencanaan tata ruang (spatial planning) dan kelipatan bilangan 3. Lebih strategis dari 2048 karena aturan penggabungannya lebih ketat.',
    tips: ['Pisahkan tile 1 dan 2 agar mudah digabungkan', 'Jangan biarkan papan penuh dengan tile kecil yang tidak bisa bergabung', 'Rencanakan 2-3 langkah ke depan sebelum menggeser'],
    component: Threes,
  },
  {
    id: 'riddle', label: 'Math Riddles', emoji: '🧩', level: 'Sederhana',
    desc: 'Pola angka, aljabar kasual, dan logika visual.',
    tutorial: 'Perhatikan pola angka atau gambar yang diberikan. Setiap teka-teki memiliki logika tersembunyi — bisa berupa nilai sebuah simbol, selisih antar angka, atau pola kelipatan. Temukan polanya, lalu ketikkan jawabanmu.',
    learningGoal: 'Melatih nalar aljabar dasar dan pengenalan pola tanpa menggunakan variabel formal. Membangun intuisi matematika yang kuat untuk topik yang lebih lanjut.',
    tips: ['Coba cari selisih atau rasio antar angka dalam deret', 'Untuk teka-teki simbol, buat tabel nilai setiap simbol', 'Jika buntu, coba kerjakan dari soal yang paling sederhana dulu'],
    component: MathRiddles,
  },
  {
    id: 'crypt_basic', label: 'Cryptarithm Dasar', emoji: '🔤', level: 'Sederhana',
    desc: 'Pecahkan substitusi huruf-ke-angka pada teka-teki aritmetika singkat.',
    tutorial: 'Setiap huruf mewakili satu angka unik (0-9). Tugasmu adalah mengganti semua huruf dengan angka yang tepat agar persamaan penjumlahannya benar secara matematika. Isikan nilai setiap huruf di kotak masing-masing, lalu tekan "Cek Jawaban".',
    learningGoal: 'Melatih logika eliminasi, nilai tempat bilangan (satuan, puluhan, ratusan), dan deduksi bertahap. Merupakan pintu masuk ke logika pemrograman dan kriptografi.',
    tips: ['Mulai dari kolom satuan (paling kanan)', 'Perhatikan apakah ada "carry" (angka simpanan) ke kolom selanjutnya', 'Huruf pertama suatu bilangan tidak boleh bernilai 0'],
    component: CryptarithmBasic,
  },
  {
    id: 'sudoku', label: 'Sudoku', emoji: '🟦', level: 'Sulit',
    desc: 'Isi kisi 9×9 tanpa pengulangan angka di baris, kolom, dan kotak.',
    tutorial: 'Isi setiap petak kosong dengan angka 1-9. Ada tiga syarat yang harus dipenuhi sekaligus: (1) Setiap baris → tidak boleh ada angka yang sama, (2) Setiap kolom → tidak boleh ada angka yang sama, (3) Setiap kotak 3×3 → tidak boleh ada angka yang sama.',
    learningGoal: 'Melatih constraint satisfaction — kemampuan memecahkan masalah dengan banyak syarat sekaligus. Membangun kemampuan berpikir sistematis dan eliminasi logis.',
    tips: ['Mulai dari baris/kolom/kotak yang sudah paling banyak terisi', 'Gunakan teknik "naked single": jika hanya ada satu kemungkinan, isi', 'Tandai kandidat angka di setiap sel untuk memudahkan eliminasi'],
    component: Sudoku,
  },
  {
    id: 'kenken', label: 'KenKen', emoji: '🔢', level: 'Sulit',
    desc: 'Sudoku + operasi hitung (+−×÷) dalam kotak cage.',
    tutorial: 'Isi kotak dengan angka tanpa pengulangan di setiap baris dan kolom. TAMBAHAN: Angka dalam setiap kelompok (cage) bergaris tebal harus menghasilkan angka target dengan operasi yang tertera (misal: "12×" artinya hasil kalinya harus 12).',
    learningGoal: 'Melatih faktorisasi, partisi bilangan, dan komputasi mental cepat. Menggabungkan logika Sudoku dengan kemampuan aritmetika untuk tantangan ganda.',
    tips: ['Cage berisi 1 sel sudah pasti nilainya (langsung isi)', 'Untuk cage perkalian, cari semua pasangan faktor yang mungkin', 'Gunakan aturan Sudoku (tanpa pengulangan) untuk mengeliminasi kandidat'],
    component: KenKen,
  },
  {
    id: 'calculords', label: 'Calculords', emoji: '🃏', level: 'Sulit',
    desc: 'Rangkai kartu angka dengan operasi untuk mencapai target.',
    tutorial: 'Kamu punya beberapa kartu angka. Pilih kartu angka, lalu pilih operasi (+, -, ×), lalu pilih kartu angka lagi, dan seterusnya. Tujuanmu: buat ekspresi matematika yang hasilnya tepat sama dengan Angka Target. Gunakan sebanyak mungkin kartu!',
    learningGoal: 'Melatih urutan operasi hitung (PEMDAS/KABATAKU) dan strategi optimasi. Melatih berpikir kombinatoris — mencari kombinasi terbaik dari banyak kemungkinan.',
    tips: ['Hitung target dari yang terbesar: apakah bisa dicapai dengan perkalian?', 'Coba eliminasi angka-angka kecil dengan pengurangan atau pembagian', 'Ingat: perkalian dikerjakan sebelum penjumlahan/pengurangan'],
    component: Calculords,
  },
  {
    id: 'crypt_adv', label: 'Cryptarithm Lanjutan', emoji: '🔐', level: 'Sulit',
    desc: 'SEND + MORE = MONEY — eliminasi bersyarat berlapis.',
    tutorial: 'Seperti Cryptarithm Dasar, tapi dengan kata yang lebih panjang dan carry (angka simpanan) berlapis. Contoh legendaris: SEND + MORE = MONEY. Setiap huruf berbeda = angka berbeda (0-9). Huruf pertama suatu kata TIDAK BOLEH bernilai 0.',
    learningGoal: 'Melatih analisis kasus mendalam, sistem persamaan dengan constraint ganda, dan penalaran logis berlapis. Setara dengan latihan berpikir algoritmik tingkat lanjut.',
    tips: ['Mulai dengan menentukan nilai huruf di posisi paling kiri (biasanya 1)', 'Lacak carry di setiap kolom — ini kunci utamanya', 'Gunakan tabel untuk mencatat kemungkinan nilai setiap huruf'],
    component: CryptarithmAdvanced,
  },
];

export default function Games() {
  const { user, setUser } = useAuth();
  const nav = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const selected = searchParams.get('game');
  const [myScores, setMyScores] = useState({});
  const [filter, setFilter] = useState('Semua');

  useEffect(() => {
    if (user) {
      api('/games/my-scores').then(d => setMyScores(d.scores || {})).catch(() => {});
    }
  }, [user]);

  const submitScore = useCallback(async (gameType, score) => {
    if (!user) return;
    try {
      const d = await api('/games/score', { method: 'POST', body: { game_type: gameType, score } });
      setUser(d.user);
      setMyScores(prev => ({
        ...prev,
        [gameType]: { best_score: Math.max(score, prev[gameType]?.best_score || 0) },
      }));
      return d;
    } catch { return null; }
  }, [user, setUser]);

  if (selected) {
    const game = GAMES.find(g => g.id === selected);
    const Comp = game.component;
    return (
      <>
        <button
          className="back btn-ghost"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--blue-d)', fontWeight: 600 }}
          onClick={() => setSearchParams({})}
        >
          ← Semua Game
        </button>
        <GameTutorialPanel game={game} />
        <Comp
          user={user}
          submitScore={(score) => submitScore(game.id, score)}
          bestScore={myScores[selected]?.best_score}
          nav={nav}
        />
      </>
    );
  }

  const levels = ['Semua', 'Sederhana', 'Sulit'];
  const shown = filter === 'Semua' ? GAMES : GAMES.filter(g => g.level === filter);

  return (
    <>
      <div className="games-page-header">
        <h1>🎮 Game Matematika</h1>
        <p className="muted">Latih kemampuan matematika dan logikamu sambil bermain! Setiap game dirancang untuk mengasah konsep matematika tertentu.</p>
      </div>

      <div className="games-legend">
        <div className="legend-item">
          <span className="tag tag-level-easy">Sederhana</span>
          <span className="legend-desc">Cocok untuk aritmetika dasar & pengenalan pola</span>
        </div>
        <div className="legend-item">
          <span className="tag tag-level-hard">Sulit</span>
          <span className="legend-desc">Deduksi multi-langkah, kombinatorika & geometri</span>
        </div>
      </div>

      <div className="game-filter">
        {levels.map(l => (
          <button key={l} className={`chip ${filter === l ? 'chip-active' : ''}`} onClick={() => setFilter(l)}>
            {l}
          </button>
        ))}
      </div>

      <div className="game-hub">
        {shown.map(g => (
          <button key={g.id} className="game-card" onClick={() => setSearchParams({ game: g.id })}>
            <span className="game-card-emoji">{g.emoji}</span>
            <div className="game-card-info">
              <h3>{g.label}</h3>
              <p className="muted small">{g.desc}</p>
            </div>
            <div className="game-card-meta">
              <span className={`tag tag-level-${g.level === 'Sulit' ? 'hard' : 'easy'}`}>{g.level}</span>
              {myScores[g.id] && (
                <span className="pts">🏆 {myScores[g.id].best_score}</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </>
  );
}
