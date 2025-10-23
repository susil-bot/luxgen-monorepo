# RadioGroup Component

A flexible radio group component for single selection with support for validation, theming, and accessibility features.

## Features

- **SSR Support**: Server-side rendering with theme injection
- **Single Selection**: Only one option can be selected at a time
- **Validation**: Built-in error handling and validation states
- **Accessibility**: Proper labels, ARIA attributes, and keyboard navigation
- **Theme Integration**: Supports tenant-specific theming
- **Orientation**: Support for horizontal and vertical layouts
- **Responsive Design**: Adapts to different screen sizes

## Usage

```tsx
import { RadioGroup } from '@luxgen/ui';

// Basic usage
<RadioGroup
  name="preference"
  options={[
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ]}
  value={selectedValue}
  onChange={setSelectedValue}
/>

// With label and validation
<RadioGroup
  name="preference"
  options={options}
  value={selectedValue}
  onChange={setSelectedValue}
  label="Choose your preference"
  required
  error={errors.preference}
/>

// Horizontal layout
<RadioGroup
  name="preference"
  options={options}
  value={selectedValue}
  onChange={setSelectedValue}
  orientation="horizontal"
/>

// With helper text
<RadioGroup
  name="preference"
  options={options}
  value={selectedValue}
  onChange={setSelectedValue}
  label="Choose your preference"
  helperText="Please select one option from the list"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tenantTheme` | `TenantTheme` | `defaultTheme` | Theme object for styling |
| `options` | `RadioOption[]` | `[]` | Array of radio options |
| `name` | `string` | - | Name attribute for radio inputs |
| `value` | `string | number` | - | Current selected value |
| `onChange` | `(value: string | number) => void` | - | Change handler |
| `disabled` | `boolean` | `false` | Disabled state |
| `required` | `boolean` | `false` | Required field |
| `orientation` | `'horizontal' | 'vertical'` | `'vertical'` | Layout orientation |
| `label` | `string` | - | Label text |
| `helperText` | `string` | - | Helper text |
| `error` | `string` | - | Error message |
| `className` | `string` | `''` | Additional CSS classes |
| `style` | `CSSProperties` | `{}` | Inline styles |

## RadioOption Interface

```tsx
interface RadioOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}
```

## SSR Usage

```tsx
import { fetchRadioGroupSSR } from '@luxgen/ui';

// Server-side rendering
const { html, styles } = await fetchRadioGroupSSR(tenantId);
```

## Styling

The component uses CSS custom properties for theming:

```css
.radio-custom {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid var(--color-border);
  border-radius: 50%;
  background-color: var(--color-background);
  transition: all 0.2s ease;
}

.radio-input:checked + .radio-custom {
  border-color: var(--color-primary);
}

.radio-input:checked + .radio-custom .radio-dot {
  display: block;
}

.radio-custom.error {
  border-color: var(--color-error);
}
```

## Orientation

### Vertical (Default)
```tsx
<RadioGroup
  name="preference"
  options={options}
  value={selectedValue}
  onChange={setSelectedValue}
  orientation="vertical"
/>
```

### Horizontal
```tsx
<RadioGroup
  name="preference"
  options={options}
  value={selectedValue}
  onChange={setSelectedValue}
  orientation="horizontal"
/>
```

## Accessibility

- Proper label association
- ARIA attributes for group state
- Keyboard navigation support
- Screen reader friendly
- Focus management
- Semantic HTML structure

## Testing

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { RadioGroup } from '@luxgen/ui';

test('renders with options', () => {
  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
  ];
  
  render(
    <RadioGroup
      name="test"
      options={options}
      value="option1"
      onChange={() => {}}
    />
  );
  
  expect(screen.getByText('Option 1')).toBeInTheDocument();
  expect(screen.getByText('Option 2')).toBeInTheDocument();
});

test('calls onChange when option is selected', () => {
  const mockOnChange = jest.fn();
  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
  ];
  
  render(
    <RadioGroup
      name="test"
      options={options}
      value="option1"
      onChange={mockOnChange}
    />
  );
  
  const radio2 = screen.getByDisplayValue('option2');
  fireEvent.click(radio2);
  
  expect(mockOnChange).toHaveBeenCalledWith('option2');
});
```

## Examples

### Basic Radio Group
```tsx
<RadioGroup
  name="size"
  options={[
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' },
  ]}
  value={selectedSize}
  onChange={setSelectedSize}
/>
```

### Radio Group with Validation
```tsx
<RadioGroup
  name="payment"
  options={paymentOptions}
  value={selectedPayment}
  onChange={setSelectedPayment}
  label="Payment Method"
  required
  error={errors.payment}
  helperText="Choose your preferred payment method"
/>
```

### Horizontal Radio Group
```tsx
<RadioGroup
  name="theme"
  options={themeOptions}
  value={selectedTheme}
  onChange={setSelectedTheme}
  orientation="horizontal"
  label="Choose Theme"
/>
```

### Disabled Radio Group
```tsx
<RadioGroup
  name="preference"
  options={options}
  value={selectedValue}
  onChange={setSelectedValue}
  disabled
  label="This option is not available"
/>
```

### Radio Group with Custom Theme
```tsx
<RadioGroup
  tenantTheme={customTheme}
  name="preference"
  options={options}
  value={selectedValue}
  onChange={setSelectedValue}
  label="Custom Themed Radio Group"
/>
```
