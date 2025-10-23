# TextArea Component

A multi-line text input component with validation, theming, and accessibility features.

## Features

- **SSR Support**: Server-side rendering with theme injection
- **Validation**: Built-in error handling and validation states
- **Accessibility**: Proper labels, ARIA attributes, and keyboard navigation
- **Theme Integration**: Supports tenant-specific theming
- **Responsive Design**: Adapts to different screen sizes
- **Character Limits**: Support for min/max length validation
- **Helper Text**: Optional helper text and error messages

## Usage

```tsx
import { TextArea } from '@luxgen/ui';

// Basic usage
<TextArea
  placeholder="Enter your message..."
  rows={4}
/>

// With label and validation
<TextArea
  label="Message"
  placeholder="Enter your message..."
  rows={4}
  required
  error="This field is required"
/>

// With helper text
<TextArea
  label="Description"
  placeholder="Enter description..."
  rows={6}
  helperText="Please provide a detailed description"
/>

// With character limits
<TextArea
  label="Comment"
  placeholder="Enter your comment..."
  rows={4}
  maxLength={500}
  helperText="Maximum 500 characters"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tenantTheme` | `TenantTheme` | `defaultTheme` | Theme object for styling |
| `value` | `string` | - | Current value |
| `onChange` | `(value: string) => void` | - | Change handler |
| `placeholder` | `string` | - | Placeholder text |
| `rows` | `number` | `4` | Number of visible rows |
| `disabled` | `boolean` | `false` | Disabled state |
| `readOnly` | `boolean` | `false` | Read-only state |
| `maxLength` | `number` | - | Maximum character length |
| `minLength` | `number` | - | Minimum character length |
| `required` | `boolean` | `false` | Required field |
| `label` | `string` | - | Label text |
| `helperText` | `string` | - | Helper text |
| `error` | `string` | - | Error message |
| `className` | `string` | `''` | Additional CSS classes |
| `style` | `CSSProperties` | `{}` | Inline styles |

## SSR Usage

```tsx
import { fetchTextAreaSSR } from '@luxgen/ui';

// Server-side rendering
const { html, styles } = await fetchTextAreaSSR(tenantId);
```

## Styling

The component uses CSS custom properties for theming:

```css
.textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  font-family: var(--font-primary);
  font-size: 0.875rem;
  line-height: 1.5;
  resize: vertical;
  transition: border-color 0.2s ease;
}

.textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.textarea.error {
  border-color: var(--color-error);
}
```

## Validation States

- **Default**: Normal state with border
- **Error**: Red border and error message
- **Disabled**: Grayed out and non-interactive
- **Read-only**: Grayed out but text is selectable

## Accessibility

- Proper label association
- ARIA attributes for validation states
- Keyboard navigation support
- Screen reader friendly
- Focus management

## Testing

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { TextArea } from '@luxgen/ui';

test('renders with label and validation', () => {
  render(
    <TextArea
      label="Message"
      placeholder="Enter message..."
      required
      error="This field is required"
    />
  );
  
  expect(screen.getByText('Message')).toBeInTheDocument();
  expect(screen.getByText('*')).toBeInTheDocument();
  expect(screen.getByText('This field is required')).toBeInTheDocument();
});

test('calls onChange when value changes', () => {
  const mockOnChange = jest.fn();
  render(
    <TextArea
      placeholder="Enter message..."
      onChange={mockOnChange}
    />
  );
  
  const textarea = screen.getByRole('textbox');
  fireEvent.change(textarea, { target: { value: 'New value' } });
  
  expect(mockOnChange).toHaveBeenCalledWith('New value');
});
```

## Examples

### Basic TextArea
```tsx
<TextArea
  placeholder="Enter your message..."
  rows={4}
/>
```

### TextArea with Validation
```tsx
<TextArea
  label="Feedback"
  placeholder="Enter your feedback..."
  rows={6}
  required
  error={errors.feedback}
  helperText="Please provide detailed feedback"
/>
```

### TextArea with Character Limit
```tsx
<TextArea
  label="Comment"
  placeholder="Enter your comment..."
  rows={4}
  maxLength={500}
  helperText="Maximum 500 characters"
  value={comment}
  onChange={setComment}
/>
```

### Disabled TextArea
```tsx
<TextArea
  label="Read-only Content"
  value="This content cannot be edited"
  rows={4}
  readOnly
/>
```

### TextArea with Custom Theme
```tsx
<TextArea
  tenantTheme={customTheme}
  label="Message"
  placeholder="Enter your message..."
  rows={4}
/>
```
