/**
 * resources/js/pages/AdminTokenConfirm.jsx
 * Halaman /konfirmasi-admin
 *
 * Dibuka oleh superadmin dari link email.
 * GET: validasi link dan tampilkan info pendaftar
 * POST: konfirmasi aksi (approve/reject) — aksi dilakukan lewat tombol, BUKAN otomatis
 *
 * DESAIN: Halaman berdiri sendiri (tanpa Navbar/Footer situs).
 * Semua warna memakai CSS design tokens agar otomatis benar di mode terang, gelap, dan system.
 */
import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '@/lib/api';
import Logo from '@/components/Logo';

/* Komponen reusable: kartu status (loading / success / error / warning) */
function StatusCard({ icon, title, desc, titleColor, children }) {
  return (
    <div className="confirm-status">
      <div className="confirm-status-icon" aria-hidden="true">{icon}</div>
      {title && (
        <h3
          className="confirm-status-title"
          style={titleColor ? { color: titleColor } : undefined}
        >
          {title}
        </h3>
      )}
      {desc && <p className="confirm-status-desc">{desc}</p>}
      {children}
    </div>
  );
}

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
      setMsg('Tautan tidak lengkap atau tidak valid. Pastikan Anda membuka tautan secara utuh dari email.');
      setState('error');
      return;
    }

    api(
      `/admin/confirm-token?action=${encodeURIComponent(action)}&token=${encodeURIComponent(token)}&id=${encodeURIComponent(id)}`
    )
      .then((data) => {
        setInfo(data.invite);
        setState('confirm');
      })
      .catch((err) => {
        setMsg(err.message || 'Tautan tidak valid, sudah dipakai, atau telah kedaluwarsa.');
        setState('error');
      });
  }, []);                     // eslint-disable-line react-hooks/exhaustive-deps

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
      setMsg(err.message || 'Terjadi kesalahan saat memproses. Coba lagi.');
      // Tetap di state confirm agar tombol bisa dicoba ulang
    } finally {
      setBusy(false);
    }
  }

  const isApprove = action === 'approve';

  return (
    /* Latar mengikuti token --bg sehingga otomatis benar di dark/light */
    <div className="confirm-shell">
      <div className="confirm-card">
        {/* Header logo — warna mengikuti CSS tokens, bukan hardcode */}
        <div className="confirm-header">
          <Logo size={44} tagline={false} />
          <h2 className="confirm-card-title">
            {isApprove ? '✅ Konfirmasi Persetujuan Token' : '❌ Konfirmasi Penolakan'}
          </h2>
          <p className="confirm-card-subtitle">Panel Admin B3Matika</p>
        </div>

        {/* ── State: loading ── */}
        {state === 'loading' && (
          <StatusCard
            icon="⏳"
            title="Memvalidasi tautan…"
            desc="Mohon tunggu sebentar."
          />
        )}

        {/* ── State: confirm ── */}
        {state === 'confirm' && info && (
          <>
            {/* Info pendaftar */}
            <div className="confirm-info-box">
              <p className="confirm-info-label">Data Pendaftar</p>
              <table className="confirm-table">
                <tbody>
                  {[
                    ['Nama',     info.nama],
                    ['Username', `@${info.username}`],
                    ['Email',    info.email],
                  ].map(([k, v]) => (
                    <tr key={k}>
                      <td className="confirm-table-key">{k}</td>
                      <td className="confirm-table-val">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Peringatan tindakan */}
            <div className={`confirm-action-warn ${isApprove ? 'confirm-warn-ok' : 'confirm-warn-bad'}`}>
              {isApprove
                ? '⚠️ Dengan menyetujui, sistem akan mengirimkan token admin ke email pendaftar.'
                : '⚠️ Dengan menolak, pendaftar akan menerima email pemberitahuan penolakan.'}
            </div>

            {/* Pesan error inline (jika POST gagal) */}
            {msg && (
              <div className="alert" role="alert">{msg}</div>
            )}

            <button
              className={`btn btn-block ${isApprove ? 'btn-ok-action' : 'btn-danger'}`}
              onClick={handleConfirm}
              disabled={busy}
              aria-busy={busy}
            >
              {busy
                ? '⏳ Memproses…'
                : isApprove
                  ? '✅ Setujui & Kirim Token'
                  : '❌ Tolak Permintaan'}
            </button>
          </>
        )}

        {/* ── State: success ── */}
        {state === 'success' && (
          <StatusCard
            icon={isApprove ? '🎉' : '✅'}
            title={isApprove ? 'Token Berhasil Dikirim!' : 'Permintaan Ditolak'}
            desc={msg}
          >
            <Link to="/" className="btn btn-block" style={{ marginTop: 20 }}>
              Kembali ke B3Matika
            </Link>
          </StatusCard>
        )}

        {/* ── State: error ── */}
        {state === 'error' && (
          <StatusCard
            icon="⚠️"
            title="Tautan Tidak Valid"
            titleColor="var(--bad)"
            desc={msg}
          >
            <Link to="/" className="btn btn-block btn-outline" style={{ marginTop: 20 }}>
              Kembali ke B3Matika
            </Link>
          </StatusCard>
        )}
      </div>
    </div>
  );
}
