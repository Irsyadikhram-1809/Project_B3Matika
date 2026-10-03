import { useEffect, useState } from 'react';

const formulas = [
  'E = mc²',
  'a² + b² = c²',
  '∫ e^x dx = e^x',
  'π ≈ 3.14159',
  'F = G(m₁m₂)/r²',
  'sin²θ + cos²θ = 1',
  'x = (-b ± √(b² - 4ac)) / 2a',
  '∇ × E = -∂B/∂t',
  'e^(iπ) + 1 = 0',
  '∑ n = n(n+1)/2'
];

export default function MathBackground() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    // Generate random positions, speeds, and formulas
    const generated = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      formula: formulas[Math.floor(Math.random() * formulas.length)],
      left: Math.random() * 100, // percentage
      top: Math.random() * 100, // percentage
      duration: 15 + Math.random() * 25, // seconds
      delay: Math.random() * -20, // negative delay so they start immediately
      opacity: 0.1 + Math.random() * 0.15,
      scale: 0.7 + Math.random() * 0.6,
      rotate: (Math.random() - 0.5) * 45 // slight rotation
    }));
    setItems(generated);
  }, []);

  return (
    <div className="math-bg-container">
      {items.map(item => (
        <div
          key={item.id}
          className="math-bg-item"
          style={{
            left: `${item.left}%`,
            top: `${item.top}%`,
            animationDuration: `${item.duration}s`,
            animationDelay: `${item.delay}s`,
            '--item-opacity': item.opacity,
            transform: `scale(${item.scale}) rotate(${item.rotate}deg)`,
          }}
        >
          {item.formula}
        </div>
      ))}
    </div>
  );
}
