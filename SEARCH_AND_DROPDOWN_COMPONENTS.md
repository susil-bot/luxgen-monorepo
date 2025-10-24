# 🔍 SearchBar & Country/Language Dropdown Components

This document explains how to use the new SearchBar and CountryLanguageDropdown components in the LuxGen UI package.

## 🔍 SearchBar Component

The SearchBar component provides a search input with optional suggestions, icons, and various styling options.

### Basic Usage

```typescript
import { SearchBar } from '@luxgen/ui';

const MyComponent = () => {
  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
  };

  return (
    <SearchBar
      placeholder="Search..."
      onSearch={handleSearch}
    />
  );
};
```

### Advanced Usage with Suggestions

```typescript
import { SearchBar } from '@luxgen/ui';

const MyComponent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const suggestions = [
    'Dashboard',
    'Team Management',
    'Training Programs',
    'User Analytics',
    'Settings'
  ];

  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
  };

  return (
    <SearchBar
      placeholder="Search..."
      value={searchQuery}
      onChange={setSearchQuery}
      onSearch={handleSearch}
      suggestions={suggestions}
      onSuggestionClick={handleSuggestionClick}
      showSuggestions={true}
      maxSuggestions={5}
    />
  );
};
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `placeholder` | `string` | `'Search'` | Placeholder text |
| `onSearch` | `(query: string) => void` | - | Callback when search is submitted |
| `onFocus` | `() => void` | - | Callback when input is focused |
| `onBlur` | `() => void` | - | Callback when input loses focus |
| `className` | `string` | `''` | Additional CSS classes |
| `variant` | `'default' \| 'minimal' \| 'outlined'` | `'default'` | Visual style variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size of the input |
| `showIcon` | `boolean` | `true` | Show search icon |
| `disabled` | `boolean` | `false` | Disable the input |
| `value` | `string` | `''` | Controlled value |
| `onChange` | `(value: string) => void` | - | Callback when value changes |
| `suggestions` | `string[]` | `[]` | List of suggestions |
| `onSuggestionClick` | `(suggestion: string) => void` | - | Callback when suggestion is clicked |
| `showSuggestions` | `boolean` | `true` | Show suggestions dropdown |
| `maxSuggestions` | `number` | `5` | Maximum number of suggestions to show |

### Variants

#### Default
```typescript
<SearchBar variant="default" placeholder="Search..." />
```

#### Minimal
```typescript
<SearchBar variant="minimal" placeholder="Search..." />
```

#### Outlined
```typescript
<SearchBar variant="outlined" placeholder="Search..." />
```

### Sizes

```typescript
<SearchBar size="sm" placeholder="Small search..." />
<SearchBar size="md" placeholder="Medium search..." />
<SearchBar size="lg" placeholder="Large search..." />
```

## 🌍 CountryLanguageDropdown Component

The CountryLanguageDropdown component provides a dropdown for selecting country and language with flags and native names.

### Basic Usage

```typescript
import { CountryLanguageDropdown } from '@luxgen/ui';

