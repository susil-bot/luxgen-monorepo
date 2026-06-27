import React, { useState, useRef } from 'react';
import { BaseComponentProps, TenantTheme, SelectOption } from '../types';
import { withSSR } from '../ssr';
import { defaultTheme } from '../theme';

export interface SelectProps extends BaseComponentProps {
  tenantTheme?: TenantTheme;
  options: SelectOption[];
  value?: string | number | Array<string | number>;
  onChange?: (value: string | number | Array<string | number>) => void;
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
  const [dropup, setDropup] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const DROPDOWN_MAX_HEIGHT = 200;

  const toggleOpen = () => {
    if (disabled) return;

    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      setDropup(spaceBelow < DROPDOWN_MAX_HEIGHT && spaceAbove > spaceBelow);
    }

    setIsOpen((open) => !open);
  };

  const filteredOptions = searchable
    ? options.filter((option) => option.label.toLowerCase().includes(searchTerm.toLowerCase()))
    : options;

  const selectedOptions: Array<string | number> = multi
    ? Array.isArray(value)
      ? value
      : []
    : value !== undefined && value !== null && !Array.isArray(value)
      ? [value]
      : [];

  const handleSelect = (option: SelectOption) => {
    if (disabled || option.disabled) return;

    if (multi) {
      const newValue = selectedOptions.includes(option.value)
        ? selectedOptions.filter((v) => v !== option.value)
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

      <div className="select-container" ref={containerRef}>
        <div
          className={`select-trigger ${error ? 'error' : ''} ${disabled ? 'disabled' : ''}`}
          onClick={toggleOpen}
          {...props}
        >
          <div className="select-value">
            {multi ? (
              selectedOptions.length > 0 ? (
                <div className="select-multi-value">
                  {selectedOptions.map((val, index) => {
                    const option = options.find((opt) => opt.value === val);
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
                {value ? options.find((opt) => opt.value === value)?.label : placeholder}
              </span>
            )}
          </div>

          <div className="select-actions">
            {clearable && value && (
              <button type="button" className="select-clear" onClick={handleClear}>
                ×
              </button>
            )}
            <span className="select-arrow" aria-hidden>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M2.5 4.5L6 8L9.5 4.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
        </div>

        {isOpen && (
          <div className={`select-dropdown${dropup ? ' select-dropdown--dropup' : ''}`}>
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

      {error && <p className="select-error">{error}</p>}

      {helperText && !error && <p className="select-helper">{helperText}</p>}
    </div>
  );
};

export const Select = withSSR(SelectComponent);
