import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import NotFound from '@/components/NotFound';

// Render materi content – supports a simple markdown-like DSL written in the DB
// Lines starting with ## = section heading, ### = sub-heading, **text** = bold, - = list item
function MateriRenderer({ content }) {
  if (!content) return <p className="muted">Materi belum tersedia.</p>;

  const lines = content.split('\n');
  const elements = [];
  let listItems = [];
  let key = 0;

  const flushList = () => {
    if (listItems.length) {
      elements.push(<ul key={key++} className="materi-list">{listItems}</ul>);
      listItems = [];
    }
  };

  const renderInline = (text) => {
    // bold **text**, inline code `text`
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return parts.map((p, i) => {
      if (p.startsWith('**') && p.endsWith('**')) return <strong key={i}>{p.slice(2, -2)}</strong>;
      if (p.startsWith('`') && p.endsWith('`')) return <code key={i} className="inline-code">{p.slice(1, -1)}</code>;
      return p;
    });
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <div key={key++} className="materi-section-header">
          <span className="materi-section-icon">{trimmed.match(/^## ([\u{1F000}-\u{1FFFF}]|[\u2600-\u27BF])/u)?.[1] || '📌'}</span>
          <h2 className="materi-section-title">{trimmed.slice(3).replace(/^[\u{1F000}-\u{1FFFF}]|[\u2600-\u27BF]\s*/u, '')}</h2>
        </div>
      );
    } else if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(<h3 key={key++} className="materi-sub-title">{trimmed.slice(4)}</h3>);
    } else if (trimmed.startsWith('> ')) {
      flushList();
      elements.push(
        <blockquote key={key++} className="materi-quote">
          {renderInline(trimmed.slice(2))}
        </blockquote>
      );
    } else if (trimmed.startsWith('```')) {
      flushList();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <pre key={key++} className="materi-code-block"><code>{codeLines.join('\n')}</code></pre>
      );
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      listItems.push(<li key={key++}>{renderInline(trimmed.slice(2))}</li>);
    } else if (trimmed.startsWith('[Langkah')) {
      flushList();
      const match = trimmed.match(/^\[(.+?)\](.*)/);
      if (match) {
        elements.push(
          <div key={key++} className="materi-step">
            <span className="materi-step-label">{match[1]}</span>
            <span>{renderInline(match[2].trim())}</span>
          </div>
        );
      }
    } else if (trimmed === '---') {
      flushList();
      elements.push(<hr key={key++} className="materi-divider" />);
    } else if (trimmed === '') {
      flushList();
      elements.push(<div key={key++} className="materi-spacer" />);
    } else {
      flushList();
      elements.push(<p key={key++} className="materi-para">{renderInline(trimmed)}</p>);
    }
  }
  flushList();
  return <div className="materi-content">{elements}</div>;
}

function ProgressBar({ answered, total }) {
  const pct = total ? Math.round((answered / total) * 100) : 0;
  return (
    <div className="progress-wrap">
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="progress-label">{answered}/{total} soal dijawab</span>
    </div>
  );
}

function DifficultyBadge({ d }) {
  const map = { 1: ['Mudah', 'badge-easy'], 2: ['Sedang', 'badge-med'], 3: ['Sulit', 'badge-hard'] };
  const [label, cls] = map[d] || ['?', ''];
  return <span className={`difficulty-badge ${cls}`}>{label}</span>;
}

