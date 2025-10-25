import React from 'react';
import { 
  getArrowStyles, 
  getArrowConfig,
  arrowClasses,
  arrowCSS 
} from './styles';
import { defaultTheme } from '../theme';

export interface ArrowProps {
  direction: 'left' | 'right' | 'up' | 'down';
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'outline' | 'ghost';
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  'aria-label'?: string;
  'data-testid'?: string;
  tenantTheme?: any;
}

export const Arrow: React.FC<ArrowProps> = ({
  direction,
  size = 'medium',
  variant = 'default',
  disabled = false,
  onClick,
  className = '',
  'aria-label': ariaLabel,
  'data-testid': dataTestId,
  tenantTheme = defaultTheme
}) => {
  const styles = getArrowStyles(direction, size, variant, disabled, tenantTheme);

  return (
    <>
      <style>{arrowCSS}</style>
          <button
            className={`${arrowClasses.button} ${className}`}
            style={styles.button}
            onClick={onClick}
            disabled={disabled}
            aria-label={ariaLabel || `Navigate ${direction}`}
            data-testid={dataTestId}
            type="button"
          >
        <svg
          className={arrowClasses.svg}
          style={styles.svg}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            className={arrowClasses.path}
            style={styles.path}
            d="M15 19l-7-7 7-7"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
      </button>
    </>
  );
};
