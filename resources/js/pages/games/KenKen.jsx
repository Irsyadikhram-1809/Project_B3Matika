import { useState } from 'react';

/**
 * KenKen (MathDoku) 4×4 sederhana.
 * Grid 4×4 dengan angka 1–4, cage berisi target operasi.
 */
const PUZZLES = [
  {
    size: 4,
    cages: [
      { cells: [[0,0],[0,1]], op: '+', target: 5 },
      { cells: [[0,2],[0,3],[1,3]], op: '+', target: 7 },
      { cells: [[1,0],[1,1]], op: '-', target: 1 },
      { cells: [[1,2],[2,2]], op: '÷', target: 2 },
      { cells: [[2,0],[3,0]], op: '×', target: 4 },
      { cells: [[2,1],[2,3]], op: '+', target: 7 },
      { cells: [[3,1],[3,2]], op: '-', target: 1 },
      { cells: [[3,3]], op: '', target: 4 },
    ],
    solution: [
      [2, 3, 1, 4],
      [3, 2, 4, 1],
      [1, 4, 2, 3],
      [4, 1, 3, 4],
    ],
  },
  {
    size: 4,
    cages: [
      { cells: [[0,0],[1,0]], op: '×', target: 6 },
      { cells: [[0,1],[0,2]], op: '+', target: 5 },
      { cells: [[0,3],[1,3]], op: '-', target: 2 },
      { cells: [[1,1],[1,2]], op: '÷', target: 2 },
      { cells: [[2,0],[2,1]], op: '+', target: 3 },
      { cells: [[2,2],[2,3],[3,3]], op: '+', target: 9 },
      { cells: [[3,0],[3,1]], op: '×', target: 12 },
      { cells: [[3,2]], op: '', target: 2 },
    ],
    solution: [
      [2, 3, 2, 4],
      [3, 2, 1, 2],
      [1, 2, 4, 3],
      [4, 3, 2, 4],
    ],
  },
];

function cellLabel(cage) {
  if (!cage.op) return `${cage.target}`;
  return `${cage.target}${cage.op}`;
}

function checkCage(grid, cage) {
  const vals = cage.cells.map(([r, c]) => grid[r][c]).filter(v => v > 0);
  if (vals.length !== cage.cells.length) return false;
  if (!cage.op) return vals[0] === cage.target;
  if (cage.op === '+') return vals.reduce((a, b) => a + b, 0) === cage.target;
  if (cage.op === '×') return vals.reduce((a, b) => a * b, 1) === cage.target;
  if (cage.op === '-') { const s = vals.sort((a, b) => b - a); return s[0] - s[1] === cage.target; }
  if (cage.op === '÷') { const s = vals.sort((a, b) => b - a); return s[0] / s[1] === cage.target; }
  return false;
}

function isRowColValid(grid, size) {
  for (let i = 0; i < size; i++) {
    const row = grid[i].filter(v => v > 0);
    if (new Set(row).size !== row.length) return false;
    const col = grid.map(r => r[i]).filter(v => v > 0);
    if (new Set(col).size !== col.length) return false;
  }
  return true;
}

