import React from 'react';
import { BaseComponentProps, TenantTheme, FormProps, RadioOption } from '../types';
import { withSSR } from '../ssr';
import { defaultTheme } from '../theme';

export interface RadioGroupProps extends BaseComponentProps, FormProps {
  tenantTheme?: TenantTheme;
  options: RadioOption[];
  name: string;
  disabled?: boolean;
  required?: boolean;
  label?: string;
  helperText?: string;
  error?: string;
  orientation?: 'horizontal' | 'vertical';
}

const RadioGroupComponent: React.FC<RadioGroupProps> = ({
  tenantTheme = defaultTheme,
  className = '',
  style,
  options = [],
  name,
  value,
  onChange,
  disabled = false,
  required = false,
  label,
  helperText,
  error,
  orientation = 'vertical',
  ...props
}) => {
  const handleChange = (optionValue: string | number) => {
    if (onChange) {
      onChange(optionValue);
    }
  };

  const styles = {
    ...style,
    fontFamily: tenantTheme.fonts.primary,
    color: tenantTheme.colors.text,
  };

  return (
    <div className={`radio-group-wrapper ${className}`} style={styles}>
      {label && (
        <label className="radio-group-label">
          {label}
          {required && <span className="radio-group-required">*</span>}
        </label>
      )}
      
      <div className={`radio-group ${orientation}`}>
        {options.map((option) => (
          <label
            key={option.value}
            className={`radio-option ${disabled || option.disabled ? 'disabled' : ''}`}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => handleChange(option.value)}
              disabled={disabled || option.disabled}
              required={required}
              className="radio-input"
            />
            
            <span className={`radio-custom ${error ? 'error' : ''}`}>
              <span className="radio-dot"></span>
            </span>
            
            <span className="radio-text">{option.label}</span>
          </label>
        ))}
      </div>
      
      {error && (
        <p className="radio-group-error">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="radio-group-helper">{helperText}</p>
      )}
    </div>
  );
};

export const RadioGroup = withSSR(RadioGroupComponent);
