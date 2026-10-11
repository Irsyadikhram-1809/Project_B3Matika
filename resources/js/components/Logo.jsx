// Logo B3Matika: huruf B biru + angka 3 oranye, panah, dan simbol matematika
export function LogoMark({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true">
      <path d="M44 16H70a22 22 0 0 1 0 44H44M70 60a24 24 0 0 1 0 46H44" fill="none" stroke="#1FA2E8" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M30 30C30 12 64 12 64 34C64 50 46 54 42 56C60 56 68 68 68 80C68 104 26 106 26 86" fill="none" stroke="#F7931E" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 70C12 46 28 34 46 30" fill="none" stroke="#1FA2E8" strokeWidth="5" strokeLinecap="round" />
      <path d="M40 22l10 8-12 6z" fill="#1FA2E8" />
      <g fontFamily="Poppins, sans-serif" fontWeight="700" fontSize="14">
        <text x="82" y="26" fill="#F7931E">π</text>
        <text x="84" y="84" fill="#1FA2E8" fontSize="16">Σ</text>
        <text x="4" y="30" fill="#F7931E">+</text>
        <text x="18" y="108" fill="#F7931E">×</text>
        <text x="50" y="112" fill="#1FA2E8" fontSize="12">π</text>
      </g>
    </svg>
  );
}

export default function Logo({ size = 44, tagline = true, big = false }) {
  return (
    <span className={`logo ${big ? 'logo-big' : ''}`}>
      <img src="/images/logo.png" alt="B3Matika Logo" width={size} height={size} style={{ borderRadius: '12px' }} />
      <span className="logo-text">
        <span className="logo-name">B<span className="three">3</span>Matika</span>
        {tagline && <span className="logo-tag">B3 : Belajar, Berlatih, Bermain</span>}
      </span>
    </span>
  );
}
