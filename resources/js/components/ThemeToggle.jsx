import React from 'react';
import { useTheme } from '@/context/ThemeContext';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-card, rgba(0,0,0,0.05))', padding: '4px', borderRadius: '8px' }}>
      <button 
        onClick={() => setTheme('light')} 
        title="Mode Terang" 
        style={{ 
          padding: '6px 10px', 
          border: 'none', 
          borderRadius: '4px',
          background: theme === 'light' ? 'var(--primary)' : 'transparent',
          color: theme === 'light' ? '#fff' : 'inherit',
          cursor: 'pointer'
        }}
      >
        ☀️
      </button>
      <button 
        onClick={() => setTheme('dark')} 
        title="Mode Gelap" 
        style={{ 
          padding: '6px 10px', 
          border: 'none', 
          borderRadius: '4px',
          background: theme === 'dark' ? 'var(--primary)' : 'transparent',
          color: theme === 'dark' ? '#fff' : 'inherit',
          cursor: 'pointer'
        }}
      >
        🌙
      </button>
      <button 
        onClick={() => setTheme('system')} 
        title="Ikuti Sistem" 
        style={{ 
          padding: '6px 10px', 
          border: 'none', 
          borderRadius: '4px',
          background: theme === 'system' ? 'var(--primary)' : 'transparent',
          color: theme === 'system' ? '#fff' : 'inherit',
          cursor: 'pointer'
        }}
      >
        💻
      </button>
    </div>
  );
}
