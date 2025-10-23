# InputWithLabel Component

A combined input and label component for form fields with validation, theming, and accessibility features.

## Features

- **SSR Support**: Server-side rendering with theme injection
- **Validation**: Built-in error handling and validation states
- **Accessibility**: Proper label association and ARIA attributes
- **Theme Integration**: Supports tenant-specific theming
- **Multiple Types**: Support for text, email, password, number, tel, url, search
- **Responsive Design**: Adapts to different screen sizes
- **Multiple Sizes**: Small, medium, and large input sizes

## Usage

```tsx
import { InputWithLabel } from '@luxgen/ui';

// Basic usage
<InputWithLabel
  label="Name"
  value={name}
  onChange={setName}
  placeholder="Enter your name"
/>

// With validation
<InputWithLabel
  label="Email Address"
  type="email"
  value={email}
  onChange={setEmail}
  placeholder="Enter your email"
  required
  error={errors.email}
/>

// With helper text
<InputWithLabel
  label="Password"
  type="password"
  value={password}
  onChange={setPassword}
  placeholder="Enter your password"
  helperText="Must be at least 8 characters"
/>

// Different sizes
<InputWithLabel
  label="Small Input"
  value={value}
  onChange={setValue}
  size="sm"
/>

<InputWithLabel
  label="Large Input"
  value={value}
  onChange={setValue}
  size="lg"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tenantTheme` | `TenantTheme` | `defaultTheme` | Theme object for styling |
| `label` | `string` | - | Label text |
| `type` | `'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'` | `'text'` | Input type |
| `value` | `string` | - | Current value |
| `onChange` | `(value: string) => void` | - | Change handler |
| `placeholder` | `string` | - | Placeholder text |
| `disabled` | `boolean` | `false` | Disabled state |
| `required` | `boolean` | `false` | Required field |
| `size` | `'sm' | 'md' | 'lg'` | `'md'` | Input size |
| `helperText` | `string` | - | Helper text |
| `error` | `string` | - | Error message |
| `className` | `string` | `''` | Additional CSS classes |
| `style` | `CSSProperties` | `{}` | Inline styles |

## SSR Usage

```tsx
import { fetchInputWithLabelSSR } from '@luxgen/ui';

// Server-side rendering
const { html, styles } = await fetchInputWithLabelSSR(tenantId);
```

## Styling

The component uses CSS custom properties for theming:

```css
.input-with-label-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  font-family: var(--font-primary);
  font-size: 0.875rem;
  background-color: var(--color-background);
  color: var(--color-text);
  transition: border-color 0.2s ease;
}

.input-with-label-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input-with-label-input.error {
  border-color: var(--color-error);
}
```

## Input Types

- **text**: Standard text input
- **email**: Email address input with validation
- **password**: Password input with hidden text
- **number**: Numeric input
- **tel**: Telephone number input
- **url**: URL input with validation
- **search**: Search input

## Sizes

- **Small**: Compact input for tight spaces
- **Medium**: Default size for most use cases
- **Large**: Prominent input for important fields

## States

- **Default**: Normal state with border
- **Error**: Red border and error message
- **Disabled**: Grayed out and non-interactive
- **Required**: Shows required indicator

## Accessibility

- Proper label association
- ARIA attributes for validation states
- Keyboard navigation support
- Screen reader friendly
- Focus management
- Semantic HTML structure

## Testing

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { InputWithLabel } from '@luxgen/ui';

test('renders with label and input', () => {
  render(
    <InputWithLabel
      label="Test Input"
      value=""
      onChange={() => {}}
    />
  );
  
  expect(screen.getByText('Test Input')).toBeInTheDocument();
  expect(screen.getByRole('textbox')).toBeInTheDocument();
});

test('calls onChange when value changes', () => {
  const mockOnChange = jest.fn();
  render(
    <InputWithLabel
      label="Test Input"
      value=""
      onChange={mockOnChange}
    />
  );
  
  const input = screen.getByRole('textbox');
  fireEvent.change(input, { target: { value: 'New value' } });
  
  expect(mockOnChange).toHaveBeenCalledWith('New value');
});

test('renders with different types', () => {
  render(
    <InputWithLabel
      label="Email"
      type="email"
      value=""
      onChange={() => {}}
    />
  );
  
  const input = screen.getByRole('textbox');
  expect(input).toHaveAttribute('type', 'email');
});
```

## Examples

### Basic Input
```tsx
<InputWithLabel
  label="Name"
  value={name}
  onChange={setName}
  placeholder="Enter your name"
/>
```

### Email Input with Validation
```tsx
<InputWithLabel
  label="Email Address"
  type="email"
  value={email}
  onChange={setEmail}
  placeholder="Enter your email"
  required
  error={errors.email}
  helperText="We'll never share your email"
/>
```

### Password Input
```tsx
<InputWithLabel
  label="Password"
  type="password"
  value={password}
  onChange={setPassword}
  placeholder="Enter your password"
  required
  helperText="Must be at least 8 characters"
/>
```

### Different Sizes
```tsx
<div>
  <InputWithLabel
    label="Small Input"
    value={value}
    onChange={setValue}
    size="sm"
  />
  <InputWithLabel
    label="Medium Input"
    value={value}
    onChange={setValue}
    size="md"
  />
  <InputWithLabel
    label="Large Input"
    value={value}
    onChange={setValue}
    size="lg"
  />
</div>
```

### Disabled Input
```tsx
<InputWithLabel
  label="Disabled Input"
  value="Cannot be edited"
  onChange={() => {}}
  disabled
/>
```

### Input with Custom Theme
```tsx
<InputWithLabel
  tenantTheme={customTheme}
  label="Custom Themed Input"
  value={value}
  onChange={setValue}
/>
```
