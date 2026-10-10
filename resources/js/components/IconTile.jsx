import React from 'react';

export default function IconTile({ icon: Icon, color = 'blue', className = '' }) {
  return (
    <div className={`icon-tile color-${color} ${className}`}>
      {Icon && <Icon className="icon-tile-svg" />}
    </div>
  );
}
