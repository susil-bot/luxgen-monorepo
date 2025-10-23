# Form Component

A flexible form wrapper component with support for validation, theming, and accessibility features.

## Features

- **SSR Support**: Server-side rendering with theme injection
- **Form Validation**: Built-in HTML5 validation support
- **Multiple Methods**: Support for GET, POST, PUT, DELETE methods
- **File Upload**: Support for multipart/form-data encoding
- **Accessibility**: Proper form structure and ARIA attributes
- **Theme Integration**: Supports tenant-specific theming
- **Responsive Design**: Adapts to different screen sizes

## Usage

```tsx
import { Form } from '@luxgen/ui';

// Basic usage
<Form onSubmit={handleSubmit}>
  <div className="form-group">
    <label htmlFor="name">Name</label>
    <input type="text" id="name" name="name" />
  </div>
  <div className="form-actions">
    <button type="submit">Submit</button>
  </div>
</Form>

// With validation
<Form onSubmit={handleSubmit} noValidate={false}>
  <div className="form-group">
    <label htmlFor="email">Email *</label>
    <input type="email" id="email" name="email" required />
  </div>
  <div className="form-actions">
    <button type="submit">Submit</button>
  </div>
</Form>

// With file upload
<Form 
  onSubmit={handleSubmit}
  method="POST"
  action="/upload"
  encType="multipart/form-data"
>
  <div className="form-group">
    <label htmlFor="file">Upload File</label>
    <input type="file" id="file" name="file" />
  </div>
  <div className="form-actions">
    <button type="submit">Upload</button>
  </div>
</Form>

// With custom theme
<Form
  tenantTheme={customTheme}
  onSubmit={handleSubmit}
>
  <div className="form-group">
    <label htmlFor="message">Message</label>
    <textarea id="message" name="message" />
  </div>
  <div className="form-actions">
    <button type="submit">Submit</button>
  </div>
</Form>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tenantTheme` | `TenantTheme` | `defaultTheme` | Theme object for styling |
| `onSubmit` | `(e: React.FormEvent) => void` | - | Submit handler |
| `method` | `'GET' | 'POST' | 'PUT' | 'DELETE'` | `'POST'` | HTTP method |
| `action` | `string` | - | Form action URL |
| `encType` | `string` | `'application/x-www-form-urlencoded'` | Form encoding type |
| `noValidate` | `boolean` | `false` | Disable HTML5 validation |
| `className` | `string` | `''` | Additional CSS classes |
| `style` | `CSSProperties` | `{}` | Inline styles |
| `children` | `ReactNode` | - | Form content |

## SSR Usage

```tsx
import { fetchFormSSR } from '@luxgen/ui';

// Server-side rendering
const { html, styles } = await fetchFormSSR(tenantId);
```

## Styling

The component uses CSS custom properties for theming:

```css
.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  font-family: var(--font-primary);
  color: var(--color-text);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}
```

## Form Methods

### GET Method
```tsx
<Form method="GET" action="/search">
  <div className="form-group">
    <label htmlFor="query">Search Query</label>
    <input type="text" id="query" name="query" />
  </div>
  <div className="form-actions">
    <button type="submit">Search</button>
  </div>
</Form>
```

### POST Method
```tsx
<Form method="POST" action="/submit">
  <div className="form-group">
    <label htmlFor="name">Name</label>
    <input type="text" id="name" name="name" />
  </div>
  <div className="form-actions">
    <button type="submit">Submit</button>
  </div>
</Form>
```

### File Upload
```tsx
<Form 
  method="POST"
  action="/upload"
  encType="multipart/form-data"
>
  <div className="form-group">
    <label htmlFor="file">Upload File</label>
    <input type="file" id="file" name="file" />
  </div>
  <div className="form-actions">
    <button type="submit">Upload</button>
  </div>
</Form>
```

## Accessibility

- Proper form structure
- ARIA attributes for form state
- Keyboard navigation support
- Screen reader friendly
- Focus management
- Semantic HTML structure

## Testing

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Form } from '@luxgen/ui';

test('renders with form elements', () => {
  render(
    <Form onSubmit={() => {}}>
      <div className="form-group">
        <label htmlFor="name">Name</label>
        <input type="text" id="name" name="name" />
      </div>
      <div className="form-actions">
        <button type="submit">Submit</button>
      </div>
    </Form>
  );
  
  expect(screen.getByRole('form')).toBeInTheDocument();
  expect(screen.getByText('Name')).toBeInTheDocument();
  expect(screen.getByText('Submit')).toBeInTheDocument();
});

test('calls onSubmit when form is submitted', () => {
  const mockOnSubmit = jest.fn();
  render(
    <Form onSubmit={mockOnSubmit}>
      <button type="submit">Submit</button>
    </Form>
  );
  
  const form = screen.getByRole('form');
  fireEvent.submit(form);
  
  expect(mockOnSubmit).toHaveBeenCalled();
});
```

## Examples

### Basic Form
```tsx
<Form onSubmit={handleSubmit}>
  <div className="form-group">
    <label htmlFor="name">Name</label>
    <input type="text" id="name" name="name" />
  </div>
  <div className="form-group">
    <label htmlFor="email">Email</label>
    <input type="email" id="email" name="email" />
  </div>
  <div className="form-actions">
    <button type="submit">Submit</button>
  </div>
</Form>
```

### Form with Validation
```tsx
<Form onSubmit={handleSubmit} noValidate={false}>
  <div className="form-group">
    <label htmlFor="name">Name *</label>
    <input type="text" id="name" name="name" required />
  </div>
  <div className="form-group">
    <label htmlFor="email">Email *</label>
    <input type="email" id="email" name="email" required />
  </div>
  <div className="form-actions">
    <button type="submit">Submit</button>
    <button type="button">Cancel</button>
  </div>
</Form>
```

### Form with File Upload
```tsx
<Form 
  onSubmit={handleSubmit}
  method="POST"
  action="/upload"
  encType="multipart/form-data"
>
  <div className="form-group">
    <label htmlFor="file">Upload File</label>
    <input type="file" id="file" name="file" />
  </div>
  <div className="form-actions">
    <button type="submit">Upload</button>
  </div>
</Form>
```

### Form with Custom Theme
```tsx
<Form
  tenantTheme={customTheme}
  onSubmit={handleSubmit}
>
  <div className="form-group">
    <label htmlFor="message">Message</label>
    <textarea id="message" name="message" />
  </div>
  <div className="form-actions">
    <button type="submit">Submit</button>
  </div>
</Form>
```
