import { useState } from 'react';

const RIDDLES = [
  { q: 'Urutan berikutnya dari: 2, 4, 8, 16, 32, …', ans: 64, hint: 'Setiap bilangan dikali 2.' },
  { q: 'Urutan berikutnya dari: 1, 1, 2, 3, 5, 8, 13, …', ans: 21, hint: 'Deret Fibonacci: tiap bilangan = jumlah dua sebelumnya.' },
  { q: 'Angka berapa yang jika dikali 3 kemudian dikurangi 5 hasilnya 10?', ans: 5, hint: '3x − 5 = 10 → 3x = 15 → x = 5.' },
  { q: 'Ada 5 anak ayam. 3 di antaranya menetas hari ini. Berapa yang sudah ada sebelumnya?', ans: 2, hint: '5 − 3 = 2.' },
  { q: 'Sebuah persegi memiliki keliling 20 cm. Berapa panjang sisinya?', ans: 5, hint: 'K = 4s → s = 20÷4 = 5.' },
  { q: 'Berapakah nilai dari 7² − 6²?', ans: 13, hint: '7²=49, 6²=36, 49−36=13. Atau: (7+6)(7−6) = 13×1 = 13.' },
  { q: 'Jumlah sudut dalam segitiga adalah …°', ans: 180, hint: 'Jumlah sudut dalam segitiga selalu 180°.' },
  { q: 'Urutan berikutnya: 3, 6, 11, 18, 27, …', ans: 38, hint: 'Beda bertambah: +3, +5, +7, +9, +11 → 27+11=38.' },
  { q: 'Jika f(x) = 3x + 2, berapa f(4)?', ans: 14, hint: 'f(4) = 3×4 + 2 = 12 + 2 = 14.' },
  { q: '√144 = ?', ans: 12, hint: '12 × 12 = 144.' },
  { q: 'Berapakah 15% dari 80?', ans: 12, hint: '15/100 × 80 = 12.' },
  { q: 'Suku ke-5 dari barisan 3, 7, 11, 15, … adalah?', ans: 19, hint: 'b=4; U5 = 3 + 4×4 = 19.' },
  { q: 'Berapa banyak bilangan prima antara 1 dan 20?', ans: 8, hint: '2, 3, 5, 7, 11, 13, 17, 19.' },
  { q: 'Jika sebuah persegi panjang memiliki luas 48 dan lebar 6, berapakah panjangnya?', ans: 8, hint: 'L = p×l → 48 = p×6 → p = 8.' },
  { q: 'Berapakah nilai x jika 2x + 1 = 4x − 5?', ans: 3, hint: '2x+1=4x−5 → 6=2x → x=3.' },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function MathRiddles({ user, submitScore, bestScore }) {
  const [pool] = useState(() => shuffle(RIDDLES));
  const [idx, setIdx] = useState(0);
  const [val, setVal] = useState('');
  const [result, setResult] = useState(null); // null | 'ok' | 'wrong'
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [msg, setMsg] = useState('');

  const riddle = pool[idx];

  function check(e) {
    e.preventDefault();
    const correct = parseInt(val, 10) === riddle.ans;
    setResult(correct ? 'ok' : 'wrong');
    if (correct) setScore(s => s + 1);
  }

  function next() {
    if (idx + 1 >= pool.length) {
      setDone(true);
      if (user) submitScore(score + (result === 'ok' ? 1 : 0)).then(d => d && setMsg(`+${d.points} poin! ⭐`));
    } else {
      setIdx(i => i + 1);
      setVal('');
      setResult(null);
    }
  }

  function restart() {
    setIdx(0); setVal(''); setResult(null); setScore(0); setDone(false); setMsg('');
  }

  if (done) return (
    <>
      <h1>Math Riddles</h1>
      <div className="card game">
        <h2 className="center">Selesai! 🎉</h2>
        <p className="center">Skor kamu: <b>{score}</b> / {pool.length}</p>
        {msg && <p className="game-msg center">{msg}</p>}
        {bestScore !== undefined && <p className="small muted center">🏆 Terbaik: {bestScore}</p>}
        <button className="btn btn-block mt" onClick={restart}>Main Lagi</button>
      </div>
    </>
  );

  return (
    <>
      <h1>Math Riddles</h1>
      <p className="muted mb">Jawab semua teka-teki! Soal {idx + 1} dari {pool.length}</p>
      <div className="card game" style={{ maxWidth: 560 }}>
        <div className="game-bar">
          <span>Soal {idx + 1}/{pool.length}</span>
          <span>Skor: <b>{score}</b></span>
        </div>
        <p className="q-text" style={{ fontSize: '1.1rem', marginTop: 16 }}>{riddle.q}</p>
        {result && (
          <div className={`feedback ${result === 'ok' ? 'good' : 'wrong'}`} style={{ marginBottom: 8 }}>
            {result === 'ok' ? '✅ Benar!' : `❌ Salah. Jawaban: ${riddle.ans}`}
            <br /><span className="hint">{riddle.hint}</span>
          </div>
        )}
        {!result && (
          <form onSubmit={check} className="row" style={{ gap: 10, marginTop: 12 }}>
            <input type="number" value={val} onChange={e => setVal(e.target.value)} placeholder="Jawaban…" style={{ flex: 1 }} autoFocus />
            <button className="btn" disabled={val === ''}>Cek</button>
          </form>
        )}
        {result && (
          <button className="btn btn-block mt" onClick={next}>
            {idx + 1 < pool.length ? 'Soal Berikutnya →' : 'Lihat Hasil'}
          </button>
        )}
      </div>
    </>
  );
}
