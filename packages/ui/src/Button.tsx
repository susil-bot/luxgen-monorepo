import React from 'react';

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled = false,
  className = '',
  type = 'button',
  loading = false,
}) => {
  const variantClasses: Record<string, string> = {
    primary: 'ios-btn-primary',
    secondary: 'ios-btn-secondary',
    outline: 'ios-btn-plain',
    danger: 'ios-btn-primary',
    ghost: 'ios-btn-plain',
  };

  const sizeClasses: Record<string, string> = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-6 py-3',
  };

  const baseClass = variantClasses[variant];
  const sizeClass = sizeClasses[size];
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClass} ${sizeClass} ${disabledClass} ${className}`}
      style={variant === 'danger' ? { backgroundColor: 'var(--color-red)' } : undefined}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="ios-spinner w-4 h-4" />
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
};
