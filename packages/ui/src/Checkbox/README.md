# Checkbox Component

A customizable checkbox component with support for validation, theming, and accessibility features.

## Features

- **SSR Support**: Server-side rendering with theme injection
- **Validation**: Built-in error handling and validation states
- **Accessibility**: Proper labels, ARIA attributes, and keyboard navigation
- **Theme Integration**: Supports tenant-specific theming
- **Indeterminate State**: Support for indeterminate checkbox state
- **Responsive Design**: Adapts to different screen sizes
- **Custom Styling**: Flexible styling options

## Usage

```tsx
import { Checkbox } from '@luxgen/ui';

// Basic usage
<Checkbox
  label="Accept terms and conditions"
  checked={isChecked}
  onChange={setIsChecked}
/>

// With validation
<Checkbox
  label="I agree to the terms"
  checked={agreed}
  onChange={setAgreed}
  required
  error={errors.agreement}
/>

// With helper text
<Checkbox
  label="Subscribe to newsletter"
  checked={subscribed}
  onChange={setSubscribed}
  helperText="Receive updates about new features"
/>

// Indeterminate state
<Checkbox
  label="Select all items"
  checked={allSelected}
  onChange={setAllSelected}
  indeterminate={someSelected && !allSelected}
/>

// Disabled state
<Checkbox
  label="Disabled checkbox"
  checked={false}
  onChange={() => {}}
  disabled
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
| `indeterminate` | `boolean` | `false` | Indeterminate state |
| `helperText` | `string` | - | Helper text |
| `error` | `string` | - | Error message |
| `className` | `string` | `''` | Additional CSS classes |
| `style` | `CSSProperties` | `{}` | Inline styles |

## SSR Usage

```tsx
import { fetchCheckboxSSR } from '@luxgen/ui';

// Server-side rendering
const { html, styles } = await fetchCheckboxSSR(tenantId);
```

## Styling

The component uses CSS custom properties for theming:

```css
.checkbox-custom {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  background-color: var(--color-background);
  transition: all 0.2s ease;
}

.checkbox-input:checked + .checkbox-custom {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}

.checkbox-custom.error {
  border-color: var(--color-error);
}
```

## States

- **Unchecked**: Default state with border
- **Checked**: Filled with primary color and checkmark
- **Indeterminate**: Filled with primary color and horizontal line
- **Disabled**: Grayed out and non-interactive
- **Error**: Red border and error message

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
import { Checkbox } from '@luxgen/ui';

test('renders with label', () => {
  render(
    <Checkbox
      label="Test checkbox"
      checked={false}
      onChange={() => {}}
    />
  );
  
  expect(screen.getByText('Test checkbox')).toBeInTheDocument();
  expect(screen.getByRole('checkbox')).toBeInTheDocument();
});

test('calls onChange when clicked', () => {
  const mockOnChange = jest.fn();
  render(
    <Checkbox
      label="Test checkbox"
      checked={false}
      onChange={mockOnChange}
    />
  );
  
  const checkbox = screen.getByRole('checkbox');
  fireEvent.click(checkbox);
  
  expect(mockOnChange).toHaveBeenCalledWith(true);
});

test('renders as indeterminate', () => {
  render(
    <Checkbox
      label="Test checkbox"
      checked={false}
      onChange={() => {}}
      indeterminate={true}
    />
  );
  
  const checkbox = screen.getByRole('checkbox');
  expect(checkbox).toHaveProperty('indeterminate', true);
});
```

## Examples

### Basic Checkbox
```tsx
<Checkbox
  label="I agree to the terms and conditions"
  checked={agreed}
  onChange={setAgreed}
/>
```

### Checkbox with Validation
```tsx
<Checkbox
  label="I have read the privacy policy"
  checked={privacyAccepted}
  onChange={setPrivacyAccepted}
  required
  error={errors.privacy}
  helperText="You must accept the privacy policy to continue"
/>
```

### Indeterminate Checkbox
```tsx
<Checkbox
  label="Select all items"
  checked={allSelected}
  onChange={setAllSelected}
  indeterminate={someSelected && !allSelected}
/>
```

### Checkbox Group
```tsx
<div>
  <Checkbox
    label="Select all"
    checked={allSelected}
    onChange={setAllSelected}
    indeterminate={someSelected && !allSelected}
  />
  <Checkbox
    label="Option 1"
    checked={option1}
    onChange={setOption1}
  />
  <Checkbox
    label="Option 2"
    checked={option2}
    onChange={setOption2}
  />
</div>
```

### Disabled Checkbox
```tsx
<Checkbox
  label="This option is not available"
  checked={false}
  onChange={() => {}}
  disabled
/>
```

### Checkbox with Custom Theme
```tsx
<Checkbox
  tenantTheme={customTheme}
  label="Custom themed checkbox"
  checked={checked}
  onChange={setChecked}
/>
```