export default function Topic() {
  const { id } = useParams();
  const { user, setUser } = useAuth();
  const nav = useNavigate();
  const [data, setData] = useState(null);
  const [err, setErr] = useState(false);
  const [res, setRes] = useState({});
  const [tab, setTab] = useState('materi');
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    api(`/topics/detail?topic=${id}`).then(setData).catch(() => setErr(true));
  }, [id]);

  function switchTab(t) {
    if (t === tab) return;
    setAnimating(true);
    setTimeout(() => { setTab(t); setAnimating(false); }, 180);
  }

  async function pick(q, i) {
    if (!user) return nav('/masuk');
    try {
      const d = await api(`/questions/answer?id=${q.id}`, { method: 'POST', body: { choice: i } });
      setRes((r) => ({ ...r, [q.id]: { ...d, chosen: i } }));
      if (d.user) setUser(d.user);
    } catch (e) { 
      if (e.status === 401) return nav('/masuk'); 
      alert(e.message || 'Terjadi kesalahan jaringan.');
    }
  }

  if (err) return <NotFound />;
  if (!data) return (
    <div className="loading-state">
      <div className="loading-spinner" />
      <p className="muted">Memuat materi…</p>
    </div>
  );

  const { topic, questions } = data;
  const answered = Object.keys(res).length;
  const correct = Object.values(res).filter(r => r.correct).length;

  return (
    <>
      <div className="topic-breadcrumb">
        <Link to="/materi" className="back" onClick={(e) => { e.preventDefault(); nav(-1); }}>← Semua Kelas</Link>
        <span className="breadcrumb-sep">›</span>
        <Link to={`/kelas/${topic.grade}`} className="back" onClick={(e) => { e.preventDefault(); nav(-1); }}>Kelas {topic.grade}</Link>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">{topic.title}</span>
      </div>

      <div className="topic-hero">
        <div className="topic-hero-badge">
          {topic.grade <= 6 ? '🏫 SD' : topic.grade <= 9 ? '🏛️ SMP' : '🎓 SMA/SMK'}
          <span className="topic-hero-grade">Kelas {topic.grade}</span>
        </div>
        <h1 className="topic-title">{topic.title}</h1>
        <p className="topic-desc muted">{questions.length} soal latihan · {topic.grade <= 6 ? 'Fondasi Konkret' : topic.grade <= 9 ? 'Transisi ke Aljabar' : 'Analisis & Penerapan'}</p>
      </div>

      {/* Tab Navigation */}
      <div className="topic-tabs">
        <button
          className={`topic-tab ${tab === 'materi' ? 'active' : ''}`}
          onClick={() => switchTab('materi')}
          id="tab-materi"
        >
          <span className="topic-tab-icon">📖</span>
          <span>Tutorial Materi</span>
        </button>
        <button
          className={`topic-tab ${tab === 'latihan' ? 'active' : ''}`}
          onClick={() => switchTab('latihan')}
          id="tab-latihan"
        >
          <span className="topic-tab-icon">✏️</span>
          <span>Latihan Soal</span>
          {answered > 0 && <span className="topic-tab-badge">{answered}</span>}
        </button>
      </div>

      <div className={`tab-panel ${animating ? 'tab-fade-out' : 'tab-fade-in'}`}>

        {/* ====== MATERI TAB ====== */}
        {tab === 'materi' && (
          <div className="materi-wrap">
            {/* Learning objectives card */}
            <div className="materi-objectives">
              <div className="objectives-header">
                <span>🎯</span>
                <strong>Tujuan Belajar</strong>
              </div>
              <p className="objectives-text">
                Setelah mempelajari materi ini, kamu akan memahami konsep <strong>{topic.title}</strong> dan mampu mengerjakan soal-soal yang berkaitan dengan topik ini.
              </p>
              <div className="objectives-meta">
                <span className="obj-chip">📚 Baca materi</span>
                <span className="obj-arrow">→</span>
                <span className="obj-chip">🧠 Pahami contoh</span>
                <span className="obj-arrow">→</span>
                <span className="obj-chip">✏️ Latihan soal</span>
              </div>
            </div>

            {/* Main materi content */}
            <div className="card materi-card">
              <MateriRenderer content={topic.content} />
            </div>

            {/* Proceed to latihan */}
            <div className="materi-cta">
              <div className="materi-cta-text">
                <span>✅</span>
                <span>Sudah paham materinya? Ayo uji kemampuanmu!</span>
              </div>
              <button className="btn btn-lg materi-cta-btn" onClick={() => switchTab('latihan')}>
                Mulai Latihan Soal →
              </button>
            </div>
          </div>
        )}

        {/* ====== LATIHAN TAB ====== */}
        {tab === 'latihan' && (
          <div className="latihan-wrap">
            {/* Guidance banner */}
            <div className="latihan-guide">
              <div className="guide-icon">💡</div>
              <div className="guide-body">
                <strong>Petunjuk Mengerjakan Soal</strong>
                <ul className="guide-list">
                  <li>Baca soal dengan teliti sebelum menjawab</li>
                  <li>Pilih jawaban yang paling tepat dari opsi yang tersedia</li>
                  <li>Setelah menjawab, baca penjelasan untuk memahami cara pengerjaannya</li>
                  <li>Setiap soal hanya bisa dijawab <strong>satu kali</strong> — poin hanya dihitung di percobaan pertama</li>
                </ul>
              </div>
              <button className="guide-back-btn" onClick={() => switchTab('materi')}>
                ← Baca Materi Lagi
              </button>
            </div>

            {!user && (
              <div className="notice latihan-login-notice">
                <span>🔐</span> Masuk dulu untuk mengerjakan soal dan mendapatkan poin.{' '}
                <Link to="/masuk" className="notice-link">Masuk sekarang</Link>
              </div>
            )}

            {/* Progress */}
            {questions.length > 0 && (
              <div className="latihan-progress-wrap">
                <ProgressBar answered={answered} total={questions.length} />
                {answered > 0 && (
                  <span className="score-summary">
                    ✅ {correct} benar · ❌ {answered - correct} salah
                  </span>
                )}
              </div>
            )}

            {/* Questions */}
            {!questions.length && (
              <div className="card center" style={{ padding: '40px 20px' }}>
                <p className="muted">Belum ada soal latihan untuk topik ini.</p>
                <button className="btn btn-outline mt" onClick={() => switchTab('materi')}>← Kembali ke Materi</button>
              </div>
            )}

            {questions.map((q, n) => {
              const r = res[q.id];
              return (
                <div key={q.id} className={`question-card ${r ? (r.correct ? 'answered-correct' : 'answered-wrong') : ''}`}>
                  <div className="question-header">
                    <span className="question-num">Soal {n + 1}</span>
                    <DifficultyBadge d={q.difficulty} />
                    <span className="pts">+{10 * q.difficulty} poin</span>
                  </div>
                  <p className="q-text">{q.text}</p>
                  <div className="options-grid">
                    {q.options.map((o, i) => {
                      let cls = 'opt-btn';
                      if (r) {
                        if (i === r.answer) cls += ' opt-correct';
                        else if (i === r.chosen) cls += ' opt-wrong';
                      }
                      return (
                        <button
                          key={i}
                          className={cls}
                          disabled={!!r}
                          onClick={() => pick(q, i)}
                        >
                          <span className="opt-letter">{String.fromCharCode(65 + i)}</span>
                          <span className="opt-text">{o}</span>
                        </button>
                      );
                    })}
                  </div>
                  {r && (
                    <div className={`question-feedback ${r.correct ? 'feedback-correct' : 'feedback-wrong'}`}>
                      <div className="feedback-icon">{r.correct ? '✅' : '❌'}</div>
                      <div className="feedback-body">
                        <div className="feedback-verdict">
                          {r.correct ? 'Jawaban Benar!' : 'Belum Tepat'}
                          {r.points ? <span className="feedback-points"> +{r.points} poin! ⭐</span> : null}
                          {!r.counted && !r.points ? <span className="feedback-points"> (poin hanya untuk percobaan pertama)</span> : null}
                        </div>
                        {r.explanation && (
                          <div className="feedback-explanation">
                            <strong>💬 Penjelasan:</strong> {r.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Completion summary */}
            {answered === questions.length && questions.length > 0 && (
              <div className="completion-card">
                <div className="completion-icon">🏆</div>
                <h3>Semua Soal Selesai!</h3>
                <p className="muted">Skor kamu: <strong>{correct}/{questions.length}</strong> ({Math.round((correct / questions.length) * 100)}% benar)</p>
                <div className="completion-actions">
                  <button className="btn btn-outline" onClick={() => switchTab('materi')}>📖 Pelajari Lagi</button>
                  <Link to={`/kelas/${topic.grade}`} className="btn">← Topik Lain</Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
