import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';

// Arah geser
const DIR = { ArrowUp: 0, ArrowDown: 1, ArrowLeft: 2, ArrowRight: 3, w: 0, s: 1, a: 2, d: 3 };

function newGrid() {
  const g = Array.from({ length: 4 }, () => Array(4).fill(0));
  return addTile(addTile(g));
}

function addTile(grid) {
  const g = grid.map(r => [...r]);
  const empty = [];
  g.forEach((r, i) => r.forEach((v, j) => v === 0 && empty.push([i, j])));
  if (!empty.length) return g;
  const [i, j] = empty[Math.floor(Math.random() * empty.length)];
  g[i][j] = Math.random() < 0.9 ? 2 : 4;
  return g;
}

function slide(row) {
  const nums = row.filter(v => v);
  const merged = [];
  let added = 0;
  for (let i = 0; i < nums.length; i++) {
    if (nums[i + 1] === nums[i]) { merged.push(nums[i] * 2); added += nums[i] * 2; i++; }
    else merged.push(nums[i]);
  }
  while (merged.length < 4) merged.push(0);
  return { row: merged, added };
}

function move(grid, dir) {
  let g = grid.map(r => [...r]);
  let score = 0;
  let moved = false;

  const transform = (dir === 0 || dir === 1)
    ? (r) => g.map(row => row[r])
    : (r) => g[r];

  const set = (dir === 0 || dir === 1)
    ? (r, arr) => arr.forEach((v, i) => { g[i][r] = v; })
    : (r, arr) => { g[r] = arr; };

  for (let r = 0; r < 4; r++) {
    let row = transform(r);
    if (dir === 1 || dir === 3) row = row.reverse();
    const { row: newRow, added } = slide(row);
    if (dir === 1 || dir === 3) newRow.reverse();
    if (JSON.stringify(row) !== JSON.stringify(dir === 1 || dir === 3 ? [...newRow].reverse() : newRow)) moved = true;
    set(r, newRow);
    score += added;
  }
  return { g, score, moved };
}

function isGameOver(grid) {
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 4; j++) {
      if (grid[i][j] === 0) return false;
      if (j < 3 && grid[i][j] === grid[i][j + 1]) return false;
      if (i < 3 && grid[i][j] === grid[i + 1][j]) return false;
    }
  return true;
}

const COLORS = {
  0: ['#cdc1b4', '#776e65'],
  2: ['#eee4da', '#776e65'],
  4: ['#ede0c8', '#776e65'],
  8: ['#f2b179', '#fff'],
  16: ['#f59563', '#fff'],
  32: ['#f67c5f', '#fff'],
  64: ['#f65e3b', '#fff'],
  128: ['#edcf72', '#fff'],
  256: ['#edcc61', '#fff'],
  512: ['#edc850', '#fff'],
  1024: ['#edc53f', '#fff'],
  2048: ['#edc22e', '#fff'],
};

function cellStyle(val) {
  const [bg, color] = COLORS[val] || ['#3c3a32', '#fff'];
  return { background: bg, color, fontSize: val > 512 ? '1.3rem' : val > 64 ? '1.6rem' : '2rem' };
}

export default function Game2048({ user, submitScore, bestScore, nav }) {
  const [grid, setGrid] = useState(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(bestScore || 0);
  const [over, setOver] = useState(false);
  const [won, setWon] = useState(false);
  const [msg, setMsg] = useState('');
  const scoreRef = useRef(0);

  const startGame = () => {
    setGrid(newGrid()); setScore(0); scoreRef.current = 0;
    setOver(false); setWon(false); setMsg('');
  };

  const handleMove = useCallback((dir) => {
    if (over || won) return;
    setGrid(prev => {
      if (!prev) return prev;
      const { g, score: added, moved } = move(prev, dir);
      if (!moved) return prev;
      scoreRef.current += added;
      setScore(s => s + added);
      setBest(b => Math.max(b, scoreRef.current));
      const newG = addTile(g);
      if (newG.flat().includes(2048) && !won) {
        setWon(true);
      }
      if (isGameOver(newG)) {
        setOver(true);
        const final = scoreRef.current;
        if (user) submitScore(final).then(d => d && setMsg(`+${d.points} poin! ⭐`));
      }
      return newG;
    });
  }, [over, won, user, submitScore]);

  useEffect(() => {
    const handler = (e) => {
      if (DIR[e.key] !== undefined) { e.preventDefault(); handleMove(DIR[e.key]); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleMove]);

  // Touch swipe
  const touch = useRef({});
  const onTouchStart = (e) => { touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
  const onTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - touch.current.x;
    const dy = e.changedTouches[0].clientY - touch.current.y;
    if (Math.abs(dx) > Math.abs(dy)) handleMove(dx > 0 ? 3 : 2);
    else handleMove(dy > 0 ? 1 : 0);
  };

  if (!grid) return (
    <>
      <h1>🎯 2048</h1>
      <p className="muted mb">Geser blok angka (←→↑↓ atau WASD) dan gabungkan hingga mencapai <b>2048</b>!</p>
      <div className="card game-2048-wrap">
        <div className="tutorial-box">
          <h3>📖 Tutorial</h3>
          <ul>
            <li>Gunakan tombol panah atau swipe layar untuk menggeser semua blok.</li>
            <li>Dua blok dengan angka <b>sama</b> yang bertemu akan bergabung menjadi jumlahnya.</li>
            <li>Targetkan blok bernilai <b>2048</b> untuk menang!</li>
            <li>Game berakhir saat papan penuh dan tidak ada gerak yang mungkin.</li>
          </ul>
        </div>
        {bestScore !== undefined && <p className="small muted">🏆 Skor terbaik kamu: {bestScore}</p>}
        <button className="btn btn-block mt" onClick={startGame}>Mulai Game</button>
        {!user && <p className="small muted mt">Masuk untuk menyimpan skor. <Link to="/masuk">Masuk</Link></p>}
      </div>
    </>
  );

  return (
    <>
      <h1>🎯 2048</h1>
      <div className="game-2048-wrap" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div className="g2048-header">
          <div className="g2048-scores">
            <div className="g2048-score"><div className="label">SKOR</div><div className="val">{score}</div></div>
            <div className="g2048-score"><div className="label">TERBAIK</div><div className="val">{Math.max(best, score)}</div></div>
          </div>
          <button className="btn btn-sm" onClick={startGame}>Baru</button>
        </div>
        {(over || won) && (
          <div className="g2048-overlay">
            <div>{won ? '🏆 Kamu menang!' : '😞 Game Over!'}</div>
            <div className="small muted">Skor: {score}</div>
            {msg && <div className="game-msg">{msg}</div>}
            <button className="btn mt" onClick={startGame}>Main Lagi</button>
          </div>
        )}
        <div className="g2048-grid">
          {grid.flat().map((val, i) => (
            <div key={i} className="g2048-cell" style={cellStyle(val)}>
              {val || ''}
            </div>
          ))}
        </div>
        <p className="small muted center mt">Gunakan ←→↑↓ atau swipe untuk menggeser</p>
      </div>
    </>
  );
}
