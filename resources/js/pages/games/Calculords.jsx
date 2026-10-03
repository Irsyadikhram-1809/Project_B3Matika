import { useState } from 'react';

/**
 * Calculords: rangkai angka-angka dengan +, −, × untuk mencapai target.
 * Setiap ronde: 5 angka acak, target acak. Susun ekspresi yang hasilnya = target.
 */

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function makeRound() {
  const nums = Array.from({ length: 5 }, () => rand(1, 9));
  // Target: pilih subset dan operasi yang bisa dicapai
  // Buat target valid dari subset angka-angka tersebut
  const a = nums[0], b = nums[1], c = nums[2];
  const targets = [a + b, a * b, a + b + c, a * b + c, a + b * c, a * b * c].filter(v => v > 0 && v <= 200);
  const target = targets[rand(0, targets.length - 1)];
  return { nums, target };
}

function evaluate(expr) {
  try {
    // Hanya izinkan karakter aman
    if (!/^[\d\s+\-*]+$/.test(expr)) return null;
    // Gunakan Function sebagai evaluator (bukan eval global)
    // eslint-disable-next-line no-new-func
    const result = new Function(`return (${expr})`)();
    return typeof result === 'number' && isFinite(result) ? result : null;
  } catch { return null; }
}

const OPS = ['+', '-', '*'];

export default function Calculords({ user, submitScore, bestScore }) {
  const [state, setState] = useState('menu');
  const [round, setRound] = useState(null);
  const [expr, setExpr] = useState('');
  const [usedIdxs, setUsedIdxs] = useState([]);
  const [score, setScore] = useState(0);
  const [roundNum, setRoundNum] = useState(1);
  const [feedback, setFeedback] = useState(null);
  const [msg, setMsg] = useState('');
  const MAX_ROUNDS = 8;

  function start() {
    setRound(makeRound());
    setExpr('');
    setUsedIdxs([]);
    setScore(0);
    setRoundNum(1);
    setFeedback(null);
    setMsg('');
    setState('play');
  }

  function addNum(idx) {
    if (usedIdxs.includes(idx)) return;
    setExpr(e => e + round.nums[idx]);
    setUsedIdxs(prev => [...prev, idx]);
  }

  function addOp(op) {
    setExpr(e => e + ' ' + op + ' ');
  }

  function clearExpr() {
    setExpr('');
    setUsedIdxs([]);
  }

  function check() {
    const result = evaluate(expr.trim());
    if (result === null) {
      setFeedback({ ok: false, msg: 'Ekspresi tidak valid.' });
      return;
    }
    if (Math.round(result) === round.target) {
      setFeedback({ ok: true, msg: `✅ Tepat! ${expr.trim()} = ${round.target}` });
      const newScore = score + 1;
      setScore(newScore);
      if (roundNum >= MAX_ROUNDS) {
        setState('done');
        if (user) submitScore(newScore * 25).then(d => d && setMsg(`+${d.points} poin! ⭐`));
      }
    } else {
      setFeedback({ ok: false, msg: `❌ Hasilnya ${Math.round(result)}, bukan ${round.target}. Coba lagi!` });
    }
  }

  function nextRound() {
    if (roundNum >= MAX_ROUNDS) { setState('done'); return; }
    setRound(makeRound());
    setExpr('');
    setUsedIdxs([]);
    setFeedback(null);
    setRoundNum(r => r + 1);
  }

  function skip() {
    if (roundNum >= MAX_ROUNDS) { setState('done'); return; }
    setFeedback(null);
    nextRound();
  }

  if (state === 'menu') return (
    <>
      <h1>🃏 Calculords</h1>
      <p className="muted mb">Rangkai angka-angka dengan operasi +, −, × untuk mencapai target!</p>
      <div className="card" style={{ maxWidth: 500 }}>
        <div className="tutorial-box">
          <h3>📖 Tutorial</h3>
          <ul>
            <li>Setiap ronde: kamu mendapat 5 kartu angka dan 1 target.</li>
            <li>Pilih angka dan operasi (+, −, ×) untuk membuat ekspresi = target.</li>
            <li>Kamu tidak harus menggunakan semua angka.</li>
            <li>Tanda kurung otomatis mengikuti prioritas operasi (× sebelum + dan −).</li>
            <li>{MAX_ROUNDS} ronde total. Setiap ronde benar = +1 skor.</li>
          </ul>
        </div>
        {bestScore !== undefined && <p className="small muted">🏆 Terbaik: {bestScore}</p>}
        <button className="btn btn-block mt" onClick={start}>Mulai Calculords!</button>
      </div>
    </>
  );

  if (state === 'done') return (
    <>
      <h1>🃏 Calculords</h1>
      <div className="card" style={{ maxWidth: 460 }}>
        <h2 className="center">Selesai! 🎉</h2>
        <p className="center">Skor: <b>{score}</b> / {MAX_ROUNDS} ronde benar</p>
        {msg && <p className="game-msg center">{msg}</p>}
        {bestScore !== undefined && <p className="small muted center">🏆 Terbaik: {bestScore}</p>}
        <button className="btn btn-block mt" onClick={start}>Main Lagi</button>
      </div>
    </>
  );

  return (
    <>
      <h1>🃏 Calculords</h1>
      <div className="card" style={{ maxWidth: 520 }}>
        <div className="row between">
          <span className="tag">Ronde {roundNum}/{MAX_ROUNDS}</span>
          <span className="pts">Skor: {score}</span>
        </div>
        <div className="calculords-target">
          Target: <span>{round.target}</span>
        </div>
        <div className="calculords-expr">
          {expr || <span className="muted">Pilih angka dan operator…</span>}
        </div>
        <div className="calculords-cards">
          {round.nums.map((n, i) => (
            <button
              key={i}
              className={`calculords-card ${usedIdxs.includes(i) ? 'used' : ''}`}
              onClick={() => addNum(i)}
              disabled={usedIdxs.includes(i)}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="calculords-ops">
          {OPS.map(op => (
            <button key={op} className="calculords-op" onClick={() => addOp(op)}>{op === '*' ? '×' : op}</button>
          ))}
          <button className="calculords-op erase" onClick={clearExpr}>↺</button>
        </div>
        {feedback && (
          <div className={`feedback mt ${feedback.ok ? 'good' : 'wrong'}`}>{feedback.msg}</div>
        )}
        <div className="row mt" style={{ gap: 8 }}>
          {!feedback?.ok ? (
            <>
              <button className="btn" onClick={check} disabled={!expr.trim()}>Cek!</button>
              <button className="btn btn-ghost" onClick={skip}>Lewati</button>
            </>
          ) : (
            <button className="btn" onClick={nextRound}>
              {roundNum < MAX_ROUNDS ? 'Ronde Berikutnya →' : 'Lihat Hasil'}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
