# Select Component

A flexible dropdown select component with support for single and multi-selection, search, and theming.

## Features

- **SSR Support**: Server-side rendering with theme injection
- **Single & Multi Selection**: Support for both single and multiple selection modes
- **Search Functionality**: Optional searchable dropdown
- **Clearable**: Optional clear button for selected values
- **Validation**: Built-in error handling and validation states
- **Accessibility**: Proper labels, ARIA attributes, and keyboard navigation
- **Theme Integration**: Supports tenant-specific theming
- **Responsive Design**: Adapts to different screen sizes

## Usage

```tsx
import { Select } from '@luxgen/ui';

// Basic usage
<Select
  options={[
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ]}
  placeholder="Select an option..."
/>

// With label and validation
<Select
  label="Choose Option"
  options={options}
  placeholder="Select an option..."
  required
  error="This field is required"
/>

// Multi-select
<Select
  label="Choose Options"
  options={options}
  placeholder="Select multiple options..."
  multi
  value={selectedValues}
  onChange={setSelectedValues}
/>

// Searchable
<Select
  label="Choose Fruit"
  options={fruitOptions}
  placeholder="Search and select..."
  searchable
/>

// With helper text
<Select
  label="Choose Option"
  options={options}
  placeholder="Select an option..."
  helperText="Please select an option from the list"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tenantTheme` | `TenantTheme` | `defaultTheme` | Theme object for styling |
| `options` | `SelectOption[]` | `[]` | Array of select options |
| `value` | `string \| string[]` | - | Current value(s) |
| `onChange` | `(value: string \| string[]) => void` | - | Change handler |
| `placeholder` | `string` | `'Select an option...'` | Placeholder text |
| `disabled` | `boolean` | `false` | Disabled state |
| `required` | `boolean` | `false` | Required field |
| `multi` | `boolean` | `false` | Multi-selection mode |
| `searchable` | `boolean` | `false` | Searchable dropdown |
| `clearable` | `boolean` | `false` | Clear button for selected values |
| `label` | `string` | - | Label text |
| `helperText` | `string` | - | Helper text |
| `error` | `string` | - | Error message |
| `className` | `string` | `''` | Additional CSS classes |
| `style` | `CSSProperties` | `{}` | Inline styles |

## SelectOption Interface

```tsx
interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}
```

## SSR Usage

```tsx
import { fetchSelectSSR } from '@luxgen/ui';

// Server-side rendering
const { html, styles } = await fetchSelectSSR(tenantId);
```

## Styling

The component uses CSS custom properties for theming:

```css
.select-trigger {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  font-family: var(--font-primary);
  font-size: 0.875rem;
  background-color: var(--color-background);
  color: var(--color-text);
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.select-trigger:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.select-trigger.error {
  border-color: var(--color-error);
}
```

## Selection Modes

### Single Selection
```tsx
<Select
  options={options}
  value={selectedValue}
  onChange={setSelectedValue}
  placeholder="Select one option..."
/>
```

### Multi Selection
```tsx
<Select
  options={options}
  value={selectedValues}
  onChange={setSelectedValues}
  multi
  placeholder="Select multiple options..."
/>
```

### Searchable
```tsx
<Select
  options={options}
  searchable
  placeholder="Search and select..."
/>
```

## Accessibility

- Proper label association
- ARIA attributes for dropdown state
- Keyboard navigation support
- Screen reader friendly
- Focus management
- Escape key to close dropdown

## Testing

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Select } from '@luxgen/ui';

test('renders with options', () => {
  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
  ];
  
  render(<Select options={options} />);
  
  expect(screen.getByText('Select an option...')).toBeInTheDocument();
});

test('opens dropdown when clicked', () => {
  const options = [
    { value: 'option1', label: 'Option 1' },
  ];
  
  render(<Select options={options} />);
  
  const selectTrigger = screen.getByText('Select an option...');
  fireEvent.click(selectTrigger);
  
  expect(screen.getByText('Option 1')).toBeInTheDocument();
});

test('calls onChange when option is selected', () => {
  const mockOnChange = jest.fn();
  const options = [
    { value: 'option1', label: 'Option 1' },
  ];
  
  render(<Select options={options} onChange={mockOnChange} />);
  
  const selectTrigger = screen.getByText('Select an option...');
  fireEvent.click(selectTrigger);
  
  const option1 = screen.getByText('Option 1');
  fireEvent.click(option1);
  
  expect(mockOnChange).toHaveBeenCalledWith('option1');
});
```

## Examples

### Basic Select
```tsx
<Select
  options={[
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry' },
  ]}
  placeholder="Choose a fruit..."
/>
```

### Multi-Select with Search
```tsx
<Select
  options={fruitOptions}
  value={selectedFruits}
  onChange={setSelectedFruits}
  multi
  searchable
  placeholder="Search and select fruits..."
/>
```

### Select with Validation
```tsx
<Select
  label="Country"
  options={countryOptions}
  value={selectedCountry}
  onChange={setSelectedCountry}
  required
  error={errors.country}
  helperText="Please select your country"
/>
```

### Disabled Select
```tsx
<Select
  options={options}
  value="option1"
  disabled
  placeholder="This select is disabled"
/>
```

### Select with Custom Theme
```tsx
<Select
  tenantTheme={customTheme}
  options={options}
  placeholder="Custom themed select..."
/>
```
