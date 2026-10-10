import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Settings, User, Lock, BookOpen, LogOut, Star, Trophy, Menu, X, ChevronDown, GraduationCap } from 'lucide-react';
import Logo from '@/components/Logo';
import { useAuth } from '@/context/AuthContext';
import ThemeToggle from '@/components/ThemeToggle';
import Avatar from '@/components/Avatar';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const dropRef = useRef(null);
  const headerRef = useRef(null);
  const nav = useNavigate();
  const location = useLocation();

  // Tutup menu saat route berubah
  useEffect(() => { setOpen(false); setDropOpen(false); }, [location.pathname]);

  // Cegah scroll body saat mobile menu terbuka
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Scroll effect: shrink navbar + progress bar
  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(scrollTop > 20);
      setProgress(docH > 0 ? Math.min(100, (scrollTop / docH) * 100) : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    if (!dropOpen) return;
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dropOpen]);

  // Tutup dropdown saat tekan Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') { setOpen(false); setDropOpen(false); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Ukur tinggi navbar sebenarnya agar laci menu mobile tepat di bawahnya
useEffect(() => {
  const el = headerRef.current;
  if (!el) return;
  const update = () => {
    document.documentElement.style.setProperty(
      '--nav-bottom', `${Math.round(el.getBoundingClientRect().bottom)}px`
    );
  };
  update();
  window.addEventListener('resize', update);
  window.addEventListener('orientationchange', update);
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
  ro?.observe(el);
  return () => {
    window.removeEventListener('resize', update);
    window.removeEventListener('orientationchange', update);
    ro?.disconnect();
  };
}, [open, scrolled]);

  const close = () => { setOpen(false); setDropOpen(false); };

  return (
    <>
      {/* Scroll progress bar */}
      <div
        className="scroll-progress-bar"
        style={{ width: `${progress}%` }}
        role="progressbar"
        aria-hidden="true"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
      />

      <header ref={headerRef} className={`navbar${scrolled ? ' scrolled' : ''}${open ? ' menu-open' : ''}`}>
        <div className="container nav-inner">
          {/* Logo */}
          <Link to="/" onClick={close} aria-label="Beranda B3Matika" className="nav-logo-link">
            <Logo size={40} tagline={false} />
          </Link>

          {/* Desktop nav — kanan logo */}
          <nav
            className={`nav-links${open ? ' open' : ''}`}
            aria-label="Navigasi utama"
            id="main-nav"
          >
            <NavLink to="/" end onClick={close}>Beranda</NavLink>
            <NavLink to="/materi" onClick={close}>Materi</NavLink>
            <NavLink to="/games" onClick={close}>Games</NavLink>
            <NavLink to="/puzzle" onClick={close}>Puzzle</NavLink>
            <NavLink to="/ai-tutor" onClick={close}>AI Tutor</NavLink>
            <NavLink to="/papan-skor" onClick={close}>Papan Skor</NavLink>

            {/* Di mobile drawer: ThemeToggle dan user ada di sini */}
            <div className="nav-drawer-bottom">
              <ThemeToggle />
              <div className="nav-user">
                {user ? (
                  <>
                    {(user.role === 'admin' || user.role === 'superadmin') && (
                      <Link to="/panel-rahasia" className="chip chip-admin" onClick={close}>Admin</Link>
                    )}
                    <Link to="/profil" className="btn btn-outline" onClick={close}>Profil</Link>
                    <button
                      className="btn btn-ghost"
                      style={{ color: 'var(--bad)' }}
                      onClick={() => { logout(); close(); nav('/'); }}
                    >
                      Keluar
                    </button>
                  </>
                ) : (
                  <Link to="/masuk" className="btn" onClick={close}>Masuk / Daftar</Link>
                )}
              </div>
            </div>
          </nav>

          {/* Desktop kanan: ThemeToggle + user/dropdown */}
          <div className="nav-end">
            <ThemeToggle />
            {user ? (
              <div className={`nav-dropdown${dropOpen ? ' open' : ''}`} ref={dropRef}>
                <button
                  className="nav-dropdown-trigger"
                  onClick={() => setDropOpen(d => !d)}
                  aria-expanded={dropOpen}
                  aria-haspopup="menu"
                  aria-controls="user-dropdown"
                >
                  <Avatar user={user} size={34} />
                  <span className="who">{user.username || user.name}</span>
                  <span aria-hidden="true" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                    <ChevronDown size={14} />
                  </span>
                </button>

                <div className="nav-dropdown-menu" id="user-dropdown" role="menu">
                  <div className="nav-dropdown-header">
                    <span className="name">{user.name}</span>
                    <span className="username">@{user.username || 'user'}</span>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                      <span className="chip" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Star size={14} fill="currentColor" /> {user.points ?? 0} poin
                      </span>
                      <span className="chip" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Trophy size={14} fill="currentColor" /> Lv {user.level ?? 1}
                      </span>
                    </div>
                  </div>

                  {(user.role === 'admin' || user.role === 'superadmin') && (
                    <Link to="/panel-rahasia" onClick={close} className="dropdown-item" role="menuitem">
                      <span className="dropdown-icon" style={{ display: 'flex' }}><Settings size={18} /></span> Panel Admin
                    </Link>
                  )}
                  <Link to="/profil" onClick={close} className="dropdown-item" role="menuitem">
                    <span className="dropdown-icon" style={{ display: 'flex' }}><User size={18} /></span> Profil Saya
                  </Link>
                  <Link to="/profil?tab=password" onClick={close} className="dropdown-item" role="menuitem">
                    <span className="dropdown-icon" style={{ display: 'flex' }}><Lock size={18} /></span> Ubah Sandi
                  </Link>
                  <Link to="/riwayat" onClick={close} className="dropdown-item" role="menuitem">
                    <span className="dropdown-icon" style={{ display: 'flex' }}><BookOpen size={18} /></span> Riwayat Belajar
                  </Link>
                  <div className="dropdown-divider" role="separator" />
                  <button
                    className="dropdown-item danger"
                    role="menuitem"
                    onClick={() => { logout(); close(); nav('/'); }}
                  >
                    <span className="dropdown-icon" style={{ display: 'flex' }}><LogOut size={18} /></span> Keluar
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/masuk" className="btn btn-sm" onClick={close}>Masuk / Daftar</Link>
            )}

            {/* Hamburger — visible di mobile */}
            <button
              className="burger"
              onClick={() => setOpen(o => !o)}
              aria-label={open ? 'Tutup menu' : 'Buka menu'}
              aria-expanded={open}
              aria-controls="main-nav"
            >
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Overlay gelap saat mobile menu terbuka */}
      {open && <div className="nav-overlay" onClick={close} aria-hidden="true" />}
    </>
  );
}
