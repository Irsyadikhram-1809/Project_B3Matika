import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import NotFound from '@/components/NotFound';

export default function AdminGuard({ children }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  if (!user || user.role !== 'admin') return <NotFound />;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f4f6fa' }}>
      <header style={{ background: '#1b2468', color: '#fff', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, color: '#fff', fontSize: '1.2rem' }}>⚙️ Panel Admin B3Matika</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '0.9rem' }}>Halo, <b>{user.name}</b></span>
          <Link to="/" style={{ color: '#fff', fontSize: '0.85rem', textDecoration: 'underline' }}>Ke Web Utama</Link>
          <button className="btn btn-sm btn-danger" onClick={() => { logout(); nav('/'); }}>Keluar</button>
        </div>
      </header>

      <div className="container" style={{ marginTop: '20px' }}>
        <div className="admin-nav" style={{ display: 'flex', gap: '15px', background: '#fff', padding: '12px 20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
          <Link to="/panel-rahasia" style={{ fontWeight: 600 }}>Dashboard</Link>
          <Link to="/panel-rahasia/topics" style={{ fontWeight: 600 }}>Materi</Link>
          <Link to="/panel-rahasia/questions" style={{ fontWeight: 600 }}>Soal</Link>
          <Link to="/panel-rahasia/puzzles" style={{ fontWeight: 600 }}>Puzzle</Link>
          <Link to="/panel-rahasia/users" style={{ fontWeight: 600 }}>Pengguna</Link>
        </div>
      </div>

      <main className="container page" style={{ paddingTop: '0', flex: 1 }}>
        {children}
      </main>
    </div>
  );
}
