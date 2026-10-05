import { Route, Routes, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import NotFound from '@/components/NotFound';
import BrandIntro from '@/components/Brandintro';
import Home from '@/pages/Home';
import Games from '@/pages/Games';
import Board from '@/pages/Board';
import AuthForm from '@/pages/AuthForm';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Profil from '@/pages/Profil';
import Riwayat from '@/pages/Riwayat';
import Materi from '@/pages/learn/Materi';
import Grade from '@/pages/learn/Grade';
import Topic from '@/pages/learn/Topic';
import PuzzleList from '@/pages/puzzle/PuzzleList';
import PuzzleDetail from '@/pages/puzzle/PuzzleDetail';
import AdminLogin from '@/pages/admin/AdminLogin';
import AdminDashboard from '@/pages/admin/Dashboard';
import AdminUsers from '@/pages/admin/Users';
import AdminList from '@/pages/admin/ResourceList';
import AdminForm from '@/pages/admin/ResourceForm';
import TutorChat from '@/pages/TutorChat';
import MathBackground from '@/components/MathBackground';

export default function App() {
  const { ready } = useAuth();
  const loc = useLocation();
  const [showSplash, setShowSplash] = useState(true);
  const isAdminPath = loc.pathname.startsWith('/panel-rahasia');

  if (!ready) return <div className="container page center muted">Memuat…</div>;

  return (
    <>
      {showSplash && <BrandIntro splash once onFinish={() => setShowSplash(false)} />}
      {!isAdminPath && <MathBackground />}
      {!isAdminPath && <Navbar />}
      <main className={isAdminPath ? "" : "container page"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/materi" element={<Materi />} />
          <Route path="/kelas/:g" element={<Grade />} />
          <Route path="/materi/:id" element={<Topic />} />
          <Route path="/games" element={<Games />} />
          <Route path="/puzzle" element={<PuzzleList />} />
          <Route path="/puzzle/:id" element={<PuzzleDetail />} />
          <Route path="/ai-tutor" element={<TutorChat />} />
          <Route path="/papan-skor" element={<Board />} />
          <Route path="/masuk" element={<AuthForm mode="login" />} />
          <Route path="/daftar" element={<AuthForm mode="register" />} />
          <Route path="/lupa-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/profil" element={<Profil />} />
          <Route path="/riwayat" element={<Riwayat />} />

          {/* Admin: URL tersembunyi, tidak ditautkan di situs; non-admin melihat 404 */}
          <Route path="/panel-rahasia/login" element={<AdminLogin />} />
          <Route path="/panel-rahasia" element={<AdminDashboard />} />
          <Route path="/panel-rahasia/users" element={<AdminUsers />} />
          <Route path="/panel-rahasia/:res" element={<AdminList />} />
          <Route path="/panel-rahasia/:res/create" element={<AdminForm />} />
          <Route path="/panel-rahasia/:res/:id/edit" element={<AdminForm />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isAdminPath && <footer className="footer">© {new Date().getFullYear()} B3Matika — Belajar, Berlatih, Bermain</footer>}
    </>
  );
}
