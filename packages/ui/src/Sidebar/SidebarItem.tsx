import React from 'react';
import { withSSR } from '../ssr';

export interface SidebarItemProps {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  badge?: string | number;
  disabled?: boolean;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
  level?: number;
}

const SidebarItemComponent: React.FC<SidebarItemProps> = ({
  id,
  label,
  icon,
  href,
  badge,
  disabled = false,
  isActive = false,
  onClick,
  className = '',
  level = 0,
  ...props
}) => {
  const baseClasses = 'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150';

  const stateClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

  const activeClasses = isActive ? 'ios-card-row' : 'hover:bg-[var(--color-fill-quaternary)]';

  const textClasses = isActive ? 'text-primary font-medium' : 'text-secondary';

  const iconClasses = isActive ? '' : '';

  const handleClick = () => {
    if (!disabled) {
      onClick?.();
    }
  };

  return (
    <div
      id={id}
      className={`${baseClasses} ${activeClasses} ${stateClasses} ${className}`}
      onClick={handleClick}
      style={{ paddingLeft: `${12 + level * 16}px` }}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
      {...props}
    >
      {/* Icon */}
      {icon && (
        <span
          className={`flex-shrink-0 ${iconClasses}`}
          style={{ color: isActive ? 'var(--color-blue)' : 'var(--color-label-tertiary)' }}
        >
          {icon}
        </span>
      )}

      {/* Label */}
      <span className={`flex-1 text-sm ${textClasses} truncate`}>{label}</span>

      {/* Badge */}
      {badge !== undefined && (
        <span className={`badge ${isActive ? 'badge-blue' : 'badge-gray'} text-xs`}>{badge}</span>
      )}
    </div>
  );
};

export const SidebarItem = withSSR(SidebarItemComponent);
