import { useState, useEffect, useCallback } from 'react';

// Generator Sudoku sederhana: mulai dari solusi valid, lalu hapus beberapa sel
function makeBase() {
  const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  // Shuffled base
  const shuffle = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const base = shuffle(nums);
  // Fill grid using known valid pattern derivations
  const g = Array.from({ length: 9 }, (_, r) => {
    const shift = (r < 3 ? 0 : r < 6 ? 3 : 6) + Math.floor(r % 3);
    return base.map((_, c) => base[(c + shift) % 9]);
  });
  return g;
}

function isValidSudoku(g) {
  for (let i = 0; i < 9; i++) {
    const row = new Set(g[i].filter(v => v));
    const col = new Set(g.map(r => r[i]).filter(v => v));
    if (row.size !== new Set(g[i]).size || col.size !== new Set(g.map(r => r[i])).size) {
      // Check for duplicates
      const rowVals = g[i].filter(v => v);
      if (new Set(rowVals).size !== rowVals.length) return false;
      const colVals = g.map(r => r[i]).filter(v => v);
      if (new Set(colVals).size !== colVals.length) return false;
    }
  }
  return true;
}

function makePuzzle(difficulty = 'medium') {
  const solution = makeBase();
  const puzzle = solution.map(r => [...r]);
  const removals = difficulty === 'easy' ? 30 : difficulty === 'medium' ? 40 : 50;
  let removed = 0;
  while (removed < removals) {
    const r = Math.floor(Math.random() * 9);
    const c = Math.floor(Math.random() * 9);
    if (puzzle[r][c] !== 0) { puzzle[r][c] = 0; removed++; }
  }
  return { puzzle, solution };
}

function isConflict(grid, row, col, val) {
  // Check row
  if (grid[row].some((v, c) => c !== col && v === val)) return true;
  // Check col
  if (grid.some((r, ri) => ri !== row && r[col] === val)) return true;
  // Check 3x3 box
  const br = Math.floor(row / 3) * 3;
  const bc = Math.floor(col / 3) * 3;
  for (let r = br; r < br + 3; r++)
    for (let c = bc; c < bc + 3; c++)
      if ((r !== row || c !== col) && grid[r][c] === val) return true;
  return false;
}

