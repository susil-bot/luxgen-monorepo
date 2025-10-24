import React, { useState } from 'react';
import { SearchBar } from './SearchBar';

export const SearchBarExample: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions] = useState([
    'Dashboard',
    'Team Management',
    'Training Programs',
    'User Analytics',
    'Settings',
    'Reports',
    'Notifications',
    'Calendar',
    'Goals',
    'Progress Tracking'
  ]);

  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
    // Implement search logic here
  };

  const handleSuggestionClick = (suggestion: string) => {
    console.log('Selected suggestion:', suggestion);
    setSearchQuery(suggestion);
  };

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold text-gray-900">SearchBar Examples</h2>
      
      {/* Default SearchBar */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Default SearchBar</h3>
        <SearchBar
          placeholder="Search..."
          onSearch={handleSearch}
          value={searchQuery}
          onChange={setSearchQuery}
          suggestions={suggestions}
          onSuggestionClick={handleSuggestionClick}
          className="w-full max-w-md"
        />
      </div>

      {/* Minimal SearchBar */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Minimal SearchBar</h3>
        <SearchBar
          placeholder="Search..."
          variant="minimal"
          onSearch={handleSearch}
          className="w-full max-w-md"
        />
      </div>

      {/* Outlined SearchBar */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Outlined SearchBar</h3>
        <SearchBar
          placeholder="Search..."
          variant="outlined"
          onSearch={handleSearch}
          className="w-full max-w-md"
        />
      </div>

      {/* Large SearchBar */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Large SearchBar</h3>
        <SearchBar
          placeholder="Search..."
          size="lg"
          onSearch={handleSearch}
          className="w-full max-w-md"
        />
      </div>

      {/* SearchBar without icon */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">SearchBar without icon</h3>
        <SearchBar
          placeholder="Search..."
          showIcon={false}
          onSearch={handleSearch}
          className="w-full max-w-md"
        />
      </div>

      {/* Disabled SearchBar */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Disabled SearchBar</h3>
        <SearchBar
          placeholder="Search..."
          disabled={true}
          className="w-full max-w-md"
        />
      </div>
    </div>
  );
};
