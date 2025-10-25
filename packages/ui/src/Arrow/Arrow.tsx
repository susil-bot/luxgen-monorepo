import React from 'react';

export interface ArrowProps {
  direction: 'left' | 'right' | 'up' | 'down';
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'outline' | 'ghost';
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  'aria-label'?: string;
}

export const Arrow: React.FC<ArrowProps> = ({
  direction,
  size = 'medium',
  variant = 'default',
  disabled = false,
  onClick,
  className = '',
  'aria-label': ariaLabel
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-6 h-6';
      case 'medium':
        return 'w-8 h-8';
      case 'large':
        return 'w-10 h-10';
      default:
        return 'w-8 h-8';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'outline':
        return 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50';
      case 'ghost':
        return 'bg-transparent text-gray-600 hover:bg-gray-100';
      default:
        return 'bg-white/20 text-white hover:bg-white/30';
    }
  };

  const getDirectionClasses = () => {
    switch (direction) {
      case 'left':
        return 'rotate-0';
      case 'right':
        return 'rotate-180';
      case 'up':
        return '-rotate-90';
      case 'down':
        return 'rotate-90';
      default:
        return 'rotate-0';
    }
  };

  const getIconPath = () => {
    return (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 19l-7-7 7-7"
      />
    );
  };

  const baseClasses = `
    inline-flex items-center justify-center rounded-full transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
    ${getSizeClasses()}
    ${getVariantClasses()}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${className}
  `.trim();

  return (
    <button
      className={baseClasses}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel || `Navigate ${direction}`}
      type="button"
    >
      <svg
        className={`w-4 h-4 ${getDirectionClasses()}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        {getIconPath()}
      </svg>
    </button>
  );
};
