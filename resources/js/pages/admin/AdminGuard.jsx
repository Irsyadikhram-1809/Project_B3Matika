import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import ThemeToggle from '@/components/ThemeToggle';
import NotFound from '@/components/NotFound';
import Avatar from '@/components/Avatar';
import { useState, useEffect } from 'react';
import { Settings, LayoutDashboard, BookOpen, FileText, Puzzle, Users, Menu, X, ArrowLeft } from 'lucide-react';
import './AdminGuard.css';

export default function AdminGuard({ children }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  // Tutup sidebar saat Escape ditekan
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setSidebarOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Cegah scroll body saat sidebar open di mobile
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) return <NotFound />;
  const isActive = (path) => loc.pathname === path ? 'active' : '';

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="admin-layout">
      {/* Overlay mobile saat sidebar terbuka */}
      <div
        className={`admin-sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`} aria-label="Sidebar admin">
        <div className="admin-sidebar-header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Settings size={24} style={{ color: 'var(--brand)' }} /> B3Matika Admin
        </div>
        
        <nav className="admin-sidebar-nav">
          <Link to="/panel-rahasia" className={`admin-nav-item ${isActive('/panel-rahasia')}`} onClick={closeSidebar}>
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link to="/panel-rahasia/topics" className={`admin-nav-item ${isActive('/panel-rahasia/topics')}`} onClick={closeSidebar}>
            <BookOpen size={20} /> Materi
          </Link>
          <Link to="/panel-rahasia/questions" className={`admin-nav-item ${isActive('/panel-rahasia/questions')}`} onClick={closeSidebar}>
            <FileText size={20} /> Soal
          </Link>
          <Link to="/panel-rahasia/puzzles" className={`admin-nav-item ${isActive('/panel-rahasia/puzzles')}`} onClick={closeSidebar}>
            <Puzzle size={20} /> Puzzle
          </Link>
          <Link to="/panel-rahasia/users" className={`admin-nav-item ${isActive('/panel-rahasia/users')}`} onClick={closeSidebar}>
            <Users size={20} /> Pengguna
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="admin-main">
        {/* Topbar */}
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              className="sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label={sidebarOpen ? 'Tutup sidebar' : 'Buka sidebar'}
              aria-expanded={sidebarOpen}
              aria-controls="admin-sidebar"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Link to="/" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ArrowLeft size={16} /> Ke Web Utama
            </Link>
          </div>
          
          <div className="admin-topbar-right">
            <ThemeToggle />
            
            <div className="admin-user-info">
              <Avatar user={user} size={36} className="admin-user-avatar" />
              <div>
                <div style={{ fontWeight: 600 }}>{user.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
              </div>
            </div>
            
            <button className="btn btn-sm btn-outline" onClick={() => { logout(); nav('/'); }}>
              Keluar
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}
