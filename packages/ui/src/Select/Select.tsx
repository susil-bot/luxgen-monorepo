import React, { useState } from 'react';
import { BaseComponentProps, TenantTheme, FormProps, SelectOption } from '../types';
import { withSSR } from '../ssr';
import { defaultTheme } from '../theme';

export interface SelectProps extends BaseComponentProps, FormProps {
  tenantTheme?: TenantTheme;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  multi?: boolean;
  label?: string;
  helperText?: string;
  error?: string;
  searchable?: boolean;
  clearable?: boolean;
}

const SelectComponent: React.FC<SelectProps> = ({
  tenantTheme = defaultTheme,
  className = '',
  style,
  options = [],
  value,
  onChange,
  placeholder = 'Select an option...',
  disabled = false,
  required = false,
  multi = false,
  label,
  helperText,
  error,
  searchable = false,
  clearable = false,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOptions = searchable
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  const selectedOptions = multi
    ? (Array.isArray(value) ? value : [])
    : (value ? [value] : []);

  const handleSelect = (option: SelectOption) => {
    if (disabled || option.disabled) return;

    if (multi) {
      const newValue = selectedOptions.includes(option.value)
        ? selectedOptions.filter(v => v !== option.value)
        : [...selectedOptions, option.value];
      onChange?.(newValue);
    } else {
      onChange?.(option.value);
      setIsOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(multi ? [] : '');
  };

  const styles = {
    ...style,
    fontFamily: tenantTheme.fonts.primary,
    color: tenantTheme.colors.text,
  };

  return (
    <div className={`select-wrapper ${className}`} style={styles}>
      {label && (
        <label className="select-label">
          {label}
          {required && <span className="select-required">*</span>}
        </label>
      )}
      
      <div className="select-container">
        <div
          className={`select-trigger ${error ? 'error' : ''} ${disabled ? 'disabled' : ''}`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          {...props}
        >
          <div className="select-value">
            {multi ? (
              selectedOptions.length > 0 ? (
                <div className="select-multi-value">
                  {selectedOptions.map((val, index) => {
                    const option = options.find(opt => opt.value === val);
                    return (
                      <span key={index} className="select-multi-tag">
                        {option?.label}
                        <button
                          type="button"
                          className="select-multi-remove"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelect(option!);
                          }}
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>
              ) : (
                <span className="select-placeholder">{placeholder}</span>
              )
            ) : (
              <span className="select-single-value">
                {value ? options.find(opt => opt.value === value)?.label : placeholder}
              </span>
            )}
          </div>
          
          <div className="select-actions">
            {clearable && value && (
              <button
                type="button"
                className="select-clear"
                onClick={handleClear}
              >
                ×
              </button>
            )}
            <span className="select-arrow">▼</span>
          </div>
        </div>
        
        {isOpen && (
          <div className="select-dropdown">
            {searchable && (
              <div className="select-search">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="select-search-input"
                />
              </div>
            )}
            
            <div className="select-options">
              {filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={`select-option ${selectedOptions.includes(option.value) ? 'selected' : ''} ${option.disabled ? 'disabled' : ''}`}
                  onClick={() => handleSelect(option)}
                >
                  {multi && (
                    <input
                      type="checkbox"
                      checked={selectedOptions.includes(option.value)}
                      onChange={() => {}}
                      className="select-checkbox"
                    />
                  )}
                  <span className="select-option-label">{option.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <p className="select-error">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="select-helper">{helperText}</p>
      )}
    </div>
  );
};

export const Select = withSSR(SelectComponent);
