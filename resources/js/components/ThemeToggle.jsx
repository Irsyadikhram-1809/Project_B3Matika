import { useTheme } from '@/context/ThemeContext';

const THEMES = [
  { value: 'light', emoji: '☀️', label: 'Mode Terang' },
  { value: 'dark',  emoji: '🌙', label: 'Mode Gelap'  },
  { value: 'system',emoji: '💻', label: 'Ikuti Sistem' },
];

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="theme-toggle" role="group" aria-label="Pilih tema tampilan">
      {THEMES.map(({ value, emoji, label }) => (
        <button
          key={value}
          className={`theme-btn${theme === value ? ' active' : ''}`}
          onClick={() => setTheme(value)}
          title={label}
          aria-label={label}
          aria-pressed={theme === value}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
