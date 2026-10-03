import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const R = (n) => 1 + Math.floor(Math.random() * n);

function makeQ(opMode) {
  const op = opMode === 'mix' ? ['+', '-', 'x'][Math.floor(Math.random() * 3)] : opMode;
  let a = R(20), b = R(op === 'x' ? 10 : 20);
  if (op === '-' && b > a) [a, b] = [b, a];
  const ans = op === '+' ? a + b : op === '-' ? a - b : a * b;
  return { text: `${a} ${op === 'x' ? '×' : op} ${b} = ?`, ans };
}

export default function KilatHitung({ user, submitScore, bestScore, nav }) {
  const [op, setOp] = useState('+');
  const [state, setState] = useState('idle');
  const [time, setTime] = useState(30);
  const [score, setScore] = useState(0);
  const [q, setQ] = useState(null);
  const [val, setVal] = useState('');
  const [msg, setMsg] = useState('');
  const scoreRef = useRef(0);
  const inputRef = useRef(null);

  function start() {
    scoreRef.current = 0; setScore(0); setTime(30); setMsg(''); setVal('');
    setQ(makeQ(op)); setState('play');
  }

  useEffect(() => {
    if (state !== 'play') return;
    inputRef.current?.focus();
    const t = setInterval(() => setTime((x) => x - 1), 1000);
    return () => clearInterval(t);
  }, [state]);

  useEffect(() => {
    if (state !== 'play' || time > 0) return;
    setState('idle');
    const final = scoreRef.current;
    if (!user) return setMsg(`Waktu habis! Skor: ${final}. Masuk untuk menyimpan poin.`);
    setMsg(`Waktu habis! Skor: ${final}. Mengirim poin…`);
    submitScore(final).then((d) => {
      if (d) setMsg(`Waktu habis! Skor: ${final}. +${d.points} poin! ⭐`);
    });
  }, [time]); // eslint-disable-line

  function submit(e) {
    e.preventDefault();
    if (val === '') return;
    if (+val === q.ans) { scoreRef.current += 1; setScore(scoreRef.current); }
    setQ(makeQ(op)); setVal('');
  }

  return (
    <>
      <h1>⚡ Kilat Hitung</h1>
      <p className="muted mb">Jawab sebanyak mungkin dalam 30 detik. Setiap 2 skor = 1 poin (maks 40/game).</p>
      {bestScore !== undefined && <p className="small muted">🏆 Terbaik kamu: {bestScore}</p>}
      <div className="card game">
        {state === 'idle' ? (
          <>
            <label>Jenis soal
              <select value={op} onChange={(e) => setOp(e.target.value)}>
                <option value="+">Penjumlahan</option>
                <option value="-">Pengurangan</option>
                <option value="x">Perkalian</option>
                <option value="mix">Campuran</option>
              </select>
            </label>
            <button className="btn btn-block" onClick={start}>Mulai!</button>
            {!user && <p className="small muted mt">Kamu belum masuk. <Link to="/masuk">Masuk</Link> agar poin tersimpan.</p>}
          </>
        ) : (
          <form onSubmit={submit} className="center">
            <div className="game-bar"><span>⏱ <b>{time}</b>s</span><span>Skor: <b>{score}</b></span></div>
            <div className="game-q">{q.text}</div>
            <input ref={inputRef} type="number" value={val} onChange={(e) => setVal(e.target.value)} className="game-input" autoFocus />
            <button className="btn mt">Jawab</button>
          </form>
        )}
        {msg && <p className="game-msg">{msg}</p>}
      </div>
    </>
  );
}
