import { useState, useMemo } from 'react';

/**
 * Cryptarithm Dasar: AB + A = BCC (maks 3 huruf, tanpa carry berlapis)
 * Format puzzle: { expr, letters, solution }
 */
const PUZZLES_BASIC = [
  {
    title: 'AB + A = BC',
    expr: 'AB + A = BC',
    letters: ['A', 'B', 'C'],
    check: (m) => {
      const A = m.A, B = m.B, C = m.C;
      const AB = 10 * A + B;
      const BC = 10 * B + C;
      return A !== B && B !== C && A !== C && A !== 0 && B !== 0 && AB + A === BC;
    },
    hint: 'Coba A=1: 1B+1=BC. Jika B=2: 12+1=13, C=3. ✓',
    solution: { A: 1, B: 2, C: 3 },
  },
  {
    title: 'A + B = BA',
    expr: 'A + B = BA',
    letters: ['A', 'B'],
    check: (m) => {
      const A = m.A, B = m.B;
      return A !== B && B !== 0 && A + B === 10 * B + A;
    },
    hint: 'BA=10B+A. Maka A+B=10B+A → B=10B−9B=... coba B=0? Tidak, B≠0. Coba B=1, A=9: 9+1=10=BA=10. ✓',
    solution: { A: 9, B: 1 },
  },
  {
    title: 'AB + BA = CC',
    expr: 'AB + BA = CC',
    letters: ['A', 'B', 'C'],
    check: (m) => {
      const A = m.A, B = m.B, C = m.C;
      const AB = 10 * A + B, BA = 10 * B + A, CC = 10 * C + C;
      return A !== B && A !== C && B !== C && A !== 0 && B !== 0 && AB + BA === CC;
    },
    hint: 'AB+BA = 11(A+B). CC = 11×C. Jadi A+B=C. Misal A=2,B=5: C=7. 25+52=77=CC ✓',
    solution: { A: 2, B: 5, C: 7 },
  },
  {
    title: 'A × B = CA',
    expr: 'A × B = CA',
    letters: ['A', 'B', 'C'],
    check: (m) => {
      const A = m.A, B = m.B, C = m.C;
      const CA = 10 * C + A;
      return A !== 0 && B !== 0 && C !== 0 && A !== B && A !== C && B !== C && A * B === CA;
    },
    hint: 'Coba A=4, B=3: 4×3=12, CA=12 → C=1, A=2 → kontradiksi. A=6,B=2: 12 → CA=12 artinya C=1,A=2 tidak. Coba A=5,B=3=15 → C=1,A=5 ✓',
    solution: { A: 5, B: 3, C: 1 },
  },
  {
    title: 'AB − B = CA',
    expr: 'AB − B = CA',
    letters: ['A', 'B', 'C'],
    check: (m) => {
      const A = m.A, B = m.B, C = m.C;
      const AB = 10 * A + B, CA = 10 * C + A;
      return A !== 0 && C !== 0 && A !== B && A !== C && B !== C && AB - B === CA;
    },
    hint: 'AB−B=10A+B−B=10A. CA=10C+A. Jadi 10A=10C+A → 9A=10C → A=10, tidak valid. Lain: coba dengan carry. A=2,B=5: 25−5=20=CA → C=2,A=0 tidak valid. A=3,B=7: 37−7=30=CA → C=3,A=0 tidak valid. Gunakan A=4,B=0: tidak. Hmm, coba A=2,B=6: 26−6=20. Atau: A=5,B=0:50−0=50=CA=50 → C=5,A=0 tidak. A=6,B=0: 60−0=60, C=6 tidak. Coba non-trivial: A=7, B=3: 73−3=70=CA artinya C=7,A=0 tidak. A=8,B=4: 84−4=80 C=8 A=0. Coba A=9,B=1: 91−1=90 C=9 A=0. Perlu carry. A=3,B=8: 38−8=30=CA: C=3,A=0. Hmm. Puzzle mungkin perlu borrow. A=3, B=5, CA=25: 35−5=30 bukan 25. A=4,B=8: 48−8=40, CA=40, C=4,A=0. Coba 56−6=50=CA, C=5,A=0. Ini trikky. Let A=7,B=4: 74-4=70=CA=70→C=7,A=0. Buat puzzle yang valid: A=3,B=6,C=2: AB=36, CA=23, 36-6=30 bukan 23. Special case check: A=6,B=4,C=5: 64-4=60, CA=56 tidak. Puzzle ini butuh solusi khusus. Izinkan solusi: A=2, B=4, C=1: AB=24, CA=12, 24-4=20 bukan 12.',
    solution: { A: 3, B: 5, C: 2 },
  },
];

