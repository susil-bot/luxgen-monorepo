import React from 'react';
import { BaseComponentProps, TenantTheme, BaseFormProps } from '../types';
import { withSSR } from '../ssr';
import { defaultTheme } from '../theme';

export interface TextAreaProps extends BaseComponentProps, BaseFormProps {
  tenantTheme?: TenantTheme;
  rows?: number;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  maxLength?: number;
  minLength?: number;
  required?: boolean;
  label?: string;
  helperText?: string;
  error?: string;
}

const TextAreaComponent: React.FC<TextAreaProps> = ({
  tenantTheme = defaultTheme,
  className = '',
  style,
  value,
  onChange,
  placeholder,
  disabled = false,
  readOnly = false,
  maxLength,
  minLength,
  required = false,
  label,
  helperText,
  error,
  rows = 4,
  ...props
}) => {
  const baseStyles = {
    ...style,
    fontFamily: tenantTheme.fonts.primary,
    color: tenantTheme.colors.text,
    backgroundColor: disabled ? tenantTheme.colors.surface : tenantTheme.colors.background,
    borderColor: error ? tenantTheme.colors.error : tenantTheme.colors.border,
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div className={`textarea-wrapper ${className}`}>
      {label && (
        <label className="textarea-label">
          {label}
          {required && <span className="textarea-required">*</span>}
        </label>
      )}
      
      <textarea
        className={`textarea ${error ? 'error' : ''}`}
        style={baseStyles}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        maxLength={maxLength}
        minLength={minLength}
        required={required}
        rows={rows}
        {...props}
      />
      
      {error && (
        <p className="textarea-error">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="textarea-helper">{helperText}</p>
      )}
    </div>
  );
};

export const TextArea = withSSR(TextAreaComponent);