const MyComponent = () => {
  const [selectedCountry, setSelectedCountry] = useState({
    code: 'GB',
    name: 'United Kingdom',
    flag: '🇬🇧'
  });
  
  const [selectedLanguage, setSelectedLanguage] = useState({
    code: 'en',
    name: 'English',
    nativeName: 'English'
  });

  const handleCountryChange = (country) => {
    setSelectedCountry(country);
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  return (
    <CountryLanguageDropdown
      selectedCountry={selectedCountry}
      selectedLanguage={selectedLanguage}
      onCountryChange={handleCountryChange}
      onLanguageChange={handleLanguageChange}
    />
  );
};
```

### Advanced Usage

```typescript
import { CountryLanguageDropdown } from '@luxgen/ui';

const MyComponent = () => {
  const customCountries = [
    { code: 'US', name: 'United States', flag: '🇺🇸' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦' },
    // ... more countries
  ];

  const customLanguages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    // ... more languages
  ];

  return (
    <CountryLanguageDropdown
      countries={customCountries}
      languages={customLanguages}
      selectedCountry={selectedCountry}
      selectedLanguage={selectedLanguage}
      onCountryChange={handleCountryChange}
      onLanguageChange={handleLanguageChange}
      showFlags={true}
      showNativeNames={true}
      variant="default"
    />
  );
};
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `countries` | `Country[]` | `defaultCountries` | List of countries |
| `languages` | `Language[]` | `defaultLanguages` | List of languages |
| `selectedCountry` | `Country` | `defaultCountries[1]` | Currently selected country |
| `selectedLanguage` | `Language` | `defaultLanguages[0]` | Currently selected language |
| `onCountryChange` | `(country: Country) => void` | - | Callback when country changes |
| `onLanguageChange` | `(language: Language) => void` | - | Callback when language changes |
| `className` | `string` | `''` | Additional CSS classes |
| `variant` | `'default' \| 'minimal' \| 'compact'` | `'default'` | Visual style variant |
| `showFlags` | `boolean` | `true` | Show country flags |
| `showNativeNames` | `boolean` | `false` | Show native language names |
| `disabled` | `boolean` | `false` | Disable the dropdown |
| `placeholder` | `string` | `'Select country and language'` | Placeholder text |

### Variants

#### Default
```typescript
<CountryLanguageDropdown variant="default" />
```

#### Minimal
```typescript
<CountryLanguageDropdown variant="minimal" />
```

#### Compact
```typescript
<CountryLanguageDropdown variant="compact" />
```

### Data Types

#### Country
```typescript
interface Country {
  code: string;        // Country code (e.g., 'US', 'GB')
  name: string;        // Country name (e.g., 'United States')
  flag: string;        // Flag emoji (e.g., '🇺🇸')
}
```

#### Language
```typescript
interface Language {
  code: string;        // Language code (e.g., 'en', 'es')
  name: string;        // Language name (e.g., 'English')
  nativeName: string;  // Native language name (e.g., 'English', 'Español')
}
```

## 🎨 Styling and Customization

### CSS Custom Properties

Both components use CSS custom properties for theming:

```css
:root {
  --color-primary: #3B82F6;
  --color-secondary: #1E40AF;
  --color-background: #F8FAFC;
  --color-surface: #FFFFFF;
  --color-text: #1F2937;
  --color-border: #E5E7EB;
}
```

### Custom Styling

```typescript
<SearchBar
  className="w-full max-w-md border-2 border-blue-500 rounded-xl"
  placeholder="Custom styled search..."
/>

<CountryLanguageDropdown
  className="w-64 shadow-lg rounded-xl"
  variant="minimal"
/>
```

## 🔧 Integration Examples

### In NavBar Component

```typescript
import { SearchBar, CountryLanguageDropdown } from '@luxgen/ui';

const NavBar = () => {
  return (
    <nav className="flex items-center justify-between p-4 bg-white border-b">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-bold">LuxGen</h1>
        <SearchBar
          placeholder="Search..."
          className="w-64"
          onSearch={(query) => console.log('Search:', query)}
        />
      </div>
      
      <div className="flex items-center space-x-4">
        <CountryLanguageDropdown
          onCountryChange={(country) => console.log('Country:', country)}
          onLanguageChange={(language) => console.log('Language:', language)}
        />
        
        <UserMenu />
      </div>
    </nav>
  );
};
```

### In Dashboard Layout

```typescript
import { AppLayout, SearchBar, CountryLanguageDropdown } from '@luxgen/ui';

const Dashboard = () => {
  return (
    <AppLayout>
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center space-x-4">
          <SearchBar
            placeholder="Search dashboard..."
            suggestions={['Users', 'Reports', 'Settings']}
            className="w-80"
          />
        </div>
        
        <div className="flex items-center space-x-4">
          <CountryLanguageDropdown
            variant="compact"
            showNativeNames={true}
          />
        </div>
      </div>
      
      {/* Dashboard content */}
    </AppLayout>
  );
};
```

## 🚀 Features

### SearchBar Features
- ✅ **Search Icon**: Optional search icon
- ✅ **Suggestions**: Dropdown with search suggestions
- ✅ **Keyboard Navigation**: Arrow keys, Enter, Escape
- ✅ **Multiple Variants**: Default, minimal, outlined
- ✅ **Multiple Sizes**: Small, medium, large
- ✅ **Controlled/Uncontrolled**: Support for both patterns
- ✅ **Accessibility**: Proper ARIA labels and keyboard support

### CountryLanguageDropdown Features
- ✅ **Country Selection**: Choose from 12+ countries with flags
- ✅ **Language Selection**: Choose from 12+ languages
- ✅ **Search Functionality**: Search within countries and languages
- ✅ **Tab Interface**: Switch between country and language tabs
- ✅ **Native Names**: Show native language names
- ✅ **Flag Display**: Country flags for visual identification
- ✅ **Keyboard Navigation**: Full keyboard support
- ✅ **Responsive Design**: Works on all screen sizes

## 🐛 Troubleshooting

### Common Issues

1. **SearchBar not showing suggestions**
   - Ensure `showSuggestions={true}` is set
   - Check that `suggestions` array is not empty
   - Verify `onSuggestionClick` callback is provided

2. **CountryLanguageDropdown not opening**
   - Check if `disabled={true}` is set
   - Ensure proper event handling for click outside

3. **Styling issues**
   - Check CSS custom properties are defined
   - Verify Tailwind CSS is properly configured
   - Use `className` prop for custom styling

### Debug Mode

```typescript
<SearchBar
  onSearch={(query) => console.log('Search query:', query)}
  onFocus={() => console.log('Search focused')}
  onBlur={() => console.log('Search blurred')}
/>

<CountryLanguageDropdown
  onCountryChange={(country) => console.log('Country changed:', country)}
  onLanguageChange={(language) => console.log('Language changed:', language)}
/>
```

These components provide a solid foundation for search and localization functionality in your LuxGen application!