export default function Sudoku({ user, submitScore, bestScore }) {
  const [state, setState] = useState('menu'); // menu | play | win
  const [{ puzzle, solution }, setGame] = useState({ puzzle: null, solution: null });
  const [grid, setGrid] = useState(null);
  const [selected, setSelected] = useState(null);
  const [errors, setErrors] = useState(new Set());
  const [difficulty, setDifficulty] = useState('medium');
  const [msg, setMsg] = useState('');

  function start() {
    const game = makePuzzle(difficulty);
    setGame(game);
    setGrid(game.puzzle.map(r => [...r]));
    setSelected(null);
    setErrors(new Set());
    setMsg('');
    setState('play');
  }

  function setCell(val) {
    if (!selected) return;
    const [r, c] = selected;
    if (puzzle[r][c] !== 0) return; // bukan sel yang bisa diubah
    const newGrid = grid.map(row => [...row]);
    newGrid[r][c] = val;
    setGrid(newGrid);

    // Cek konflik
    const newErrors = new Set();
    newGrid.forEach((row, ri) => row.forEach((v, ci) => {
      if (v && isConflict(newGrid, ri, ci, v)) newErrors.add(`${ri}-${ci}`);
    }));
    setErrors(newErrors);

    // Cek menang
    const complete = newGrid.every((row, ri) => row.every((v, ci) => v === solution[ri][ci]));
    if (complete) {
      setState('win');
      if (user) submitScore(1).then(d => d && setMsg(`+${d.points} poin! ⭐`));
    }
  }

  const handleKey = useCallback((e) => {
    if (state !== 'play') return;
    const n = parseInt(e.key);
    if (n >= 1 && n <= 9) setCell(n);
    if (e.key === 'Backspace' || e.key === '0') setCell(0);
    if (selected) {
      const [r, c] = selected;
      if (e.key === 'ArrowUp' && r > 0) setSelected([r - 1, c]);
      if (e.key === 'ArrowDown' && r < 8) setSelected([r + 1, c]);
      if (e.key === 'ArrowLeft' && c > 0) setSelected([r, c - 1]);
      if (e.key === 'ArrowRight' && c < 8) setSelected([r, c + 1]);
    }
  }, [state, selected, grid, solution, puzzle]); // eslint-disable-line

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  if (state === 'menu') return (
    <>
      <h1>🟦 Sudoku</h1>
      <p className="muted mb">Isi kisi 9×9 dengan angka 1–9, tanpa pengulangan di baris, kolom, dan kotak 3×3!</p>
      <div className="card" style={{ maxWidth: 460 }}>
        <div className="tutorial-box">
          <h3>📖 Aturan</h3>
          <ul>
            <li>Setiap baris harus berisi angka 1–9 (tanpa ulang).</li>
            <li>Setiap kolom harus berisi angka 1–9 (tanpa ulang).</li>
            <li>Setiap kotak 3×3 harus berisi angka 1–9 (tanpa ulang).</li>
          </ul>
          <p className="small muted">Tips: Mulai dari baris/kolom yang sudah paling banyak terisi.</p>
        </div>
        <label>Tingkat Kesulitan
          <select value={difficulty} onChange={e => setDifficulty(e.target.value)}>
            <option value="easy">Mudah (30 sel kosong)</option>
            <option value="medium">Sedang (40 sel kosong)</option>
            <option value="hard">Sulit (50 sel kosong)</option>
          </select>
        </label>
        {bestScore !== undefined && <p className="small muted">🏆 Sudoku diselesaikan: {bestScore}</p>}
        <button className="btn btn-block mt" onClick={start}>Mulai Sudoku</button>
      </div>
    </>
  );

  if (state === 'win') return (
    <>
      <h1>🟦 Sudoku</h1>
      <div className="card" style={{ maxWidth: 460 }}>
        <h2 className="center">🏆 Selesai!</h2>
        <p className="center">Kamu berhasil menyelesaikan Sudoku!</p>
        {msg && <p className="game-msg center">{msg}</p>}
        <button className="btn btn-block mt" onClick={() => setState('menu')}>Main Lagi</button>
      </div>
    </>
  );

  return (
    <>
      <h1>🟦 Sudoku</h1>
      <div className="sudoku-wrap">
        <div className="sudoku-grid">
          {grid.map((row, r) => row.map((val, c) => {
            const isGiven = puzzle[r][c] !== 0;
            const isSel = selected?.[0] === r && selected?.[1] === c;
            const isHighlight = selected && (selected[0] === r || selected[1] === c ||
              (Math.floor(r / 3) === Math.floor(selected[0] / 3) && Math.floor(c / 3) === Math.floor(selected[1] / 3)));
            const isErr = errors.has(`${r}-${c}`);
            let cls = 'sudoku-cell';
            if (isGiven) cls += ' given';
            if (isSel) cls += ' sel';
            else if (isHighlight) cls += ' hl';
            if (isErr) cls += ' err';
            const borderR = c === 2 || c === 5 ? ' br3' : '';
            const borderB = r === 2 || r === 5 ? ' bb3' : '';
            return (
              <div key={`${r}-${c}`} className={cls + borderR + borderB} onClick={() => !isGiven && setSelected([r, c])}>
                {val || ''}
              </div>
            );
          }))}
        </div>
        <div className="sudoku-numpad">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
            <button key={n} className="sudoku-num" onClick={() => setCell(n)}>{n}</button>
          ))}
          <button className="sudoku-num erase" onClick={() => setCell(0)}>⌫</button>
          <button className="btn btn-outline btn-sm" style={{ gridColumn: 'span 2' }} onClick={start}>Baru</button>
        </div>
      </div>
      <p className="small muted mt">Klik sel lalu ketik angka (1–9), atau gunakan keypad di bawah papan.</p>
    </>
  );
}
