/* BackToTop.jsx — tombol kembali atas yang muncul setelah scroll 300px */
import { useState, useEffect } from 'react';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollUp = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      className={`back-to-top${visible ? ' visible' : ''}`}
      onClick={scrollUp}
      aria-label="Kembali ke atas"
      title="Kembali ke atas"
    >
      ↑
    </button>
  );
}
