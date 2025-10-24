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

  // Update internal state when value prop changes
  useEffect(() => {
    setSearchQuery(value);
  }, [value]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    onChange?.(newValue);
    setShowSuggestionsList(showSuggestions && newValue.length > 0);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
    setShowSuggestionsList(false);
  };

  // Handle input focus
  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
    if (showSuggestions && searchQuery.length > 0) {
      setShowSuggestionsList(true);
    }
  };

  // Handle input blur
  const handleBlur = (e: React.FocusEvent) => {
    // Delay blur to allow clicking on suggestions
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(document.activeElement)) {
        setIsFocused(false);
        setShowSuggestionsList(false);
        onBlur?.();
      }
    }, 150);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    onChange?.(suggestion);
    onSuggestionClick?.(suggestion);
    setShowSuggestionsList(false);
    inputRef.current?.focus();
  };

  // Handle key navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestionsList(false);
      inputRef.current?.blur();
    }
  };

  // Get variant styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'minimal':
        return 'bg-transparent border-0 focus:ring-0 focus:outline-none';
      case 'outlined':
        return 'bg-white border-2 border-gray-300 focus:border-blue-500 focus:ring-0';
      case 'default':
      default:
        return 'bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20';
    }
  };

  // Get size styles
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-2 text-sm';
      case 'lg':
        return 'px-4 py-3 text-lg';
      case 'md':
      default:
        return 'px-4 py-2 text-base';
    }
  };

  // Filter suggestions based on search query
  const filteredSuggestions = suggestions
    .filter(suggestion => 
      suggestion.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(0, maxSuggestions);

  return (
    <div className={`relative ${className}`} {...props}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          {showIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg 
                className="h-5 w-5 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
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
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            className={`
              w-full rounded-lg transition-all duration-200
              ${getVariantStyles()}
              ${getSizeStyles()}
              ${showIcon ? 'pl-10' : 'pl-4'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text'}
              focus:outline-none
            `}
          />
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestionsList && filteredSuggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors duration-150"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const SearchBar = withSSR(SearchBarComponent);
