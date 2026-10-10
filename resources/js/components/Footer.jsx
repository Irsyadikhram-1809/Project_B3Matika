import { Link } from 'react-router-dom';
import BrandWordmark from './BrandWordmark';

/**
 * Footer — komponen tersendiri untuk B3Matika.
 * Layout: satu kolom di mobile, tiga kolom di desktop.
 * Warna via design tokens, padding bottom memperhitungkan safe-area.
 * Tidak tampil di halaman admin/standalone (dikontrol di App.jsx).
 */
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer" aria-label="Footer B3Matika">
      <div className="container site-footer-inner">
        {/* Kolom 1: Branding */}
        <div className="footer-brand">
          <span className="footer-logo-name" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            <BrandWordmark />
          </span>
          <p className="footer-tagline">Belajar, Berlatih, Bermain</p>
          <p className="footer-desc">
            Platform belajar matematika interaktif untuk SD, SMP, hingga SMA/SMK.
          </p>
        </div>

        {/* Kolom 2: Navigasi */}
        <nav className="footer-nav" aria-label="Navigasi footer">
          <h3 className="footer-nav-title">Jelajahi</h3>
          <ul className="footer-nav-list">
            <li><Link to="/">Beranda</Link></li>
            <li><Link to="/materi">Materi</Link></li>
            <li><Link to="/games">Games</Link></li>
            <li><Link to="/puzzle">Puzzle</Link></li>
            <li><Link to="/ai-tutor">AI Tutor</Link></li>
            <li><Link to="/papan-skor">Papan Skor</Link></li>
          </ul>
        </nav>

        {/* Kolom 3: Akun */}
        <nav className="footer-nav" aria-label="Navigasi akun">
          <h3 className="footer-nav-title">Akun</h3>
          <ul className="footer-nav-list">
            <li><Link to="/masuk">Masuk</Link></li>
            <li><Link to="/daftar">Daftar</Link></li>
            <li><Link to="/profil">Profil Saya</Link></li>
            <li><Link to="/riwayat">Riwayat Belajar</Link></li>
          </ul>
        </nav>
      </div>

      {/* Baris hak cipta */}
      <div className="footer-copy">
        <div className="container">
          <p>© {year} B3Matika. Dibuat dengan ❤️ untuk pelajar Indonesia.</p>
        </div>
      </div>
    </footer>
  );
}
