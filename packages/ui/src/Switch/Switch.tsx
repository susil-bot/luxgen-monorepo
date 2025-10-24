import React from 'react';
import { BaseComponentProps, TenantTheme, BaseFormProps } from '../types';
import { withSSR } from '../ssr';
import { defaultTheme } from '../theme';

export interface SwitchProps extends BaseComponentProps, BaseFormProps {
  tenantTheme?: TenantTheme;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  helperText?: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  checked?: boolean;
}

const SwitchComponent: React.FC<SwitchProps> = ({
  tenantTheme = defaultTheme,
  className = '',
  style,
  checked,
  onChange,
  label,
  disabled = false,
  required = false,
  helperText,
  error,
  size = 'md',
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.checked);
    }
  };

  const styles = {
    ...style,
    fontFamily: tenantTheme.fonts.primary,
    color: tenantTheme.colors.text,
  };

  return (
    <div className={`switch-wrapper ${className}`} style={styles}>
      <label className={`switch-label ${disabled ? 'disabled' : ''}`}>
        <input
          type="checkbox"
          className="switch-input"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          required={required}
          {...props}
        />
        
        <span className={`switch-custom ${size} ${error ? 'error' : ''}`}>
          <span className="switch-thumb"></span>
        </span>
        
        {label && (
          <span className="switch-text">
            {label}
            {required && <span className="switch-required">*</span>}
          </span>
        )}
      </label>
      
      {error && (
        <p className="switch-error">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="switch-helper">{helperText}</p>
      )}
    </div>
  );
};

export const Switch = withSSR(SwitchComponent);
