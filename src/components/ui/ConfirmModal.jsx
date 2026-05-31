import { useEffect } from 'react';

export default function ConfirmModal({ open, title, children, onCancel, onConfirm }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onCancel?.();
    }
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="confirm-modal-backdrop" role="dialog" aria-modal="true" aria-label={title} onClick={onCancel}>
      <div className="confirm-modal-shell card p-16" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-modal-header">
          <h3 className="confirm-modal-title">{title}</h3>
          <button className="confirm-modal-close" onClick={onCancel} aria-label="Fermer">×</button>
        </div>
        <div className="confirm-modal-body">{children}</div>
        <div className="confirm-modal-footer">
          <button className="btn btn-ghost" onClick={onCancel}>Annuler</button>
          <button className="btn btn-primary" onClick={onConfirm}>Confirmer</button>
        </div>
      </div>
    </div>
  );
}
