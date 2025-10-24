import React, { useState, useRef, useEffect } from 'react';
import { withSSR } from '../ssr';

export interface Country {
  code: string;
  name: string;
  flag: string;
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

export interface CountryLanguageDropdownProps {
  countries?: Country[];
  languages?: Language[];
  selectedCountry?: Country;
  selectedLanguage?: Language;
  onCountryChange?: (country: Country) => void;
  onLanguageChange?: (language: Language) => void;
  className?: string;
  variant?: 'default' | 'minimal' | 'compact';
  showFlags?: boolean;
  showNativeNames?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

// Default countries and languages
const defaultCountries: Country[] = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
];

const defaultLanguages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
];

const CountryLanguageDropdownComponent: React.FC<CountryLanguageDropdownProps> = ({
  countries = defaultCountries,
  languages = defaultLanguages,
  selectedCountry = defaultCountries[1], // Default to UK
  selectedLanguage = defaultLanguages[0], // Default to English
  onCountryChange,
  onLanguageChange,
  className = '',
  variant = 'default',
  showFlags = true,
  showNativeNames = false,
  disabled = false,
  placeholder = 'Select country and language',
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'country' | 'language'>('country');
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen, activeTab]);

  // Handle country selection
  const handleCountrySelect = (country: Country) => {
    onCountryChange?.(country);
    setIsOpen(false);
    setSearchQuery('');
  };

  // Handle language selection
  const handleLanguageSelect = (language: Language) => {
    onLanguageChange?.(language);
    setIsOpen(false);
    setSearchQuery('');
  };

  // Filter countries and languages based on search query
  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLanguages = languages.filter(language =>
    language.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    language.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    language.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get variant styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'minimal':
        return 'bg-transparent border-0 hover:bg-gray-50';
      case 'compact':
        return 'px-2 py-1 text-sm';
      case 'default':
      default:
        return 'bg-white border border-gray-200 hover:border-gray-300';
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef} {...props}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200
          ${getVariantStyles()}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-sm'}
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20
        `}
      >
        {showFlags && (
          <span className="text-lg">{selectedCountry.flag}</span>
        )}
        <span className="text-sm font-medium text-gray-700">
          {selectedLanguage.name}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {/* Header with Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('country')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                activeTab === 'country'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Country
            </button>
            <button
              onClick={() => setActiveTab('language')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                activeTab === 'language'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Language
            </button>
          </div>

          {/* Search Input */}
          <div className="p-3 border-b border-gray-200">
            <input
              ref={searchRef}
              type="text"
              placeholder={`Search ${activeTab === 'country' ? 'countries' : 'languages'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Content */}
          <div className="max-h-60 overflow-y-auto">
            {activeTab === 'country' ? (
              <div className="py-1">
                {filteredCountries.length > 0 ? (
                  filteredCountries.map((country) => (
                    <button
                      key={country.code}
                      onClick={() => handleCountrySelect(country)}
                      className={`w-full flex items-center space-x-3 px-4 py-2 text-sm text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors duration-150 ${
                        selectedCountry.code === country.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                      }`}
                    >
                      {showFlags && (
                        <span className="text-lg">{country.flag}</span>
                      )}
                      <div className="flex-1">
                        <div className="font-medium">{country.name}</div>
                        <div className="text-xs text-gray-500">{country.code}</div>
                      </div>
                      {selectedCountry.code === country.code && (
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-gray-500 text-sm">
                    No countries found
                  </div>
                )}
              </div>
            ) : (
              <div className="py-1">
                {filteredLanguages.length > 0 ? (
                  filteredLanguages.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => handleLanguageSelect(language)}
                      className={`w-full flex items-center space-x-3 px-4 py-2 text-sm text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors duration-150 ${
                        selectedLanguage.code === language.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="font-medium">{language.name}</div>
                        {showNativeNames && (
                          <div className="text-xs text-gray-500">{language.nativeName}</div>
                        )}
                      </div>
                      {selectedLanguage.code === language.code && (
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-gray-500 text-sm">
                    No languages found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const CountryLanguageDropdown = withSSR(CountryLanguageDropdownComponent);
