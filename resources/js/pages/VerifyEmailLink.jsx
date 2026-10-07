/**
 * resources/js/pages/VerifyEmailLink.jsx
 * Halaman verifikasi email melalui tautan di email.
 * GET /api/auth/verify-email-link?token=...&email=...
 */
import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '@/lib/api';
import Logo from '@/components/Logo';

export default function VerifyEmailLink() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const email = params.get('email');
  const [state, setState] = useState('loading'); // loading, success, error
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!token || !email) {
      setMsg('Tautan verifikasi tidak lengkap.');
      setState('error');
      return;
    }

    // Call API
    api(`/auth/verify-email-link?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`)
      .then((res) => {
        setMsg(res.message || 'Email berhasil diverifikasi!');
        setState('success');
      })
      .catch((err) => {
        setMsg(err.message || 'Gagal memverifikasi email.');
        setState('error');
      });
  }, [token, email]);

  return (
    <div style={{
      minHeight: '100vh', background: '#f8fafc',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        background: '#fff', borderRadius: '16px', padding: '40px',
        maxWidth: '400px', width: '100%',
        boxShadow: '0 8px 32px rgba(37,99,235,0.10)',
        border: '1px solid #e2e8f0', textAlign: 'center'
      }}>
        <div style={{ marginBottom: '28px' }}>
          <Logo size={48} tagline={false} />
        </div>

        {state === 'loading' && (
          <div style={{ padding: '32px 0', color: '#64748b' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
            <h3 style={{ color: '#1e293b', margin: '0 0 8px' }}>Memverifikasi Tautan...</h3>
            <p style={{ margin: 0 }}>Harap tunggu sebentar.</p>
          </div>
        )}

        {state === 'success' && (
          <div style={{ padding: '16px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
            <h3 style={{ margin: '0 0 8px', color: '#16a34a' }}>Berhasil!</h3>
            <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 24px' }}>{msg}</p>
            <Link to="/masuk" className="btn btn-block" style={{ textDecoration: 'none' }}>
              Masuk Sekarang
            </Link>
          </div>
        )}

        {state === 'error' && (
          <div style={{ padding: '16px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>⚠️</div>
            <h3 style={{ margin: '0 0 8px', color: '#dc2626' }}>Gagal Verifikasi</h3>
            <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 24px' }}>{msg}</p>
            <Link to="/daftar" className="btn btn-block btn-outline" style={{ textDecoration: 'none' }}>
              Kembali ke Pendaftaran
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
