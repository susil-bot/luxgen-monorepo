import React, { useState, useRef, useEffect } from 'react';
import { withSSR } from '../ssr';

export interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  className?: string;
  variant?: 'default' | 'minimal' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  disabled?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  suggestions?: string[];
  onSuggestionClick?: (suggestion: string) => void;
  showSuggestions?: boolean;
  maxSuggestions?: number;
}

const SearchBarComponent: React.FC<SearchBarProps> = ({
  placeholder = 'Search',
  onSearch,
  onFocus,
  onBlur,
  className = '',
  variant = 'default',
  size = 'md',
  showIcon = true,
  disabled = false,
  value = '',
  onChange,
  suggestions = [],
  onSuggestionClick,
  showSuggestions = true,
  maxSuggestions = 5,
  ...props
}) => {
  const [searchQuery, setSearchQuery] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestionsList, setShowSuggestionsList] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchQuery(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestionsList(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    onChange?.(newValue);
    if (newValue && suggestions.length > 0) {
      setShowSuggestionsList(true);
    } else {
      setShowSuggestionsList(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
    setShowSuggestionsList(false);
  };

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
    if (searchQuery && suggestions.length > 0) {
      setShowSuggestionsList(true);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
    setTimeout(() => setShowSuggestionsList(false), 200);
  };

  const getInputClasses = () => {
    const baseStyles = 'input-field w-full transition-all duration-200';
    const sizeStyles = size === 'sm' ? 'text-xs py-1.5' : size === 'lg' ? 'text-base py-3' : 'text-sm py-2';
    if (showIcon) {
      return `${baseStyles} ${sizeStyles} pl-10`;
    }
    return `${baseStyles} ${sizeStyles}`;
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    onChange?.(suggestion);
    onSearch?.(suggestion);
    onSuggestionClick?.(suggestion);
    setShowSuggestionsList(false);
  };

  const filteredSuggestions = suggestions
    .filter((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
    .slice(0, maxSuggestions);

  return (
    <div className={`relative ${className}`} ref={suggestionsRef}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          {showIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: 'var(--color-label-tertiary)' }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          )}
          <input
            role="combobox"
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            className={getInputClasses()}
            aria-label={placeholder}
          />
        </div>
      </form>

      {showSuggestions && showSuggestionsList && filteredSuggestions.length > 0 && (
        <div
          className="surface-elevated absolute top-full left-0 right-0 mt-1 z-50 max-h-60 overflow-y-auto rounded-xl"
          style={{ boxShadow: 'var(--shadow-lg)' }}
        >
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-2.5 text-left text-sm transition-colors duration-150"
              style={{ color: 'var(--color-label-primary)' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-fill-quaternary)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <div className="flex items-center gap-2">
                <svg
                  className="h-3.5 w-3.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{ color: 'var(--color-label-tertiary)' }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <span>{suggestion}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const SearchBar = withSSR(SearchBarComponent);
