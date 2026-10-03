import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import Logo from '@/components/Logo';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const nav = useNavigate();
  const close = () => { setOpen(false); setDropOpen(false); };
  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link to="/" onClick={close} aria-label="Beranda B3Matika"><Logo size={44} /></Link>
        <button className="burger" onClick={() => setOpen(!open)} aria-label="Menu">☰</button>
        <nav className={`nav-links ${open ? 'open' : ''}`}>
          <NavLink to="/" end onClick={close}>Beranda</NavLink>
          <NavLink to="/materi" onClick={close}>Materi</NavLink>
          <NavLink to="/games" onClick={close}>Games</NavLink>
          <NavLink to="/puzzle" onClick={close}>Puzzle</NavLink>
          <NavLink to="/ai-tutor" onClick={close}>AI Tutor</NavLink>
          <NavLink to="/papan-skor" onClick={close}>Papan Skor</NavLink>
          <div className="nav-user">
            {user ? (
              <>
                {user.role === 'admin' && <Link to="/panel-rahasia" className="chip chip-admin" onClick={close}>Admin</Link>}
                <span className="chip">⭐ {user.points} · Lv {user.level}</span>
                <div className={`nav-dropdown ${dropOpen ? 'open' : ''}`}>
                  <button className="nav-dropdown-trigger" onClick={() => setDropOpen(d => !d)}>
                    <span className="who">{user.avatar || '🎓'} {user.name}</span>&nbsp;▾
                  </button>
                  <div className="nav-dropdown-menu">
                    <Link to="/profil" onClick={close}>👤 Profil Saya</Link>
                    <Link to="/riwayat" onClick={close}>📚 Riwayat Belajar</Link>
                    <button className="danger" onClick={() => { logout(); close(); nav('/'); }}>🚪 Keluar</button>
                  </div>
                </div>
              </>
            ) : (
              <Link to="/masuk" className="btn" onClick={close}>Masuk / Daftar</Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
