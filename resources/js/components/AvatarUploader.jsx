import { useState, useRef } from 'react';

export default function AvatarUploader({ currentAvatar, onAvatarSelect, onError }) {
  const fileInput = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return onError('Ukuran file maksimal 2 MB.');
    if (file.type.includes('svg')) return onError('Format SVG tidak diizinkan.');
    
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 512;
        
        const size = Math.min(img.width, img.height);
        const sx = (img.width - size) / 2;
        const sy = (img.height - size) / 2;
        
        ctx.drawImage(img, sx, sy, size, size, 0, 0, 512, 512);
        onAvatarSelect(canvas.toDataURL('image/webp', 0.8));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = null; // reset input
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
      <div 
        style={{ width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', cursor: 'pointer' }}
        onClick={() => fileInput.current?.click()}
        title="Klik untuk mengubah foto"
      >
        {currentAvatar?.startsWith('http') || currentAvatar?.startsWith('data:') ? (
          <img src={currentAvatar} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          currentAvatar || '🎓'
        )}
      </div>
      <div>
        <button type="button" className="btn btn-sm btn-outline" onClick={() => fileInput.current?.click()}>
          Unggah Foto
        </button>
        <div className="small muted mt" style={{ marginTop: '4px' }}>Maks 2 MB (JPG/PNG/WebP)</div>
      </div>
      <input 
        type="file" 
        accept="image/jpeg,image/png,image/webp" 
        onChange={handleFileChange} 
        style={{ display: 'none' }}
        ref={fileInput}
      />
    </div>
  );
}
