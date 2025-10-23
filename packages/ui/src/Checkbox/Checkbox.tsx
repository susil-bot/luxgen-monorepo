import React from 'react';
import { BaseComponentProps, TenantTheme, FormProps } from '../types';
import { withSSR } from '../ssr';
import { defaultTheme } from '../theme';

export interface CheckboxProps extends BaseComponentProps, FormProps {
  tenantTheme?: TenantTheme;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  helperText?: string;
  error?: string;
  indeterminate?: boolean;
}

const CheckboxComponent: React.FC<CheckboxProps> = ({
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
  indeterminate = false,
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
    <div className={`checkbox-wrapper ${className}`} style={styles}>
      <label className={`checkbox-label ${disabled ? 'disabled' : ''}`}>
        <input
          type="checkbox"
          className="checkbox-input"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          required={required}
          ref={(input) => {
            if (input) {
              input.indeterminate = indeterminate;
            }
          }}
          {...props}
        />
        
        <span className={`checkbox-custom ${error ? 'error' : ''}`}>
          <svg
            className="checkbox-icon"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M13.5 4.5L6 12L2.5 8.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="checkbox-check"
            />
            <path
              d="M4 8H12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="checkbox-indeterminate"
            />
          </svg>
        </span>
        
        {label && (
          <span className="checkbox-text">
            {label}
            {required && <span className="checkbox-required">*</span>}
          </span>
        )}
      </label>
      
      {error && (
        <p className="checkbox-error">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="checkbox-helper">{helperText}</p>
      )}
    </div>
  );
};

export const Checkbox = withSSR(CheckboxComponent);