export default function KenKen({ user, submitScore, bestScore }) {
  const [pidx, setPidx] = useState(0);
  const [state, setState] = useState('menu');
  const [grid, setGrid] = useState(null);
  const [selected, setSelected] = useState(null);
  const [msg, setMsg] = useState('');
  const [won, setWon] = useState(false);
  const [solvedCount, setSolvedCount] = useState(0);

  const puzzle = PUZZLES[pidx];

  function start() {
    setGrid(Array.from({ length: puzzle.size }, () => Array(puzzle.size).fill(0)));
    setSelected(null);
    setMsg('');
    setWon(false);
    setState('play');
  }

  function setVal(val) {
    if (!selected || won) return;
    const [r, c] = selected;
    const newGrid = grid.map(row => [...row]);
    newGrid[r][c] = newGrid[r][c] === val ? 0 : val;
    setGrid(newGrid);

    // Cek selesai
    const allFilled = newGrid.every(row => row.every(v => v > 0));
    if (allFilled && isRowColValid(newGrid, puzzle.size) && puzzle.cages.every(cage => checkCage(newGrid, cage))) {
      setWon(true);
      setSolvedCount(s => s + 1);
      if (user) submitScore(1).then(d => d && setMsg(`+${d.points} poin! ⭐`));
    }
  }

  function getCageForCell(r, c) {
    return puzzle.cages.findIndex(cage => cage.cells.some(([cr, cc]) => cr === r && cc === c));
  }

  function isTopLeftOfCage(r, c, cageIdx) {
    const cage = puzzle.cages[cageIdx];
    const minR = Math.min(...cage.cells.map(([cr]) => cr));
    const minC = Math.min(...cage.cells.filter(([cr]) => cr === minR).map(([, cc]) => cc));
    return r === minR && c === minC;
  }

  if (state === 'menu') return (
    <>
      <h1>🔢 KenKen (MathDoku)</h1>
      <p className="muted mb">Isi kisi 4×4 dengan angka 1–4 sambil memenuhi target operasi di setiap kotak cage!</p>
      <div className="card" style={{ maxWidth: 460 }}>
        <div className="tutorial-box">
          <h3>📖 Aturan</h3>
          <ul>
            <li>Setiap baris dan kolom berisi angka 1–4 tanpa ulang.</li>
            <li>Angka dalam setiap <b>cage</b> (garis tebal) harus menghasilkan target menggunakan operasi yang ditentukan (+, −, ×, ÷).</li>
            <li>Cage 1 sel: isi tepat dengan angka target tersebut.</li>
          </ul>
          <p className="small muted">Contoh: "6×" artinya angka-angka dalam cage dikalikan = 6.</p>
        </div>
        {bestScore !== undefined && <p className="small muted">🏆 Diselesaikan: {bestScore}</p>}
        <button className="btn btn-block mt" onClick={start}>Mulai KenKen!</button>
      </div>
    </>
  );

  const cageColors = ['#fff3e0', '#e8f5e9', '#e3f2fd', '#fce4ec', '#f3e5f5', '#e0f2f1', '#fff8e1', '#fbe9e7'];

  return (
    <>
      <h1>🔢 KenKen</h1>
      <p className="muted mb">Klik sel, lalu pilih angka. Penuhi target setiap cage!</p>
      <div className="kenken-wrap">
        <div className="kenken-grid" style={{ gridTemplateColumns: `repeat(${puzzle.size}, 1fr)` }}>
          {Array.from({ length: puzzle.size }, (_, r) =>
            Array.from({ length: puzzle.size }, (_, c) => {
              const cageIdx = getCageForCell(r, c);
              const cage = puzzle.cages[cageIdx];
              const isSel = selected?.[0] === r && selected?.[1] === c;
              const showLabel = cageIdx >= 0 && isTopLeftOfCage(r, c, cageIdx);
              const val = grid[r][c];
              const cageOk = cage && checkCage(grid, cage);
              return (
                <div
                  key={`${r}-${c}`}
                  className={`kenken-cell ${isSel ? 'sel' : ''} ${won && cageOk ? 'cage-ok' : ''}`}
                  style={{ background: cageIdx >= 0 ? cageColors[cageIdx % cageColors.length] : '#fff' }}
                  onClick={() => setSelected([r, c])}
                >
                  {showLabel && <span className="cage-label">{cellLabel(cage)}</span>}
                  <span className="kenken-val">{val || ''}</span>
                </div>
              );
            })
          )}
        </div>
        <div className="kenken-numpad">
          {Array.from({ length: puzzle.size }, (_, i) => (
            <button key={i + 1} className="sudoku-num" onClick={() => setVal(i + 1)}>{i + 1}</button>
          ))}
          <button className="sudoku-num erase" onClick={() => setVal(0)}>⌫</button>
        </div>
      </div>
      {won && (
        <div className="card mt" style={{ maxWidth: 400 }}>
          <h2 className="center">🎉 Berhasil!</h2>
          {msg && <p className="game-msg center">{msg}</p>}
          <div className="row center mt">
            {pidx + 1 < PUZZLES.length
              ? <button className="btn" onClick={() => { setPidx(i => i + 1); start(); }}>Puzzle Berikutnya →</button>
              : <button className="btn" onClick={() => { setPidx(0); setState('menu'); }}>Kembali ke Menu</button>
            }
          </div>
        </div>
      )}
      {!won && <button className="btn btn-ghost btn-sm mt" onClick={start}>Reset</button>}
    </>
  );
}
