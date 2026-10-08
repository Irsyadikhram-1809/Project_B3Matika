/* Reveal.jsx — progressive enhancement tanpa framer-motion dependency issues
 *
 * Prinsip: elemen HARUS terlihat secara default (opacity: 1, transform: none).
 * IntersectionObserver menambahkan class 'reveal-pending' saat mount, lalu
 * 'reveal-done' saat elemen masuk viewport. Jika JS gagal atau IO tidak
 * didukung, konten tetap terlihat.
 *
 * Kelas CSS reveal-item, reveal-pending, reveal-done didefinisikan di app.css.
 */
import { useEffect, useRef } from 'react';

export default function Reveal({ children, delay = 0, style, width = '100%' }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Cek prefers-reduced-motion — jika aktif, skip animasi
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    // Cek IntersectionObserver support
    if (!('IntersectionObserver' in window)) return;

    // Tandai sebagai pending (opacity: 0 + translate)
    el.classList.add('reveal-pending');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Terapkan delay melalui style
            if (delay) el.style.transitionDelay = `${delay}s`;
            el.classList.remove('reveal-pending');
            el.classList.add('reveal-done');
            observer.unobserve(el);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -5% 0px',
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className="reveal-item"
      style={{ width, ...style }}
    >
      {children}
    </div>
  );
}