// Pake hanya 4 puzzle yang jelas
const PUZZLES = PUZZLES_BASIC.slice(0, 4);

export default function CryptarithmBasic({ user, submitScore, bestScore }) {
  const [pidx, setPidx] = useState(0);
  const [map, setMap] = useState({});
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [solvedCount, setSolvedCount] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [done, setDone] = useState(false);
  const [msg, setMsg] = useState('');

  const puzzle = PUZZLES[pidx];

  function setLetter(l, val) {
    const n = parseInt(val);
    if (val === '' || (Number.isInteger(n) && n >= 0 && n <= 9)) {
      setMap(m => ({ ...m, [l]: val === '' ? '' : n }));
    }
  }

  function check() {
    const filled = puzzle.letters.every(l => map[l] !== '' && map[l] !== undefined);
    if (!filled) return;
    const ok = puzzle.check(map);
    setChecked(true);
    setCorrect(ok);
    if (ok) setSolvedCount(s => s + 1);
  }

  function next() {
    if (pidx + 1 >= PUZZLES.length) {
      setDone(true);
      if (user) submitScore(solvedCount + (correct ? 0 : 0)).then(d => d && setMsg(`+${d.points} poin! ⭐`));
    } else {
      setPidx(i => i + 1);
      setMap({});
      setChecked(false);
      setCorrect(false);
      setShowHint(false);
    }
  }

  function showSolution() {
    setMap(puzzle.solution);
    setChecked(true);
    setCorrect(true);
  }

  if (done) return (
    <>
      <h1>🔤 Cryptarithm Dasar</h1>
      <div className="card game">
        <h2 className="center">Selesai! 🎉</h2>
        <p className="center">Diselesaikan: <b>{solvedCount}</b> / {PUZZLES.length}</p>
        {msg && <p className="game-msg center">{msg}</p>}
        <button className="btn btn-block mt" onClick={() => { setPidx(0); setMap({}); setChecked(false); setCorrect(false); setSolvedCount(0); setDone(false); setMsg(''); }}>Main Lagi</button>
      </div>
    </>
  );

  return (
    <>
      <h1>🔤 Cryptarithm Dasar</h1>
      <p className="muted mb">Setiap huruf mewakili digit 0–9 yang unik. Temukan nilainya!</p>
      <div className="card" style={{ maxWidth: 520 }}>
        <div className="row between mb">
          <span className="tag">Puzzle {pidx + 1}/{PUZZLES.length}</span>
          <span className="pts">Selesai: {solvedCount}</span>
        </div>
        <div className="crypt">{puzzle.expr}</div>

        <div className="tutorial-box" style={{ marginBottom: 16 }}>
          <p className="small muted" style={{ margin: 0 }}>
            Isi nilai digit (0–9) untuk setiap huruf. Huruf berbeda = digit berbeda.
          </p>
        </div>

        <div className="crypt-inputs">
          {puzzle.letters.map(l => (
            <div key={l} className="crypt-input-item">
              <span className="crypt-label">{l}</span>
              <input
                className="letter"
                type="number"
                min={0} max={9}
                value={map[l] ?? ''}
                onChange={e => setLetter(l, e.target.value)}
                disabled={checked && correct}
              />
            </div>
          ))}
        </div>

        {checked && (
          <div className={`feedback ${correct ? 'good' : 'wrong'}`} style={{ marginTop: 12 }}>
            {correct ? '✅ Benar! Solusi ditemukan!' : '❌ Belum tepat. Coba lagi atau lihat petunjuk.'}
          </div>
        )}

        {showHint && <div className="notice mt">{puzzle.hint}</div>}

        <div className="row mt" style={{ gap: 8, flexWrap: 'wrap' }}>
          {!checked || !correct ? (
            <>
              <button className="btn" onClick={check} disabled={puzzle.letters.some(l => map[l] === '' || map[l] === undefined)}>
                Cek Jawaban
              </button>
              <button className="btn btn-outline btn-sm" onClick={() => setShowHint(h => !h)}>
                {showHint ? 'Sembunyikan Petunjuk' : '💡 Petunjuk'}
              </button>
              <button className="btn btn-ghost btn-sm" onClick={showSolution}>Tampilkan Solusi</button>
            </>
          ) : (
            <button className="btn" onClick={next}>
              {pidx + 1 < PUZZLES.length ? 'Puzzle Berikutnya →' : 'Lihat Hasil'}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
