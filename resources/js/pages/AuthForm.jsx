import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/Logo';

export default function AuthForm({ mode, admin = false }) {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ name: '', email: '', password: '', password2: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  
  const [otpMode, setOtpMode] = useState(false);
  
  if (user) return <Navigate to={admin ? '/panel-rahasia' : '/'} replace />;

  async function submit(e) {
    e.preventDefault();
    setErr('');
    if (mode === 'register' && !otpMode) {
      if (f.password !== f.password2) return setErr('Konfirmasi password tidak sama.');
      if (f.password.length < 8) return setErr('Password minimal 8 karakter.');
      setBusy(true);
      try {
        await api('/auth/register/request', { method: 'POST', body: { email: f.email, password: f.password } });
        setOtpMode(true);
        setErr('');
      } catch (e2) { setErr(e2.message); }
      setBusy(false);
      return;
    }

    setBusy(true);
    try {
      const path = admin ? '/auth/admin-login' : mode === 'login' ? '/auth/login' : '/auth/register/verify';
      const body = mode === 'register' ? { email: f.email, otp: f.otp, name: f.name } : f;
      const d = await api(path, { method: 'POST', body });
      login(d.token, d.user);
      nav(admin ? '/panel-rahasia' : '/');
    } catch (e2) { setErr(e2.message); }
    setBusy(false);
  }

  return (
    <div className="auth">
      <form className="card auth-card" onSubmit={submit}>
        <div className="center mb"><Logo size={52} tagline={false} /></div>
        <h2 className="center">{admin ? 'Masuk Admin' : mode === 'login' ? 'Masuk' : otpMode ? 'Verifikasi OTP' : 'Daftar Akun'}</h2>
        {err && <div className="alert">{err}</div>}
        
        {!otpMode && mode === 'register' && <label>Nama<input value={f.name} onChange={set('name')} required maxLength={60} /></label>}
        {!otpMode && <label>Email<input type="email" value={f.email} onChange={set('email')} required /></label>}
        
        {!otpMode && (
          <label>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Password</span>
              {mode === 'login' && !admin && <Link to="/lupa-password" tabIndex="-1" style={{ fontSize: '0.85rem' }}>Lupa password?</Link>}
            </div>
            <div className="pw-wrapper">
              <input type={showPw ? 'text' : 'password'} value={f.password} onChange={set('password')} required minLength={mode === 'register' ? 8 : 1} />
              <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)} tabIndex="-1" aria-label="Toggle password">
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
          </label>
        )}
        
        {!otpMode && mode === 'register' && (
          <label>Ulangi Password
            <div className="pw-wrapper">
              <input type={showPw ? 'text' : 'password'} value={f.password2} onChange={set('password2')} required minLength={8} />
            </div>
          </label>
        )}

        {otpMode && (
          <label>Kode OTP
            <div className="small muted">Kode telah dikirim ke {f.email}. Masukkan kode 6 digit.</div>
            <input type="text" value={f.otp || ''} onChange={set('otp')} required maxLength={6} pattern="\d{6}" style={{ letterSpacing: '0.5em', textAlign: 'center', fontSize: '1.2em' }} />
          </label>
        )}
        
        <button className="btn btn-block mt" disabled={busy}>{busy ? 'Memproses…' : admin ? 'Masuk' : mode === 'login' ? 'Masuk' : otpMode ? 'Verifikasi' : 'Daftar'}</button>
        {!admin && !otpMode && (
          <p className="center small muted mt">
            {mode === 'login' ? <>Belum punya akun? <Link to="/daftar">Daftar</Link></> : <>Sudah punya akun? <Link to="/masuk">Masuk</Link></>}
          </p>
        )}
        {otpMode && (
          <p className="center small muted mt">
            <button type="button" className="link-button" onClick={() => setOtpMode(false)}>Kembali</button>
          </p>
        )}
      </form>
    </div>
  );
}
