import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WelcomeToast({ user, onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 500); // Tunggu animasi exit selesai
    }, 4500);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!user) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            color: '#fff',
            padding: '16px 24px',
            borderRadius: '16px',
            boxShadow: '0 10px 30px rgba(37,99,235,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            zIndex: 9999
          }}
        >
          <div style={{ fontSize: '32px' }}>{user.last_seen ? '👋' : '🎉'}</div>
          <div>
            <h4 style={{ margin: '0 0 4px', fontSize: '16px' }}>Selamat Datang, {user.name}!</h4>
            <p style={{ margin: 0, fontSize: '13px', opacity: 0.9 }}>
              {user.last_seen ? 'Senang melihatmu kembali.' : 'Akunmu berhasil dibuat.'}
            </p>
          </div>
          <button 
            onClick={() => setVisible(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255,255,255,0.7)',
              fontSize: '24px',
              cursor: 'pointer',
              marginLeft: '8px',
              padding: '0 4px',
              lineHeight: 1
            }}
          >
            &times;
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
