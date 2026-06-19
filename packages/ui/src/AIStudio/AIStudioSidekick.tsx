import React from 'react';
import { AIStudioLogo } from './AIStudioLogo';

export interface AIStudioSidekickProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  onPopOut?: () => void;
  onNewConversation?: () => void;
  width?: number;
  className?: string;
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="lux-sidekick-icon-btn"
    >
      {children}
    </button>
  );
}

/**
 * Shopify Sidekick-style docked assistant panel.
 * Renders as a right column; pair with AppLayout flex shell.
 */
export function AIStudioSidekick({
  open,
  onClose,
  title = 'AI Studio',
  children,
  onPopOut,
  onNewConversation,
  width = 400,
  className = '',
}: AIStudioSidekickProps) {
  if (!open) return null;

  return (
    <aside
      className={`lux-sidekick ${className}`}
      style={{ width, flexShrink: 0 }}
      aria-label="AI Studio assistant"
    >
      <header className="lux-sidekick-header">
        <div className="lux-sidekick-header-left">
          <button type="button" className="lux-sidekick-title-btn" aria-haspopup="listbox">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
            <span className="lux-sidekick-title">{title}</span>
          </button>
        </div>
        <div className="lux-sidekick-header-actions">
          <IconButton label="New conversation" onClick={onNewConversation}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </IconButton>
          <IconButton label="Open full AI Studio" onClick={onPopOut}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </IconButton>
          <IconButton label="Close assistant" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </IconButton>
        </div>
      </header>

      <div className="lux-sidekick-body">{children}</div>
    </aside>
  );
}

export function AIStudioSidekickFooter({
  value,
  onChange,
  onSubmit,
  disabled,
  placeholder = 'Ask anything…',
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <footer className="lux-sidekick-footer">
      <div className="lux-sidekick-feedback">
        <button type="button" className="lux-sidekick-feedback-btn" aria-label="Helpful">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14zM4 22H2a1 1 0 01-1-1v-7a1 1 0 011-1h2" />
          </svg>
        </button>
        <button type="button" className="lux-sidekick-feedback-btn" aria-label="Not helpful">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 15v4a3 3 0 003 3l4-9V3H6.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10zM20 2h2a1 1 0 011 1v7a1 1 0 01-1 1h-2" />
          </svg>
        </button>
      </div>
      <div className="lux-sidekick-input-row">
        <AIStudioLogo size={16} />
        <input
          type="text"
          className="lux-sidekick-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          aria-label="Message AI Studio"
        />
        <button type="button" className="lux-sidekick-input-action" aria-label="Add attachment" disabled={disabled}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <button type="button" className="lux-sidekick-input-action" aria-label="Voice input" disabled={disabled}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </button>
      </div>
    </footer>
  );
}
