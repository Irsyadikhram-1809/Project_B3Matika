import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon, Monitor } from 'lucide-react';

const THEMES = [
  { value: 'light', icon: <Sun size={16} />, label: 'Mode Terang' },
  { value: 'dark',  icon: <Moon size={16} />, label: 'Mode Gelap'  },
  { value: 'system',icon: <Monitor size={16} />, label: 'Ikuti Sistem' },
];

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="theme-toggle" role="group" aria-label="Pilih tema tampilan">
      {THEMES.map(({ value, icon, label }) => (
        <button
          key={value}
          className={`theme-btn${theme === value ? ' active' : ''}`}
          onClick={() => setTheme(value)}
          title={label}
          aria-label={label}
          aria-pressed={theme === value}
        >
          {icon}
        </button>
      ))}
    </div>
  );
}
