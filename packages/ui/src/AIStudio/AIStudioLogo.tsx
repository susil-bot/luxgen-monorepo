import React from 'react';

export interface AIStudioLogoProps {
  size?: number;
  className?: string;
}

/** AI Studio mark — blue tile with sparkle, used in NavBar and Sidekick. */
export function AIStudioLogo({ size = 20, className = '' }: AIStudioLogoProps) {
  return (
    <span
      className={className}
      style={{
        width: size + 12,
        height: size + 12,
        borderRadius: 10,
        background: 'linear-gradient(135deg, var(--color-blue) 0%, var(--color-purple) 100%)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
      }}
      aria-hidden
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2l1.4 4.6L18 8l-4.6 1.4L12 14l-1.4-4.6L6 8l4.6-1.4L12 2z"
          fill="#fff"
          opacity={0.95}
        />
        <path
          d="M19 11l.8 2.6L22.5 14l-2.7.8L19 17.5l-.8-2.7L15.5 14l2.7-.8L19 11z"
          fill="#fff"
          opacity={0.85}
        />
      </svg>
    </span>
  );
}
