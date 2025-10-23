# Switch Component

A toggle switch component for boolean values with support for validation, theming, and accessibility features.

## Features

- **SSR Support**: Server-side rendering with theme injection
- **Validation**: Built-in error handling and validation states
- **Accessibility**: Proper labels, ARIA attributes, and keyboard navigation
- **Theme Integration**: Supports tenant-specific theming
- **Multiple Sizes**: Small, medium, and large switch sizes
- **Responsive Design**: Adapts to different screen sizes
- **Smooth Animations**: CSS transitions for state changes

## Usage

```tsx
import { Switch } from '@luxgen/ui';

// Basic usage
<Switch
  label="Enable notifications"
  checked={notificationsEnabled}
  onChange={setNotificationsEnabled}
/>

// With validation
<Switch
  label="I agree to the terms"
  checked={agreed}
  onChange={setAgreed}
  required
  error={errors.agreement}
/>

// With helper text
<Switch
  label="Enable dark mode"
  checked={darkMode}
  onChange={setDarkMode}
  helperText="Toggle between light and dark themes"
/>

// Different sizes
<Switch
  label="Small Switch"
  checked={value}
  onChange={setValue}
  size="sm"
/>

<Switch
  label="Large Switch"
  checked={value}
  onChange={setValue}
  size="lg"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tenantTheme` | `TenantTheme` | `defaultTheme` | Theme object for styling |
| `checked` | `boolean` | - | Checked state |
| `onChange` | `(checked: boolean) => void` | - | Change handler |
| `label` | `string` | - | Label text |
| `disabled` | `boolean` | `false` | Disabled state |
| `required` | `boolean` | `false` | Required field |
| `size` | `'sm' | 'md' | 'lg'` | `'md'` | Switch size |
| `helperText` | `string` | - | Helper text |
| `error` | `string` | - | Error message |
| `className` | `string` | `''` | Additional CSS classes |
| `style` | `CSSProperties` | `{}` | Inline styles |

## SSR Usage

```tsx
import { fetchSwitchSSR } from '@luxgen/ui';

// Server-side rendering
const { html, styles } = await fetchSwitchSSR(tenantId);
```

## Styling

The component uses CSS custom properties for theming:

```css
.switch-custom {
  background-color: var(--color-border);
  border-radius: 9999px;
  transition: all 0.2s ease;
}

.switch-input:checked + .switch-custom {
  background-color: var(--color-primary);
}

.switch-input:checked + .switch-custom .switch-thumb {
  transform: translateX(100%);
}

.switch-custom.error {
  background-color: var(--color-error);
}
```

## Sizes

- **Small**: Compact switch for tight spaces
- **Medium**: Default size for most use cases
- **Large**: Prominent switch for important toggles

## States

- **Unchecked**: Default state with gray background
- **Checked**: Active state with primary color background
- **Disabled**: Grayed out and non-interactive
- **Error**: Red background and error message

## Accessibility

- Proper label association
- ARIA attributes for state
- Keyboard navigation support
- Screen reader friendly
- Focus management
- Semantic HTML structure

## Testing

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Switch } from '@luxgen/ui';

test('renders with label', () => {
  render(
    <Switch
      label="Test switch"
      checked={false}
      onChange={() => {}}
    />
  );
  
  expect(screen.getByText('Test switch')).toBeInTheDocument();
  expect(screen.getByRole('checkbox')).toBeInTheDocument();
});

test('calls onChange when clicked', () => {
  const mockOnChange = jest.fn();
  render(
    <Switch
      label="Test switch"
      checked={false}
      onChange={mockOnChange}
    />
  );
  
  const switchInput = screen.getByRole('checkbox');
  fireEvent.click(switchInput);
  
  expect(mockOnChange).toHaveBeenCalledWith(true);
});

test('renders with different sizes', () => {
  render(
    <Switch
      label="Small switch"
      checked={false}
      onChange={() => {}}
      size="sm"
    />
  );
  
  const switchCustom = screen.getByText('Small switch').closest('.switch-label')?.querySelector('.switch-custom');
  expect(switchCustom).toHaveClass('sm');
});
```

## Examples

### Basic Switch
```tsx
<Switch
  label="Enable notifications"
  checked={notificationsEnabled}
  onChange={setNotificationsEnabled}
/>
```

### Switch with Validation
```tsx
<Switch
  label="I agree to the terms and conditions"
  checked={agreed}
  onChange={setAgreed}
  required
  error={errors.agreement}
  helperText="You must agree to the terms to continue"
/>
```

### Switch with Different Sizes
```tsx
<div>
  <Switch
    label="Small Switch"
    checked={value}
    onChange={setValue}
    size="sm"
  />
  <Switch
    label="Medium Switch"
    checked={value}
    onChange={setValue}
    size="md"
  />
  <Switch
    label="Large Switch"
    checked={value}
    onChange={setValue}
    size="lg"
  />
</div>
```

### Disabled Switch
```tsx
<Switch
  label="This option is not available"
  checked={false}
  onChange={() => {}}
  disabled
/>
```

### Switch with Custom Theme
```tsx
<Switch
  tenantTheme={customTheme}
  label="Custom themed switch"
  checked={checked}
  onChange={setChecked}
/>
```

### Switch without Label
```tsx
<Switch
  checked={checked}
  onChange={setChecked}
/>
```
