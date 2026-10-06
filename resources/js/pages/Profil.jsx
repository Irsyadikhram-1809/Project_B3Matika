import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import AvatarUploader from '@/components/AvatarUploader';

const AVATARS = ['🎓', '🦊', '🐧', '🦁', '🐉', '🚀', '🌟', '🎯', '🧠', '⚡', '🔥', '🌈'];

export default function Profil() {
  const { user, setUser } = useAuth();
  if (!user) return <Navigate to="/masuk" replace />;

  const [tab, setTab] = useState('profil'); // profil | password
  const [f, setF] = useState({ 
    name: user.name, 
    username: user.username || '',
    email: user.email, 
    avatar: user.avatar || '🎓' 
  });
  const [pw, setPw] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const setPwF = (k) => (e) => setPw({ ...pw, [k]: e.target.value });

  async function saveProfile(e) {
    e.preventDefault();
    setErr(''); setOk(''); setBusy(true);
    try {
      const d = await api('/me/profile', { method: 'PUT', body: f });
      setUser(d.user);
      setOk('Profil berhasil diperbarui! ✅');
    } catch (ex) { setErr(ex.message); }
    setBusy(false);
  }

  async function savePassword(e) {
    e.preventDefault();
    setErr(''); setOk(''); setBusy(true);
    if (pw.password !== pw.password_confirmation) {
      setErr('Konfirmasi password tidak sama.');
      setBusy(false);
      return;
    }
    try {
      await api('/me/password', { method: 'PUT', body: pw });
      setOk('Password berhasil diubah! ✅');
      setPw({ current_password: '', password: '', password_confirmation: '' });
    } catch (ex) { setErr(ex.message); }
    setBusy(false);
  }

  return (
    <>
      <h1>👤 Profil Saya</h1>
      <div className="profil-wrap">
        {/* Kartu Info */}
        <div className="card profil-summary">
          <div className="center mb">
            <div className="avatar-display">
              {user.avatar?.startsWith('http') || user.avatar?.startsWith('data:') ? (
                <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                user.avatar || '🎓'
              )}
            </div>
            <h2 style={{ margin: '8px 0 2px' }}>{user.name}</h2>
            <p className="muted small" style={{ fontWeight: 600 }}>@{user.username}</p>
            <p className="muted small">{user.email}</p>
          </div>
          <div className="profil-stats">
            <div className="profil-stat"><span className="stat-val">⭐ {user.points}</span><span className="stat-key">Poin</span></div>
            <div className="profil-stat"><span className="stat-val">🏆 {user.level}</span><span className="stat-key">Level</span></div>
          </div>
        </div>

        {/* Form Tab */}
        <div className="card profil-form-card">
          <div className="profil-tabs">
            <button className={tab === 'profil' ? 'active' : ''} onClick={() => { setTab('profil'); setErr(''); setOk(''); }}>
              ✏️ Edit Profil
            </button>
            <button className={tab === 'password' ? 'active' : ''} onClick={() => { setTab('password'); setErr(''); setOk(''); }}>
              🔒 Ubah Password
            </button>
          </div>

          {err && <div className="alert">{err}</div>}
          {ok && <div className="notice" style={{ background: '#e7f7ec', color: '#146c2e' }}>{ok}</div>}

          {tab === 'profil' && (
            <form onSubmit={saveProfile}>
              <label>Nama Lengkap<input value={f.name} onChange={set('name')} required maxLength={60} /></label>
              <label>Nama Pengguna (Username)<input value={f.username} onChange={set('username')} required maxLength={20} minLength={3} pattern="[a-zA-Z0-9_.]+" title="Hanya huruf, angka, titik, dan underscore" /></label>
              <label>Email<input type="email" value={f.email} onChange={set('email')} required /></label>
              <label>Avatar
                <AvatarUploader 
                  currentAvatar={f.avatar}
                  onAvatarSelect={(av) => setF({ ...f, avatar: av })}
                  onError={setErr}
                />
                <div className="small muted mb">Atau pilih avatar default:</div>
                <div className="avatar-picker">
                  {AVATARS.map(av => (
                    <button
                      key={av} type="button"
                      className={`avatar-opt ${f.avatar === av ? 'selected' : ''}`}
                      onClick={() => setF({ ...f, avatar: av })}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </label>
              <button className="btn btn-block" disabled={busy}>{busy ? 'Menyimpan…' : 'Simpan Perubahan'}</button>
            </form>
          )}

          {tab === 'password' && (
            <form onSubmit={savePassword}>
              <label>Password Saat Ini
                <div className="pw-wrapper">
                  <input type={showPw ? 'text' : 'password'} value={pw.current_password} onChange={setPwF('current_password')} required />
                  <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)} tabIndex="-1">{showPw ? '🙈' : '👁️'}</button>
                </div>
              </label>
              <label>Password Baru
                <div className="pw-wrapper">
                  <input type={showPw ? 'text' : 'password'} value={pw.password} onChange={setPwF('password')} required minLength={6} />
                </div>
              </label>
              <label>Konfirmasi Password Baru
                <div className="pw-wrapper">
                  <input type={showPw ? 'text' : 'password'} value={pw.password_confirmation} onChange={setPwF('password_confirmation')} required />
                </div>
              </label>
              <button className="btn btn-block mt" disabled={busy}>{busy ? 'Mengubah…' : 'Ubah Password'}</button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
