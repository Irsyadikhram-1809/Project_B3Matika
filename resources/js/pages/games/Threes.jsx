import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';

// Threes!: 1+2=3, lalu N+N=2N untuk N>=3
function canMerge(a, b) {
  if (a === 0 || b === 0) return false;
  if ((a === 1 && b === 2) || (a === 2 && b === 1)) return true;
  return a === b && a >= 3;
}

function mergeVal(a, b) {
  if ((a === 1 && b === 2) || (a === 2 && b === 1)) return 3;
  return a + b;
}

function newThreesGrid() {
  const g = Array.from({ length: 4 }, () => Array(4).fill(0));
  // Mulai dengan 9 tile acak
  const tiles = [1, 1, 1, 2, 2, 2, 3, 3, 3];
  const positions = [];
  while (positions.length < tiles.length) {
    const p = [Math.floor(Math.random() * 4), Math.floor(Math.random() * 4)];
    if (!positions.some(([r, c]) => r === p[0] && c === p[1])) positions.push(p);
  }
  tiles.forEach((v, i) => { g[positions[i][0]][positions[i][1]] = v; });
  return g;
}

function addThreesTile(grid) {
  const g = grid.map(r => [...r]);
  const empty = [];
  g.forEach((r, i) => r.forEach((v, j) => v === 0 && empty.push([i, j])));
  if (!empty.length) return g;
  const [i, j] = empty[Math.floor(Math.random() * empty.length)];
  g[i][j] = [1, 2, 3][Math.floor(Math.random() * 3)];
  return g;
}

function slideThrees(row) {
  let moved = false;
  let scoreAdd = 0;
  const r = [...row];
  for (let i = 0; i < 3; i++) {
    if (r[i] !== 0 && r[i + 1] !== 0 && canMerge(r[i], r[i + 1])) {
      const v = mergeVal(r[i], r[i + 1]);
      r[i] = v; r[i + 1] = 0;
      scoreAdd += v;
      moved = true;
    }
  }
  const nums = r.filter(v => v);
  while (nums.length < 4) nums.push(0);
  return { row: nums, scoreAdd, moved: moved || JSON.stringify(nums) !== JSON.stringify(row) };
}

function moveThrees(grid, dir) {
  let g = grid.map(r => [...r]);
  let score = 0;
  let moved = false;

  for (let r = 0; r < 4; r++) {
    let row = (dir === 0 || dir === 1) ? g.map(row => row[r]) : g[r];
    if (dir === 1 || dir === 3) row = row.reverse();
    const { row: newRow, scoreAdd, moved: m } = slideThrees(row);
    if (m) moved = true;
    if (dir === 1 || dir === 3) newRow.reverse();
    if (dir === 0 || dir === 1) newRow.forEach((v, i) => { g[i][r] = v; });
    else g[r] = newRow;
    score += scoreAdd;
  }
  return { g, score, moved };
}

function isThreesOver(grid) {
  if (grid.flat().includes(0)) return false;
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 4; j++) {
      if (j < 3 && canMerge(grid[i][j], grid[i][j + 1])) return false;
      if (i < 3 && canMerge(grid[i][j], grid[i + 1][j])) return false;
    }
  return true;
}

const DIR = { ArrowLeft: 2, ArrowRight: 3, ArrowUp: 0, ArrowDown: 1 };

function tileColor(v) {
  if (v === 0) return ['#ede0d4', '#776e65'];
  if (v === 1) return ['#ee7b6d', '#fff'];
  if (v === 2) return ['#5ea0e0', '#fff'];
  if (v === 3) return ['#fff0d2', '#776e65'];
  if (v <= 9) return ['#f0d875', '#776e65'];
  if (v <= 24) return ['#e0a855', '#fff'];
  if (v <= 96) return ['#e08555', '#fff'];
  return ['#c05020', '#fff'];
}

