import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import Logo from '@/components/Logo';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const nav = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  // Tutup menu saat route berubah
  useEffect(() => { setOpen(false); setDropOpen(false); }, [location.pathname]);

  // Cegah scroll body saat menu mobile terbuka
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const close = () => { setOpen(false); setDropOpen(false); };

  return (
    <>
      <header className="navbar">
        <div className="container nav-inner">
          <Link to="/" onClick={close} aria-label="Beranda B3Matika"><Logo size={44} /></Link>
          <button
            className={`burger ${open ? 'burger-open' : ''}`}
            onClick={() => setOpen(o => !o)}
            aria-label={open ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={open}
          >
            {open ? '✕' : '☰'}
          </button>
          <nav className={`nav-links ${open ? 'open' : ''}`} aria-hidden={!open}>
            <NavLink to="/" end onClick={close}>Beranda</NavLink>
            <NavLink to="/materi" onClick={close}>Materi</NavLink>
            <NavLink to="/games" onClick={close}>Games</NavLink>
            <NavLink to="/puzzle" onClick={close}>Puzzle</NavLink>
            <NavLink to="/ai-tutor" onClick={close}>AI Tutor</NavLink>
            <NavLink to="/papan-skor" onClick={close}>Papan Skor</NavLink>
            <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle Dark Mode">
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <div className="nav-user">
              {user ? (
                <>
                  {user.role === 'admin' && <Link to="/panel-rahasia" className="chip chip-admin" onClick={close}>Admin</Link>}
                  <div className={`nav-dropdown ${dropOpen ? 'open' : ''}`}>
                    <button className="nav-dropdown-trigger" onClick={() => setDropOpen(d => !d)}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)', fontSize: '1.2rem' }}>
                        {user.avatar?.startsWith('http') || user.avatar?.startsWith('data:') ? (
                          <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          user.avatar || '🎓'
                        )}
                      </div>
                      <span className="who">{user.username || user.name}</span>&nbsp;▾
                    </button>
                    <div className="nav-dropdown-menu">
                      <div className="nav-dropdown-header">
                        <span className="name">{user.name}</span>
                        <span className="username">@{user.username || 'user'}</span>
                      </div>
                      <div className="nav-dropdown-header" style={{ display: 'flex', gap: '8px', borderBottom: 'none', paddingBottom: '4px' }}>
                         <span className="chip" style={{ margin: 0 }}>⭐ {user.points}</span>
                         <span className="chip" style={{ margin: 0 }}>🏆 Lv {user.level}</span>
                      </div>
                      <div style={{ height: '1px', background: 'var(--line)', margin: '4px 0' }}></div>
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
      {/* Overlay gelap saat mobile menu terbuka */}
      {open && <div className="nav-overlay" onClick={close} aria-hidden="true" />}
    </>
  );
}
