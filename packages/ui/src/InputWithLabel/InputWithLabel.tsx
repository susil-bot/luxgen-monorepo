import React from 'react';
import { BaseComponentProps, TenantTheme, FormProps } from '../types';
import { withSSR } from '../ssr';
import { defaultTheme } from '../theme';

export interface InputWithLabelProps extends BaseComponentProps, FormProps {
  tenantTheme?: TenantTheme;
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  helperText?: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
}

const InputWithLabelComponent: React.FC<InputWithLabelProps> = ({
  tenantTheme = defaultTheme,
  className = '',
  style,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled = false,
  required = false,
  helperText,
  error,
  size = 'md',
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  const styles = {
    ...style,
    fontFamily: tenantTheme.fonts.primary,
    color: tenantTheme.colors.text,
  };

  return (
    <div className={`input-with-label-wrapper ${className}`} style={styles}>
      <label className="input-with-label-label">
        {label}
        {required && <span className="input-with-label-required">*</span>}
      </label>
      
      <input
        type={type}
        className={`input-with-label-input ${size} ${error ? 'error' : ''}`}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        {...props}
      />
      
      {error && (
        <p className="input-with-label-error">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="input-with-label-helper">{helperText}</p>
      )}
    </div>
  );
};

export const InputWithLabel = withSSR(InputWithLabelComponent);
