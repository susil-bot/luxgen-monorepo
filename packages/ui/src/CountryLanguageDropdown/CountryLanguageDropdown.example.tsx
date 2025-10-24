import React, { useState } from 'react';
import { CountryLanguageDropdown, Country, Language } from './CountryLanguageDropdown';

export const CountryLanguageDropdownExample: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState<Country>({
    code: 'GB',
    name: 'United Kingdom',
    flag: '🇬🇧'
  });
  
  const [selectedLanguage, setSelectedLanguage] = useState<Language>({
    code: 'en',
    name: 'English',
    nativeName: 'English'
  });

  const handleCountryChange = (country: Country) => {
    setSelectedCountry(country);
    console.log('Selected country:', country);
  };

  const handleLanguageChange = (language: Language) => {
    setSelectedLanguage(language);
    console.log('Selected language:', language);
  };

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold text-gray-900">Country & Language Dropdown Examples</h2>
      
      {/* Default Dropdown */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Default Dropdown</h3>
        <CountryLanguageDropdown
          selectedCountry={selectedCountry}
          selectedLanguage={selectedLanguage}
          onCountryChange={handleCountryChange}
          onLanguageChange={handleLanguageChange}
        />
      </div>

      {/* Minimal Variant */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Minimal Variant</h3>
        <CountryLanguageDropdown
          variant="minimal"
          selectedCountry={selectedCountry}
          selectedLanguage={selectedLanguage}
          onCountryChange={handleCountryChange}
          onLanguageChange={handleLanguageChange}
        />
      </div>

      {/* Compact Variant */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Compact Variant</h3>
        <CountryLanguageDropdown
          variant="compact"
          selectedCountry={selectedCountry}
          selectedLanguage={selectedLanguage}
          onCountryChange={handleCountryChange}
          onLanguageChange={handleLanguageChange}
        />
      </div>

      {/* With Native Names */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">With Native Names</h3>
        <CountryLanguageDropdown
          showNativeNames={true}
          selectedCountry={selectedCountry}
          selectedLanguage={selectedLanguage}
          onCountryChange={handleCountryChange}
          onLanguageChange={handleLanguageChange}
        />
      </div>

      {/* Without Flags */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Without Flags</h3>
        <CountryLanguageDropdown
          showFlags={false}
          selectedCountry={selectedCountry}
          selectedLanguage={selectedLanguage}
          onCountryChange={handleCountryChange}
          onLanguageChange={handleLanguageChange}
        />
      </div>

      {/* Disabled */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Disabled</h3>
        <CountryLanguageDropdown
          disabled={true}
          selectedCountry={selectedCountry}
          selectedLanguage={selectedLanguage}
          onCountryChange={handleCountryChange}
          onLanguageChange={handleLanguageChange}
        />
      </div>

      {/* Current Selection Display */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Current Selection</h3>
        <div className="space-y-2">
          <div>
            <span className="font-medium">Country: </span>
            <span className="text-gray-600">
              {selectedCountry.flag} {selectedCountry.name} ({selectedCountry.code})
            </span>
          </div>
          <div>
            <span className="font-medium">Language: </span>
            <span className="text-gray-600">
              {selectedLanguage.name} ({selectedLanguage.code})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
