/**
 * resources/js/pages/AdminTokenConfirm.jsx
 * Halaman /konfirmasi-admin
 *
 * Dibuka oleh superadmin dari link email.
 * GET: validasi link dan tampilkan info pendaftar
 * POST: konfirmasi aksi (approve/reject)
 */
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '@/lib/api';
import Logo from '@/components/Logo';

export default function AdminTokenConfirm() {
  const [params] = useSearchParams();
  const action = params.get('action');
  const token  = params.get('token');
  const id     = params.get('id');

  const [state, setState] = useState('loading'); // loading | confirm | success | error
  const [info, setInfo]   = useState(null);
  const [msg, setMsg]     = useState('');
  const [busy, setBusy]   = useState(false);

  useEffect(() => {
    if (!action || !token || !id) {
      setMsg('Tautan tidak lengkap atau tidak valid.');
      setState('error');
      return;
    }

    api(`/admin/confirm-token?action=${encodeURIComponent(action)}&token=${encodeURIComponent(token)}&id=${encodeURIComponent(id)}`)
      .then((data) => {
        setInfo(data.invite);
        setState('confirm');
      })
      .catch((err) => {
        setMsg(err.message || 'Tautan tidak valid atau sudah kedaluwarsa.');
        setState('error');
      });
  }, []);

  async function handleConfirm() {
    setBusy(true);
    try {
      const data = await api('/admin/confirm-token', {
        method: 'POST',
        body: { action, token, id },
      });
      setMsg(data.message);
      setState('success');
    } catch (err) {
      setMsg(err.message || 'Terjadi kesalahan.');
    } finally {
      setBusy(false);
    }
  }

  const isApprove = action === 'approve';

  return (
    <div style={{
      minHeight: '100vh', background: '#f8fafc',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        background: '#fff', borderRadius: '16px', padding: '40px',
        maxWidth: '480px', width: '100%',
        boxShadow: '0 8px 32px rgba(37,99,235,0.10)',
        border: '1px solid #e2e8f0',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <Logo size={48} tagline={false} />
          <h2 style={{ margin: '16px 0 4px', color: '#1e293b' }}>
            {isApprove ? '✅ Konfirmasi Persetujuan Token' : '❌ Konfirmasi Penolakan'}
          </h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
            Panel Admin B3Matika
          </p>
        </div>

        {state === 'loading' && (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#64748b' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
            <p>Memvalidasi tautan…</p>
          </div>
        )}

        {state === 'confirm' && info && (
          <>
            <div style={{
              background: '#f8fafc', borderRadius: '10px',
              padding: '20px', marginBottom: '24px',
              border: '1px solid #e2e8f0',
            }}>
              <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Data Pendaftar</p>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <tbody>
                  {[
                    ['Nama', info.nama],
                    ['Username', `@${info.username}`],
                    ['Email', info.email],
                  ].map(([k, v]) => (
                    <tr key={k}>
                      <td style={{ padding: '6px 0', color: '#64748b', width: '90px' }}>{k}</td>
                      <td style={{ padding: '6px 0', fontWeight: 600, color: '#1e293b' }}>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{
              background: isApprove ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${isApprove ? '#86efac' : '#fca5a5'}`,
              borderRadius: '8px', padding: '14px', marginBottom: '24px',
              fontSize: '14px', color: isApprove ? '#15803d' : '#dc2626',
            }}>
              {isApprove
                ? '⚠️ Dengan menyetujui, sistem akan mengirimkan token admin ke email pendaftar.'
                : '⚠️ Dengan menolak, pendaftar akan menerima email pemberitahuan penolakan.'}
            </div>

            {msg && (
              <div style={{
                background: '#fef2f2', border: '1px solid #fca5a5',
                borderRadius: '8px', padding: '12px', marginBottom: '16px',
                color: '#dc2626', fontSize: '14px',
              }}>
                {msg}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleConfirm}
                disabled={busy}
                style={{
                  flex: 1, padding: '14px',
                  background: isApprove ? '#16a34a' : '#dc2626',
                  color: '#fff', border: 'none', borderRadius: '8px',
                  fontSize: '15px', fontWeight: 700, cursor: busy ? 'not-allowed' : 'pointer',
                  opacity: busy ? 0.7 : 1,
                }}
              >
                {busy ? 'Memproses…' : isApprove ? '✅ Setujui & Kirim Token' : '❌ Tolak Permintaan'}
              </button>
            </div>
          </>
        )}

        {state === 'success' && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>
              {isApprove ? '🎉' : '✅'}
            </div>
            <h3 style={{ margin: '0 0 8px', color: '#1e293b' }}>
              {isApprove ? 'Token Berhasil Dikirim!' : 'Permintaan Ditolak'}
            </h3>
            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>{msg}</p>
          </div>
        )}

        {state === 'error' && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>⚠️</div>
            <h3 style={{ margin: '0 0 8px', color: '#dc2626' }}>Tautan Tidak Valid</h3>
            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>{msg}</p>
          </div>
        )}
      </div>
    </div>
  );
}