export default function Threes({ user, submitScore, bestScore }) {
  const [grid, setGrid] = useState(null);
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(false);
  const [msg, setMsg] = useState('');
  const scoreRef = useRef(0);
  const touch = useRef({});

  const handleMove = useCallback((dir) => {
    if (over) return;
    setGrid(prev => {
      if (!prev) return prev;
      const { g, score: added, moved } = moveThrees(prev, dir);
      if (!moved) return prev;
      scoreRef.current += added;
      setScore(s => s + added);
      const newG = addThreesTile(g);
      if (isThreesOver(newG)) {
        setOver(true);
        const final = scoreRef.current;
        if (user) submitScore(final).then(d => d && setMsg(`+${d.points} poin! ⭐`));
      }
      return newG;
    });
  }, [over, user, submitScore]);

  useEffect(() => {
    const h = (e) => { if (DIR[e.key] !== undefined) { e.preventDefault(); handleMove(DIR[e.key]); } };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [handleMove]);

  const onTouchStart = (e) => { touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
  const onTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - touch.current.x;
    const dy = e.changedTouches[0].clientY - touch.current.y;
    if (Math.abs(dx) > Math.abs(dy)) handleMove(dx > 0 ? 3 : 2);
    else handleMove(dy > 0 ? 1 : 0);
  };

  const start = () => { setGrid(newThreesGrid()); setScore(0); scoreRef.current = 0; setOver(false); setMsg(''); };

  if (!grid) return (
    <>
      <h1>🎲 Threes!</h1>
      <p className="muted mb">Gabungkan angka untuk meraih skor tertinggi sebelum papan penuh!</p>
      <div className="card game-2048-wrap">
        <div className="tutorial-box">
          <h3>📖 Tutorial</h3>
          <ul>
            <li><b style={{ color: '#ee7b6d' }}>1</b> + <b style={{ color: '#5ea0e0' }}>2</b> = <b>3</b></li>
            <li><b>3 + 3 = 6</b>, <b>6 + 6 = 12</b>, dan seterusnya.</li>
            <li>1 dan 2 hanya bisa bergabung satu sama lain, tidak dengan angka lain.</li>
            <li>Geser papan untuk memindahkan semua tile. Setelah tiap gerak, tile baru ditambahkan.</li>
          </ul>
        </div>
        {bestScore !== undefined && <p className="small muted">🏆 Terbaik kamu: {bestScore}</p>}
        <button className="btn btn-block mt" onClick={start}>Mulai Threes!</button>
      </div>
    </>
  );

  return (
    <>
      <h1>🎲 Threes!</h1>
      <div className="game-2048-wrap" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div className="g2048-header">
          <div className="g2048-scores">
            <div className="g2048-score"><div className="label">SKOR</div><div className="val">{score}</div></div>
            {bestScore !== undefined && <div className="g2048-score"><div className="label">TERBAIK</div><div className="val">{Math.max(bestScore, score)}</div></div>}
          </div>
          <button className="btn btn-sm" onClick={start}>Baru</button>
        </div>
        {over && (
          <div className="g2048-overlay">
            <div>😅 Papan Penuh!</div>
            <div className="small muted">Skor Akhir: {score}</div>
            {msg && <div className="game-msg">{msg}</div>}
            <button className="btn mt" onClick={start}>Main Lagi</button>
          </div>
        )}
        <div className="g2048-grid">
          {grid.flat().map((val, i) => {
            const [bg, color] = tileColor(val);
            return <div key={i} className="g2048-cell" style={{ background: bg, color, fontSize: val >= 100 ? '1.3rem' : '1.8rem' }}>{val || ''}</div>;
          })}
        </div>
        <div className="threes-legend">
          <span style={{ background: '#ee7b6d', color: '#fff' }} className="threes-chip">1</span>
          <span>+</span>
          <span style={{ background: '#5ea0e0', color: '#fff' }} className="threes-chip">2</span>
          <span>=</span>
          <span style={{ background: '#fff0d2' }} className="threes-chip">3</span>
        </div>
      </div>
    </>
  );
}
