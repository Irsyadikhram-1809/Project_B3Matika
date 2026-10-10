import { useState } from 'react';

export default function Avatar({ user, size = 40, alt, className = '' }) {
  const [imgError, setImgError] = useState(false);
  const avatar = user?.avatar;
  const name = user?.name || user?.username || user?.email || '?';
  const initial = name.charAt(0).toUpperCase();

  const isUrl = avatar && (avatar.startsWith('http') || avatar.startsWith('data:'));
  const isEmoji = avatar && !isUrl;

  const style = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '50%',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    background: 'var(--surface)',
    border: '2px solid var(--line)',
    fontSize: `${size * 0.4}px`,
    fontWeight: 'bold',
    color: 'var(--text)',
  };

  if (isUrl && !imgError) {
    return (
      <div className={`avatar ${className}`} style={style} aria-label={alt || name} role="img">
        <img 
          src={avatar} 
          alt={alt || name} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  if (isEmoji && !imgError) {
    return (
      <div className={`avatar ${className}`} style={{ ...style, fontSize: `${size * 0.6}px` }} aria-label={alt || name} role="img">
        {avatar}
      </div>
    );
  }

  // Fallback: Initial
  return (
    <div className={`avatar ${className}`} style={{ ...style, background: 'var(--blue)', color: 'white', borderColor: 'var(--blue)' }} aria-label={alt || name} role="img">
      {initial}
    </div>
  );
}
