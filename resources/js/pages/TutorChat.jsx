import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import ReactMarkdown from 'react-markdown';

const QUICK_PROMPTS = [
  { label: '📐 Materi SD', text: 'Saya ingin belajar materi matematika SD kelas 4 tentang pecahan' },
  { label: '📏 Materi SMP', text: 'Jelaskan Teorema Pythagoras untuk kelas 8 SMP' },
  { label: '📊 Materi SMA', text: 'Ajari saya tentang turunan fungsi untuk kelas 11 SMA' },
  { label: '🧩 Main Teka-teki', text: 'Ayo bermain teka-teki matematika! Saya mau yang tingkat sederhana' },
  { label: '🔢 Cryptarithm', text: 'Buatkan soal Cryptarithm dasar yang baru untuk saya coba' },
  { label: '🎯 Sudoku Mini', text: 'Saya ingin bermain Sudoku Mini 4x4, tolong buatkan soalnya' },
];

function TypingIndicator() {
  return (
    <div className="chat-bubble chat-bubble-ai">
      <div className="chat-avatar chat-avatar-ai">🤖</div>
      <div className="chat-msg-body">
        <div className="typing-dots">
          <span /><span /><span />
        </div>
      </div>
    </div>
  );
}

function ChatMessage({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`chat-bubble ${isUser ? 'chat-bubble-user' : 'chat-bubble-ai'}`}>
      {!isUser && <div className="chat-avatar chat-avatar-ai">🤖</div>}
      <div className="chat-msg-body">
        {isUser ? (
          <div className="chat-msg-text chat-user-text">{msg.parts[0].text}</div>
        ) : (
          <div className="chat-msg-text chat-ai-text">
            <ReactMarkdown
              components={{
                p: ({ children }) => <p style={{ margin: '0 0 8px 0' }}>{children}</p>,
                strong: ({ children }) => <strong style={{ color: 'var(--navy)' }}>{children}</strong>,
                ul: ({ children }) => <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>{children}</ul>,
                li: ({ children }) => <li style={{ marginBottom: '4px' }}>{children}</li>,
                code: ({ inline, children }) => inline
                  ? <code className="inline-code">{children}</code>
                  : <pre className="materi-code-block"><code>{children}</code></pre>,
              }}
            >
              {msg.parts[0].text}
            </ReactMarkdown>
          </div>
        )}
      </div>
      {isUser && <div className="chat-avatar chat-avatar-user">👤</div>}
    </div>
  );
}

