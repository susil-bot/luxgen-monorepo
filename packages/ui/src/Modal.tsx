import React, { useEffect } from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
      <button
        type="button"
        className="absolute inset-0 border-0 cursor-default"
        style={{ background: 'rgba(0, 0, 0, 0.45)' }}
        onClick={onClose}
        aria-label="Close dialog"
      />

      <div
        className={`relative w-full ${sizeClasses[size]} rounded-xl shadow-xl`}
        style={{
          background: 'var(--color-bg-primary)',
          border: '1px solid var(--color-separator)',
        }}
      >
        {title && (
          <div className="px-5 pt-5 pb-3" style={{ borderBottom: '1px solid var(--color-separator)' }}>
            <h3 className="text-lg font-semibold text-primary">{title}</h3>
          </div>
        )}
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
};
