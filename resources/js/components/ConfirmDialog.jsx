import React, { useEffect, useRef } from 'react';

export default function ConfirmDialog({ 
  isOpen, 
  title, 
  description, 
  confirmLabel = 'Hapus', 
  cancelLabel = 'Batal', 
  confirmVariant = 'danger', 
  onConfirm, 
  onCancel,
  isLoading = false
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onCancel();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      // Auto focus cancel button when opened
      setTimeout(() => {
        if (dialogRef.current) {
          const cancelBtn = dialogRef.current.querySelector('.btn-cancel');
          if (cancelBtn) cancelBtn.focus();
        }
      }, 50);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isLoading) {
      onCancel();
    }
  };

  return (
    <div className="confirm-dialog-backdrop" onClick={handleBackdropClick}>
      <div 
        className="confirm-dialog" 
        role="alertdialog" 
        aria-modal="true" 
        aria-labelledby="dialog-title" 
        aria-describedby="dialog-desc"
        ref={dialogRef}
      >
        <h3 id="dialog-title" className="confirm-title">{title}</h3>
        <p id="dialog-desc" className="confirm-desc">{description}</p>
        <div className="confirm-actions">
          <button 
            type="button" 
            className="btn btn-outline btn-cancel" 
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelLabel}
          </button>
          <button 
            type="button" 
            className={`btn btn-${confirmVariant}`} 
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Memproses...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
