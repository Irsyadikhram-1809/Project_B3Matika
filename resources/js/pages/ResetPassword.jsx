import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '@/lib/api';
import Logo from '@/components/Logo';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const token = params.get('token') || '';
  const email = params.get('email') || '';

  const [f, setF] = useState({ email, token, password: '', password_confirmation: '' });
  const [err, setErr] = useState('');
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showPw, setShowPw] = useState(false);

  if (!token || !email) return <Navigate to="/lupa-password" replace />;

  async function submit(e) {
    e.preventDefault();
    setErr(''); setBusy(true);
    if (f.password !== f.password_confirmation) {
      setErr('Konfirmasi password tidak sama.');
      setBusy(false);
      return;
    }
    try {
      await api('/auth/reset', { method: 'POST', body: f });
      setOk(true);
      setTimeout(() => nav('/masuk'), 2000);
    } catch (ex) { setErr(ex.message); }
    setBusy(false);
  }

  return (
    <div className="auth">
      <form className="card auth-card" onSubmit={submit}>
        <div className="center mb"><Logo size={52} tagline={false} /></div>
        <h2 className="center">Atur Ulang Password</h2>
        {ok ? (
          <div className="notice" style={{ background: '#e7f7ec', color: '#146c2e' }}>
            ✅ Password berhasil direset! Mengarahkan ke halaman masuk…
          </div>
        ) : (
          <>
            {err && <div className="alert">{err}</div>}
            <label>
              Email
              <input type="email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} required />
            </label>
            <label>
              Password Baru
              <div className="pw-wrapper">
                <input type={showPw ? 'text' : 'password'} value={f.password} onChange={e => setF({ ...f, password: e.target.value })} required minLength={6} />
                <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)} tabIndex="-1">{showPw ? '🙈' : '👁️'}</button>
              </div>
            </label>
            <label>
              Konfirmasi Password Baru
              <div className="pw-wrapper">
                <input type={showPw ? 'text' : 'password'} value={f.password_confirmation} onChange={e => setF({ ...f, password_confirmation: e.target.value })} required />
              </div>
            </label>
            <button className="btn btn-block" disabled={busy}>{busy ? 'Menyimpan…' : 'Reset Password'}</button>
            <p className="center small muted mt">
              <Link to="/masuk">← Kembali ke Masuk</Link>
            </p>
          </>
        )}
      </form>
    </div>
  );
}
