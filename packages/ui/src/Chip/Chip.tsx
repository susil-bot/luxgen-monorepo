import React from 'react';

export interface ChipProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'outline';
  size?: 'small' | 'medium' | 'large';
  shape?: 'rounded' | 'pill' | 'square';
  closable?: boolean;
  onClose?: () => void;
  icon?: React.ReactNode;
  maxWidth?: string | number;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  onClick?: () => void;
  selected?: boolean;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  variant = 'primary',
  size = 'medium',
  shape = 'rounded',
  closable = false,
  onClose,
  icon,
  maxWidth,
  className,
  style,
  disabled = false,
  onClick,
  selected = false,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center gap-1.5 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1';
  
  const variantClasses = {
    primary: 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90',
    secondary: 'bg-[var(--color-secondary)] text-white hover:bg-[var(--color-secondary)]/90',
    success: 'bg-green-100 text-green-800 hover:bg-green-200',
    error: 'bg-red-100 text-red-800 hover:bg-red-200',
    warning: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    info: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    outline: 'border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10'
  };

  const sizeClasses = {
    small: 'px-2 py-1 text-xs',
    medium: 'px-3 py-1.5 text-sm',
    large: 'px-4 py-2 text-base'
  };

  const shapeClasses = {
    rounded: 'rounded-md',
    pill: 'rounded-full',
    square: 'rounded-none'
  };

  const stateClasses = {
    disabled: 'opacity-50 cursor-not-allowed',
    selected: 'ring-2 ring-[var(--color-primary)] ring-offset-1',
    clickable: 'cursor-pointer hover:scale-105'
  };

  const chipClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    shapeClasses[shape],
    disabled ? stateClasses.disabled : '',
    selected ? stateClasses.selected : '',
    onClick && !disabled ? stateClasses.clickable : '',
    className || ''
  ].filter(Boolean).join(' ');

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClose && !disabled) {
      onClose();
    }
  };

  const handleClick = () => {
    if (onClick && !disabled) {
      onClick();
    }
  };

  return (
    <div
      className={chipClasses}
      style={{
        maxWidth: maxWidth,
        ...style
      }}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && !disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
      {...props}
    >
      {icon && (
        <span className="flex-shrink-0">
          {icon}
        </span>
      )}
      
      <span className="truncate">
        {label}
      </span>
      
      {closable && (
        <button
          type="button"
          className="ml-1 flex-shrink-0 p-0.5 rounded-full hover:bg-black/10 focus:outline-none focus:ring-1 focus:ring-black/20"
          onClick={handleClose}
          disabled={disabled}
          aria-label={`Remove ${label}`}
        >
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
};