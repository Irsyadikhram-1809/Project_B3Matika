/**
 * resources/js/pages/VerifyEmailLink.jsx
 * Halaman verifikasi email melalui tautan di email.
 * GET /api/auth/verify-email-link?token=...&email=...
 *
 * DESAIN: Halaman berdiri sendiri (tanpa Navbar/Footer situs).
 * Semua warna memakai CSS design tokens agar otomatis benar di mode terang, gelap, dan system.
 *
 * Pengalihan setelah sukses ditentukan oleh SERVER (field redirectTo di respons),
 * sehingga halaman ini benar meski dibuka di browser/perangkat berbeda dari tempat pendaftaran.
 */
import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import Logo from '@/components/Logo';

export default function VerifyEmailLink() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const token = params.get('token');
  const email = params.get('email');
  const [state, setState] = useState('loading'); // loading | success | error
  const [msg, setMsg] = useState('');
  const [redirectTo, setRedirectTo] = useState('/masuk');
  const [role, setRole] = useState('user');
  const [countdown, setCountdown] = useState(0);
  const countdownRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

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

  useEffect(() => {
    if (!token || !email) {
      setMsg('Tautan verifikasi tidak lengkap. Pastikan Anda membuka tautan secara utuh dari email.');
      setState('error');
      return;
    }

    api(
      `/auth/verify-email-link?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`
    )
      .then((res) => {
        // Tujuan pengalihan ditentukan server berdasarkan role akun yang baru dibuat
        const dest = res.redirectTo || '/masuk';
        const r    = res.role || 'user';
        setRedirectTo(dest);
        setRole(r);
        setMsg(res.message || 'Email berhasil diverifikasi! Silakan masuk ke akun Anda.');
        setState('success');
        // Mulai hitung mundur otomatis (5 detik) — tidak berlaku jika pengguna sudah pindah
        startCountdown(5, dest);
      })
      .catch((err) => {
        setMsg(err.message || 'Gagal memverifikasi email. Tautan mungkin sudah kedaluwarsa atau sudah pernah dipakai.');
        setState('error');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, email]);

  const handleManualNav = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    nav(redirectTo, { replace: true });
  };

  const isAdmin = role === 'admin';

  return (
    /* Latar mengikuti token --bg sehingga otomatis benar di dark/light/system */
    <div className="confirm-shell">
      <div className="confirm-card" style={{ maxWidth: 420 }}>
        {/* Header logo */}
        <div className="confirm-header">
          <Logo size={44} tagline={false} />
          <h2 className="confirm-card-title">Verifikasi Email</h2>
          <p className="confirm-card-subtitle">B3Matika — Belajar, Berlatih, Bermain</p>
        </div>

        {/* ── State: loading ── */}
        {state === 'loading' && (
          <div className="confirm-status">
            <div className="confirm-status-icon" aria-hidden="true" style={{ animation: 'spin 2s linear infinite' }}>
              <Loader2 size={48} />
            </div>
            <h3 className="confirm-status-title">Memverifikasi Tautan…</h3>
            <p className="confirm-status-desc">Harap tunggu sebentar.</p>
          </div>
        )}

        {/* ── State: success ── */}
        {state === 'success' && (
          <div className="confirm-status">
            <div className="confirm-status-icon" aria-hidden="true" style={{ color: isAdmin ? 'var(--warn)' : 'var(--ok-text)' }}>
              {isAdmin ? <ShieldCheck size={48} /> : <CheckCircle size={48} />}
            </div>
            <h3 className="confirm-status-title" style={{ color: 'var(--ok-text)' }}>
              {isAdmin ? 'Akun Admin Aktif' : 'Berhasil!'}
            </h3>
            <p className="confirm-status-desc">{msg}</p>
            <button
              type="button"
              className="btn btn-block"
              style={{ marginTop: 20 }}
              onClick={handleManualNav}
            >
              {isAdmin ? 'Masuk ke Panel Admin' : 'Masuk Sekarang'}
            </button>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.75rem', textAlign: 'center' }}>
              Mengalihkan otomatis dalam <strong>{countdown}</strong> detik…
            </p>
          </div>
        )}

        {/* ── State: error ── */}
        {state === 'error' && (
          <div className="confirm-status">
            <div className="confirm-status-icon" aria-hidden="true" style={{ color: 'var(--bad)' }}>
              <AlertTriangle size={48} />
            </div>
            <h3 className="confirm-status-title" style={{ color: 'var(--bad)' }}>
              Gagal Verifikasi
            </h3>
            <p className="confirm-status-desc">{msg}</p>
            <div className="confirm-status-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => nav('/daftar')}
              >
                Kembali ke Pendaftaran
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => nav('/')}
              >
                Beranda
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
