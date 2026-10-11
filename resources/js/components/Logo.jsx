import BrandWordmark from './BrandWordmark';

export default function Logo({ size = 44, tagline = true, big = false }) {
  return (
    <span className={`logo ${big ? 'logo-big' : ''}`}>
      <img src="/images/logo.png" alt="B3Matika Logo" width={size} height={size} style={{ borderRadius: '12px' }} />
      <span className="logo-text">
        <span className="logo-name"><BrandWordmark /></span>
        {tagline && <span className="logo-tag">B3 : Belajar, Berlatih, Bermain</span>}
      </span>
    </span>
  );
}
