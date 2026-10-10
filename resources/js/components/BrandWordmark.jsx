import React from 'react';

export default function BrandWordmark({ size = 'md', className = '' }) {
  // sizes: sm, md, lg, xl
  return (
    <span className={`brand-wordmark size-${size} ${className}`}>
      B<span className="brand-wordmark-3">3</span>Matika
    </span>
  );
}