export default function TutorChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => {
    setMessages([{
      role: 'model',
      parts: [{ text: `Halo ${user ? user.name : 'Siswa'}! 👋 Saya **MathTutor AI** — tutor matematika dan *Game Master* teka-teki logikamu.\n\nAku bisa membantu kamu dengan:\n- 📚 **Belajar materi** matematika SD, SMP, hingga SMA/SMK\n- 🧩 **Bermain teka-teki** seperti Cryptarithm, Math Riddles, Sudoku Mini, dan lainnya\n- 💡 **Memandu penyelesaian soal** langkah demi langkah\n\nMau mulai dari mana? Pilih topik di bawah atau ketik pertanyaanmu!` }]
    }]);
  }, [user]);

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;
    const userMsg = { role: 'user', parts: [{ text }] };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    try {
      // Filter history sebelum dikirim ke server:
      // 1. Hapus pesan error (⚠️) agar tidak masuk context AI
      // 2. Hanya kirim pesan valid (user & model normal)
      // 3. Pastikan dimulai dari 'user' (skip greeting model awal)
      const historyToSend = newMessages
        .filter(m => !m.parts[0].text.startsWith('⚠️'))  // hapus error messages
        .slice(-12);                                        // max 12 pesan terakhir

      // Hapus leading 'model' messages agar selalu dimulai 'user'
      while (historyToSend.length > 0 && historyToSend[0].role === 'model') {
        historyToSend.shift();
      }

      const res = await api('/chat', {
        method: 'POST',
        body: { messages: historyToSend }
      });
      setMessages([...newMessages, { role: 'model', parts: [{ text: res.text }] }]);
    } catch (err) {
      const errText = err?.message && err.message !== 'Terjadi kesalahan.'
        ? `⚠️ ${err.message}`
        : '⚠️ Maaf, terjadi kesalahan saat menghubungi AI. Coba lagi dalam beberapa saat.';
      setMessages([...newMessages, {
        role: 'model',
        parts: [{ text: errText }]
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  return (
    <div className="page tutor-page-wrap">
      {/* ===== CHAT SECTION — mengisi sisa tinggi layar ===== */}
      <div className="tutor-chat-page">

        {/* Header */}
        <div className="tutor-header">
          <div className="tutor-header-left">
            <div className="tutor-avatar-large">🤖</div>
            <div>
              <h1 className="tutor-title">MathTutor AI</h1>
              <p className="tutor-subtitle">Tutor Matematika &amp; Game Master Teka-teki Logika</p>
            </div>
          </div>
          <div className="tutor-status">
            <span className="status-dot" />
            <span className="status-text">Online</span>
          </div>
        </div>

        {/* Skills Strip */}
        <div className="tutor-skills-strip">
          <span className="skill-pill skill-sd">🏫 Materi SD</span>
          <span className="skill-pill skill-smp">🏛️ Materi SMP</span>
          <span className="skill-pill skill-sma">🎓 Materi SMA</span>
          <span className="skill-pill skill-game">🎮 Game Teka-teki</span>
          <span className="skill-pill skill-guide">💡 Panduan Soal</span>
          <span className="skill-pill skill-eval">📊 Evaluasi &amp; Koreksi</span>
        </div>

        {/* Quick prompts */}
        <div className="quick-prompts">
          <p className="quick-label">💬 Mulai dari sini:</p>
          <div className="quick-prompts-grid">
            {QUICK_PROMPTS.map((p, i) => (
              <button key={i} className="quick-prompt-btn" onClick={() => sendMessage(p.text)}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chat window — flex:1, messages scroll di sini */}
        <div className="chat-window">
          <div className="chat-messages-area">
            {messages.map((msg, i) => <ChatMessage key={i} msg={msg} />)}
            {loading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Input — selalu menempel di bawah */}
          <form className="chat-input-form" onSubmit={handleSubmit}>
            <textarea
              ref={textareaRef}
              className="chat-textarea"
              placeholder="Tanyakan materi, minta soal latihan, atau ajak bermain teka-teki…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              rows={1}
            />
            <button type="submit" className="chat-send-btn" disabled={loading || !input.trim()} aria-label="Kirim">
              <span className="send-icon">➤</span>
            </button>
          </form>
          <p className="chat-hint">Enter = kirim · Shift+Enter = baris baru</p>
        </div>
      </div>

      {/* Info cards — di bawah chat, bisa diakses dengan scroll halaman */}
      <div className="tutor-info-grid" style={{ marginTop: '24px' }}>
        <div className="tutor-info-card">
          <div className="info-icon">📖</div>
          <h3>Materi Lengkap</h3>
          <p>Penjelasan konsep, rumus, contoh soal bertahap, dan analogi dunia nyata untuk setiap topik.</p>
        </div>
        <div className="tutor-info-card">
          <div className="info-icon">🧩</div>
          <h3>Teka-teki Interaktif</h3>
          <p>Bermain Cryptarithm, Math Riddles, KenKen, Sudoku Mini, dan Calculords secara percakapan.</p>
        </div>
        <div className="tutor-info-card">
          <div className="info-icon">🎓</div>
          <h3>Pembimbing Sabar</h3>
          <p>Tidak pernah langsung memberi jawaban. Memandu dengan petunjuk agar kamu bisa menemukan sendiri.</p>
        </div>
      </div>
    </div>
  );
}
