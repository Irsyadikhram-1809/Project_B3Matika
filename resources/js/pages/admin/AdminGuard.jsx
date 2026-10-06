import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import NotFound from '@/components/NotFound';
import { useState, useEffect } from 'react';
import './AdminGuard.css';

export default function AdminGuard({ children }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [themeMode, setThemeMode] = useState('system'); // light, dark, system

  useEffect(() => {
    const saved = localStorage.getItem('theme-mode') || 'system';
    setThemeMode(saved);
  }, []);

  const cycleTheme = () => {
    const next = themeMode === 'system' ? 'dark' : themeMode === 'dark' ? 'light' : 'system';
    setThemeMode(next);
    localStorage.setItem('theme-mode', next);
    
    if (next === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', next);
    }
  };

  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) return <NotFound />;

  const isActive = (path) => loc.pathname === path ? 'active' : '';

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <span style={{ fontSize: '1.4rem' }}>⚙️</span> B3Matika Admin
        </div>
        
        <nav className="admin-sidebar-nav">
          <Link to="/panel-rahasia" className={`admin-nav-item ${isActive('/panel-rahasia')}`}>
            📊 Dashboard
          </Link>
          <Link to="/panel-rahasia/topics" className={`admin-nav-item ${isActive('/panel-rahasia/topics')}`}>
            📚 Materi
          </Link>
          <Link to="/panel-rahasia/questions" className={`admin-nav-item ${isActive('/panel-rahasia/questions')}`}>
            📝 Soal
          </Link>
          <Link to="/panel-rahasia/puzzles" className={`admin-nav-item ${isActive('/panel-rahasia/puzzles')}`}>
            🧩 Puzzle
          </Link>
          <Link to="/panel-rahasia/users" className={`admin-nav-item ${isActive('/panel-rahasia/users')}`}>
            👥 Pengguna
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="admin-main">
        {/* Topbar */}
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              ☰
            </button>
            <Link to="/" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 500 }}>
              ← Ke Web Utama
            </Link>
          </div>
          
          <div className="admin-topbar-right">
            <button className="theme-toggle-btn" onClick={cycleTheme} title={`Tema: ${themeMode}`}>
              {themeMode === 'system' ? '💻' : themeMode === 'dark' ? '🌙' : '☀️'}
            </button>
            
            <div className="admin-user-info">
              <div className="admin-user-avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>{user.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.role}</div>
              </div>
            </div>
            
            <button className="btn btn-sm btn-outline" onClick={() => { logout(); nav('/'); }}>
              Keluar
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-content" onClick={() => { if (sidebarOpen) setSidebarOpen(false); }}>
          {children}
        </main>
      </div>
    </div>
  );
}
