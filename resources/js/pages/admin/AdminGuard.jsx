import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import NotFound from '@/components/NotFound';
import { useState, useEffect } from 'react';
import './AdminGuard.css';

export default function AdminGuard({ children }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    const next = theme === 'system' ? 'dark' : theme === 'dark' ? 'light' : 'system';
    setTheme(next);
  };

  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) return <NotFound />;
  const isImg = user.avatar?.startsWith('http') || user.avatar?.startsWith('data:');
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
          {user?.role === 'superadmin' && (
            <Link to="/panel-rahasia/requests" className={`admin-nav-item ${isActive('/panel-rahasia/requests')}`}>
              📨 Pengajuan
            </Link>
          )}
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
            <button className="theme-toggle-btn" onClick={cycleTheme} title={`Tema: ${theme}`}>
              {theme === 'system' ? '💻' : theme === 'dark' ? '🌙' : '☀️'}
            </button>
            
            <div className="admin-user-info">
              <div className="admin-user-avatar">
  {isImg ? (
    <img src={user.avatar} alt={user.name}
         style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
  ) : user.avatar && user.avatar !== '🎓' ? (
    user.avatar
  ) : (
    user.name.charAt(0).toUpperCase()
  )}
</div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
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
