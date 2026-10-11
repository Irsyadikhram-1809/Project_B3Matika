import React from 'react';
import './ActionButton.css';

export default function ActionButton({ 
  icon: Icon, 
  label, 
  variant = 'secondary', 
  onClick, 
  disabled = false,
  title,
  className = ''
}) {
  return (
    <button 
      type="button"
      className={`action-btn action-btn-${variant} ${className}`}
      onClick={onClick}
      disabled={disabled}
      title={title || label}
      aria-label={label}
    >
      {Icon && <Icon size={14} className="action-btn-icon" />}
      {label && <span className="action-btn-label">{label}</span>}
    </button>
  );
}

export function ActionGroup({ children, className = '' }) {
  return (
    <div className={`action-group ${className}`}>
      {children}
    </div>
  );
}
