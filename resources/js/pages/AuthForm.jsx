import { useState, useEffect, useRef } from 'react';
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck, CheckCircle, User, Shield, KeyRound, Mail } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/Logo';
import SegmentedControl from '@/components/SegmentedControl';
import BrandWordmark from '@/components/BrandWordmark';

export default function AuthForm({ mode, admin = false }) {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const [f, setF] = useState({ 
    name: '', 
    username: '', 
    email: location.state?.email || '', 
    password: '', 
    password2: '', 
    adminToken: '' 
  });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [regType, setRegType] = useState('user'); // 'user' or 'admin'
  const [adminFlow, setAdminFlow] = useState('input_token'); // 'input_token' or 'request_token'
  
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  
  const [otpMode, setOtpMode] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // State sukses verifikasi OTP
  const [verifySuccess, setVerifySuccess] = useState(null); // { role, redirectTo, message }
  const [countdown, setCountdown] = useState(0);
  const countdownRef = useRef(null);
  const mountedRef = useRef(true);

  // Auto-login deteksi dari tab lain (storage event -> context update)
  useEffect(() => {
    if (user && otpMode) {
      // Tunggu sebentar lalu redirect jika akun sudah terverifikasi di tab lain
      setTimeout(() => {
        nav(user.role === 'admin' ? '/panel-rahasia' : '/');
      }, 500);
    }
  }, [user, otpMode, nav]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const resetOtpState = () => {
    setOtpMode(false);
    setF(prev => ({ ...prev, otp: '' }));
    setErr('');
  };

  /** Mulai hitung mundur otomatis dan arahkan setelah selesai. */
  const startCountdown = (seconds, to) => {
    setCountdown(seconds);
    countdownRef.current = setInterval(() => {
      if (!mountedRef.current) {
        clearInterval(countdownRef.current);
        return;
      }
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          nav(to, { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  if (user) return <Navigate to={admin ? '/panel-rahasia' : '/'} replace />;

  async function handleRequestToken(e) {
    e.preventDefault();
    setErr('');
    if (f.password !== f.password2) return setErr('Konfirmasi password tidak sama.');
    if (f.password.length < 8) return setErr('Password minimal 8 karakter.');
    setBusy(true);
    try {
      const res = await api('/auth/admin-token-request', { 
        method: 'POST', 
        body: { 
          email: f.email, 
          username: f.username, 
          name: f.name,
          password: f.password,
          password2: f.password2
        } 
      });
      alert(res.message);
      setAdminFlow('input_token'); // Back to input token
      setF(prev => ({ ...prev, password: '', password2: '' })); // clear password
    } catch (e2) { setErr(e2.message); }
    setBusy(false);
  }

  async function submit(e) {
    e.preventDefault();
    if (mode === 'register' && regType === 'admin' && adminFlow === 'request_token') {
      return handleRequestToken(e);
    }

    setErr('');
    if (mode === 'register' && !otpMode) {
      if (f.password !== f.password2) return setErr('Konfirmasi password tidak sama.');
      if (f.password.length < 8) return setErr('Password minimal 8 karakter.');
      setBusy(true);
      try {
        await api('/auth/register/request', { 
          method: 'POST', 
          body: { 
            email: f.email, 
            username: f.username, 
            password: f.password,
            role: regType,
            adminToken: regType === 'admin' ? f.adminToken : undefined
          } 
        });
        setOtpMode(true);
        startResendTimer();
        setErr('');
      } catch (e2) { setErr(e2.message); }
      setBusy(false);
      return;
    }

    setBusy(true);
    try {
      if (mode === 'register') {
        // Jalur verifikasi OTP — respons menyertakan role dan redirectTo dari server
        const d = await api('/auth/register/verify', {
          method: 'POST',
          body: { email: f.email, code: f.otp, name: f.name },
        });
        
        if (d.token && d.user) {
          login(d.token, d.user);
        }

        // Tujuan pengalihan ditentukan server
        const redirectTo = d.redirectTo || '/';
        const role = d.role || 'user';
        setVerifySuccess({ role, redirectTo, message: d.message || 'Akun berhasil dibuat.' });
        
        // Cukup tunggu 1 detik agar transisi mulus dan tidak terkesan lambat
        startCountdown(1, redirectTo);
      } else {
        // Login biasa
        const path = admin ? '/auth/admin-login' : '/auth/login';
        const d = await api(path, { method: 'POST', body: f });
        login(d.token, d.user);
        nav(admin ? '/panel-rahasia' : '/');
      }
    } catch (e2) { setErr(e2.message); }
    setBusy(false);
  }

  async function resendOtp() {
    if (resendTimer > 0) return;
    setBusy(true);
    setErr('');
    try {
      await api('/auth/register/request', { 
        method: 'POST', 
        body: { email: f.email, username: f.username, password: f.password, role: regType, adminToken: regType === 'admin' ? f.adminToken : undefined } 
      });
      startResendTimer();
      setErr('Kode OTP baru telah dikirim.');
    } catch (e2) {
      setErr(e2.message);
    }
    setBusy(false);
  }

  // ── Layar sukses setelah OTP berhasil ──────────────────────────────────────
  if (verifySuccess) {
    const isAdminSuccess = verifySuccess.role === 'admin';
    return (
      <div className="auth">
        <div className="card auth-card" style={{ textAlign: 'center' }}>
          <div className="center mb"><Logo size={52} tagline={false} /></div>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }} aria-hidden="true">
            {isAdminSuccess ? '🛡️' : '✅'}
          </div>
          <h2 className="center" style={{ color: 'var(--ok-text, #16a34a)', marginBottom: '0.75rem' }}>
            {isAdminSuccess ? 'Akun Admin Aktif' : 'Akun Berhasil Dibuat'}
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            {isAdminSuccess
              ? 'Akun admin berhasil dibuat dan diverifikasi. Silakan masuk lewat halaman login admin.'
              : 'Akun Anda berhasil dibuat dan diverifikasi. Silakan masuk.'}
          </p>
          <a
            href={verifySuccess.redirectTo}
            className="btn btn-block"
            onClick={(e) => {
              e.preventDefault();
              if (countdownRef.current) clearInterval(countdownRef.current);
              nav(verifySuccess.redirectTo, { replace: true });
            }}
          >
            {isAdminSuccess ? 'Masuk ke Panel Admin' : 'Masuk Sekarang'}
          </a>
          <p className="small muted center mt" style={{ marginTop: '0.75rem' }}>
            Mengalihkan otomatis dalam <strong>{countdown}</strong> detik…
          </p>
        </div>
      </div>
    );
  }

  // ── Tautan "Sudah punya akun? Masuk" — berbeda per tab ───────────────────
  const loginLink = mode === 'register' && regType === 'admin'
    ? '/panel-rahasia/login'
    : '/masuk';

  return (
    <div className="auth">
      <form className="card auth-card" onSubmit={submit}>
        <div className="center mb"><Logo size={52} tagline={false} /></div>
        <h2 className="center">
          {admin ? 'Masuk Admin' : mode === 'login' ? 'Masuk' : otpMode ? 'Verifikasi OTP' : 'Daftar Akun'}
        </h2>
        {err && <div className="alert">{err}</div>}
        
        {!otpMode && mode === 'register' && (
          <div style={{ marginBottom: '1rem' }}>
            <SegmentedControl 
              size="primary"
              value={regType}
              onChange={setRegType}
              options={[
                { value: 'user', label: 'Akun User', icon: <User size={16} /> },
                { value: 'admin', label: 'Akun Admin', icon: <Shield size={16} /> }
              ]}
            />
          </div>
        )}

        {!otpMode && mode === 'register' && regType === 'admin' && (
          <div style={{ marginBottom: '1rem' }}>
            <SegmentedControl 
              size="compact"
              value={adminFlow}
              onChange={setAdminFlow}
              options={[
                { value: 'input_token', label: 'Punya Token', icon: <KeyRound size={14} /> },
                { value: 'request_token', label: 'Minta Token', icon: <Mail size={14} /> }
              ]}
            />
            <p className="small muted center mt" style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
              {adminFlow === 'input_token' 
                ? 'Saya sudah menerima token dari superadmin.' 
                : 'Kirim permintaan token ke superadmin lewat email.'}
            </p>
          </div>
        )}

        {!otpMode && mode === 'register' && <label>Nama Lengkap<input value={f.name} onChange={set('name')} required maxLength={60} /></label>}
        {!otpMode && mode === 'register' && <label>Nama Pengguna (Username)<input value={f.username} onChange={set('username')} required maxLength={20} minLength={3} pattern="[a-zA-Z0-9_.]+" title="Hanya huruf, angka, titik, dan underscore" /></label>}
        {!otpMode && <label>{mode === 'login' && !admin ? 'Nama Pengguna atau Email' : 'Email'}<input type={mode === 'login' && !admin ? 'text' : 'email'} value={f.email} onChange={set('email')} required autoComplete="email" /></label>}
        
        {!otpMode && mode === 'register' && regType === 'admin' && adminFlow === 'input_token' && (
          <label>Token Khusus Admin
            <input type="text" value={f.adminToken} onChange={set('adminToken')} required placeholder="Masukkan token dari email" autoComplete="off" />
          </label>
        )}

        {!otpMode && (
          <label>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Password</span>
              {mode === 'login' && !admin && <Link to="/lupa-password" tabIndex="-1" style={{ fontSize: '0.85rem' }}>Lupa password?</Link>}
            </div>
            <div className="pw-wrapper">
              <input type={showPw ? 'text' : 'password'} value={f.password} onChange={set('password')} required minLength={mode === 'register' ? 8 : 1} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} />
              <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)} tabIndex="-1" aria-label="Toggle password">
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>
        )}
        
        {!otpMode && mode === 'register' && (
          <label>Ulangi Password
            <div className="pw-wrapper">
              <input type={showPw ? 'text' : 'password'} value={f.password2} onChange={set('password2')} required minLength={8} autoComplete="new-password" />
            </div>
          </label>
        )}

        {otpMode && (
          <label>Kode OTP
            <div className="small muted">
              Kode telah dikirim ke {f.email}. Masukkan kode 6 digit. Atau klik tautan pada email. 
              <br /><strong style={{ color: 'var(--warn-text, #b45309)' }}>Penting:</strong> Silakan cek folder Spam/Junk jika email tidak ditemukan di Kotak Masuk.
            </div>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={f.otp || ''}
              onChange={set('otp')}
              required
              maxLength={6}
              pattern="\d{6}"
              style={{ letterSpacing: '0.5em', textAlign: 'center', fontSize: '1.2em' }}
            />
          </label>
        )}
        
        <button className="btn btn-block mt" disabled={busy}>
          {busy ? 'Memproses…' : 
           admin ? 'Masuk' : 
           mode === 'login' ? 'Masuk' : 
           otpMode ? 'Verifikasi' : 
           mode === 'register' && regType === 'admin' && adminFlow === 'request_token' ? 'Kirim Permintaan Token' :
           `Daftar sebagai ${regType === 'admin' ? 'Admin' : 'User'}`}
        </button>
        
        {!admin && !otpMode && (
          <p className="center small muted mt">
            {mode === 'login'
              ? <>Belum punya akun? <Link to="/daftar">Daftar</Link></>
              : <>Sudah punya akun? <Link to={loginLink}>Masuk</Link></>}
          </p>
        )}
        {otpMode && (
          <div className="center mt mb" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
            <button 
              type="button" 
              className="btn btn-outline" 
              onClick={resendOtp} 
              disabled={busy || resendTimer > 0}
              style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', width: '100%' }}
            >
              {resendTimer > 0 ? `Tunggu ${resendTimer}s untuk kirim ulang` : 'Kirim Ulang Kode OTP'}
            </button>
            <button 
              type="button" 
              onClick={resetOtpState}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted, #a0aec0)',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Kembali
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
