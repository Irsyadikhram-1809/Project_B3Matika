/**
 * resources/js/pages/VerifyEmailLink.jsx
 * Halaman verifikasi email melalui tautan di email.
 * GET /api/auth/verify-email-link?token=...&email=...
 *
 * DESAIN: Halaman berdiri sendiri (tanpa Navbar/Footer situs).
 * Semua warna memakai CSS design tokens agar otomatis benar di mode terang, gelap, dan system.
 */
import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '@/lib/api';
import Logo from '@/components/Logo';

export default function VerifyEmailLink() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const email = params.get('email');
  const [state, setState] = useState('loading'); // loading | success | error
  const [msg, setMsg] = useState('');

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
        setMsg(res.message || 'Email berhasil diverifikasi! Silakan masuk ke akun Anda.');
        setState('success');
      })
      .catch((err) => {
        setMsg(err.message || 'Gagal memverifikasi email. Tautan mungkin sudah kedaluwarsa atau sudah pernah dipakai.');
        setState('error');
      });
  }, [token, email]);

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
            <div className="confirm-status-icon" aria-hidden="true">⏳</div>
            <h3 className="confirm-status-title">Memverifikasi Tautan…</h3>
            <p className="confirm-status-desc">Harap tunggu sebentar.</p>
          </div>
        )}

        {/* ── State: success ── */}
        {state === 'success' && (
          <div className="confirm-status">
            <div className="confirm-status-icon" aria-hidden="true">✅</div>
            <h3 className="confirm-status-title" style={{ color: 'var(--ok-text)' }}>
              Berhasil!
            </h3>
            <p className="confirm-status-desc">{msg}</p>
            <Link to="/masuk" className="btn btn-block" style={{ marginTop: 20 }}>
              Masuk Sekarang
            </Link>
          </div>
        )}

        {/* ── State: error ── */}
        {state === 'error' && (
          <div className="confirm-status">
            <div className="confirm-status-icon" aria-hidden="true">⚠️</div>
            <h3 className="confirm-status-title" style={{ color: 'var(--bad)' }}>
              Gagal Verifikasi
            </h3>
            <p className="confirm-status-desc">{msg}</p>
            <div className="confirm-status-actions">
              <Link to="/daftar" className="btn btn-outline">
                Kembali ke Pendaftaran
              </Link>
              <Link to="/" className="btn btn-ghost">
                Beranda
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
