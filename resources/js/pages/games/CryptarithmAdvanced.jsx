import { useState } from 'react';

/**
 * Cryptarithm Lanjutan: SEND + MORE = MONEY dan sejenisnya.
 * Pemain mengisi digit untuk setiap huruf unik.
 * Solver dijalankan di browser untuk validasi.
 */
const PUZZLES = [
  {
    title: 'SEND + MORE = MONEY',
    expr: 'SEND + MORE = MONEY',
    letters: ['S', 'E', 'N', 'D', 'M', 'O', 'R', 'Y'],
    leadNonZero: ['S', 'M'], // huruf pertama tidak boleh nol
    validate: (m) => {
      const [S, E, N, D, Mo, O, R, Y] = ['S', 'E', 'N', 'D', 'M', 'O', 'R', 'Y'].map(l => m[l]);
      const SEND  = 1000*S + 100*E + 10*N + D;
      const MORE  = 1000*Mo + 100*O + 10*R + E;
      const MONEY = 10000*Mo + 1000*O + 100*N + 10*E + Y;
      return SEND + MORE === MONEY;
    },
    solution: { S:9, E:5, N:6, D:7, M:1, O:0, R:8, Y:2 },
    hint: 'M=1 (carry dari penjumlahan). S dan M tidak boleh 0.',
  },
  {
    title: 'BASE + BALL = GAMES',
    expr: 'BASE + BALL = GAMES',
    letters: ['B', 'A', 'S', 'E', 'L', 'G', 'M'],
    leadNonZero: ['B', 'G'],
    validate: (m) => {
      const [B, A, Sv, E, L, G, M] = ['B', 'A', 'S', 'E', 'L', 'G', 'M'].map(l => m[l]);
      const BASE  = 1000*B + 100*A + 10*Sv + E;
      const BALL  = 1000*B + 100*A + 10*L + L;
      const GAMES = 10000*G + 1000*A + 100*M + 10*E + Sv;
      return BASE + BALL === GAMES;
    },
    solution: { B:7, A:4, S:3, E:5, L:8, G:1, M:4 },
    hint: 'G=1 karena carry tidak melebihi 1. Coba B=7, A=4.',
  },
  {
    title: 'CROSS + ROADS = DANGER',
    expr: 'CROSS + ROADS = DANGER',
    letters: ['C', 'R', 'O', 'S', 'A', 'D', 'N', 'G', 'E'],
    leadNonZero: ['C', 'R', 'D'],
    validate: (m) => {
      const [C, R, O, S, A, D, N, G, E] = ['C', 'R', 'O', 'S', 'A', 'D', 'N', 'G', 'E'].map(l => m[l]);
      const CROSS = 10000*C + 1000*R + 100*O + 10*S + S;
      const ROADS = 10000*R + 1000*O + 100*A + 10*D + S;
      const DANGER= 100000*D + 10000*A + 1000*N + 100*G + 10*E + R;
      return CROSS + ROADS === DANGER;
    },
    solution: { C:9, R:6, O:2, S:8, A:4, D:1, N:5, G:7, E:0 },
    hint: 'D=1 (carry batas atas). Coba nilai R kecil.',
  },
];

export default function CryptarithmAdvanced({ user, submitScore, bestScore }) {
  const [pidx, setPidx] = useState(0);
  const [map, setMap] = useState({});
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showSol, setShowSol] = useState(false);
  const [solvedCount, setSolvedCount] = useState(0);
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
    // Cek semua digit unik
    const vals = puzzle.letters.map(l => map[l]);
    if (new Set(vals).size !== vals.length) {
      setChecked(true);
      setCorrect(false);
      return;
    }
    // Cek leading zeros
    const leadZero = puzzle.leadNonZero?.some(l => map[l] === 0);
    if (leadZero) { setChecked(true); setCorrect(false); return; }
    const ok = puzzle.validate(map);
    setChecked(true);
    setCorrect(ok);
    if (ok) setSolvedCount(s => s + 1);
  }

  function revealSolution() {
    setMap(puzzle.solution);
    setShowSol(true);
    setChecked(true);
    setCorrect(true);
  }

  function next() {
    if (pidx + 1 >= PUZZLES.length) {
      setDone(true);
      if (user) submitScore(solvedCount).then(d => d && setMsg(`+${d.points} poin! ⭐`));
    } else {
      setPidx(i => i + 1);
      setMap({});
      setChecked(false);
      setCorrect(false);
      setShowHint(false);
      setShowSol(false);
    }
  }

  if (done) return (
    <>
      <h1>🔐 Cryptarithm Lanjutan</h1>
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
      <h1>🔐 Cryptarithm Lanjutan</h1>
      <p className="muted mb">Setiap huruf = digit 0–9 unik. Angka pertama sebuah kata tidak boleh 0.</p>
      <div className="card" style={{ maxWidth: 600 }}>
        <div className="row between mb">
          <span className="tag">Puzzle {pidx + 1}/{PUZZLES.length}</span>
          <span className="pts">Diselesaikan: {solvedCount}</span>
        </div>
        <div className="crypt" style={{ fontSize: '1.4rem', wordBreak: 'break-word' }}>{puzzle.expr}</div>

        <div className="tutorial-box" style={{ marginBottom: 16 }}>
          <p className="small muted" style={{ margin: 0 }}>
            Isi digit 0–9 untuk setiap huruf. Semua digit harus unik. Huruf awal kata ≠ 0.
          </p>
        </div>

        <div className="crypt-inputs" style={{ flexWrap: 'wrap' }}>
          {puzzle.letters.map(l => (
            <div key={l} className="crypt-input-item">
              <span className="crypt-label">{l}</span>
              <input
                className="letter"
                type="number" min={0} max={9}
                value={map[l] ?? ''}
                onChange={e => setLetter(l, e.target.value)}
                disabled={checked && correct}
              />
            </div>
          ))}
        </div>

        {checked && (
          <div className={`feedback mt ${correct ? 'good' : 'wrong'}`}>
            {correct
              ? `✅ Benar!${showSol ? ' (solusi ditampilkan)' : ''}`
              : '❌ Belum tepat. Cek: semua digit unik? Tidak ada leading zero? Persamaan terpenuhi?'
            }
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
                {showHint ? 'Sembunyikan' : '💡 Petunjuk'}
              </button>
              <button className="btn btn-ghost btn-sm" onClick={revealSolution}>Tampilkan Solusi</button>
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
