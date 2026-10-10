import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';
import Logo from '@/components/Logo';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [err, setErr] = useState('');
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr(''); setBusy(true);
    try {
      await api('/auth/forgot', { method: 'POST', body: { email } });
      setOk(true);
    } catch (ex) { setErr(ex.message); }
    setBusy(false);
  }

  return (
    <div className="auth">
      <form className="card auth-card" onSubmit={submit}>
        <div className="center mb"><Logo size={52} tagline={false} /></div>
        <h2 className="center">Lupa Password</h2>
        {ok ? (
          <>
            <div className="notice" style={{ background: '#e7f7ec', color: '#146c2e', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <CheckCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                Link reset password telah dikirim ke <b>{email}</b>.<br />
                Silakan cek inbox (dan folder Spam) emailmu.
              </div>
            </div>
            <p className="center small muted mt">
              <Link to="/masuk">← Kembali ke Masuk</Link>
            </p>
          </>
        ) : (
          <>
            <p className="muted small" style={{ marginBottom: 16 }}>
              Masukkan emailmu dan kami akan mengirimkan link untuk mengatur ulang password.
            </p>
            {err && <div className="alert">{err}</div>}
            <label>
              Email
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="email@contoh.com" />
            </label>
            <button className="btn btn-block" disabled={busy}>{busy ? 'Mengirim…' : 'Kirim Link Reset'}</button>
            <p className="center small muted mt">
              Ingat passwordmu? <Link to="/masuk">Masuk</Link>
            </p>
          </>
        )}
      </form>
    </div>
  );
}
