# Accordion Component

A collapsible content component that allows users to expand and collapse sections of content. Perfect for FAQs, documentation, and organizing information in a compact format.

## Features

- **SSR Support**: Server-side rendering with theme injection
- **Multiple Variants**: Default, bordered, filled, and minimal styles
- **Flexible Sizing**: Small, medium, and large sizes
- **Icon Support**: Configurable icon position and visibility
- **Multiple Selection**: Allow multiple items to be open simultaneously
- **Keyboard Navigation**: Full keyboard accessibility support
- **Theme Integration**: Supports tenant-specific theming
- **Responsive Design**: Adapts to different screen sizes

## Usage

```tsx
import { Accordion } from '@luxgen/ui';

// Basic usage
<Accordion
  items={[
    {
      id: '1',
      title: 'Section 1',
      content: <div>Content for section 1</div>,
    },
    {
      id: '2',
      title: 'Section 2',
      content: <div>Content for section 2</div>,
    },
  ]}
/>

// With multiple items open
<Accordion
  items={items}
  allowMultiple
/>

// With different variants
<Accordion
  items={items}
  variant="bordered"
/>

// With custom sizing
<Accordion
  items={items}
  size="large"
/>

// With callbacks
<Accordion
  items={items}
  onToggle={(itemId, isOpen) => console.log('Toggle:', itemId, isOpen)}
  onItemClick={(item, index) => console.log('Item clicked:', item, index)}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tenantTheme` | `TenantTheme` | `defaultTheme` | Theme object for styling |
| `items` | `AccordionItem[]` | - | Array of accordion items |
| `allowMultiple` | `boolean` | `false` | Allow multiple items to be open |
| `allowNone` | `boolean` | `true` | Allow all items to be closed |
| `variant` | `'default' | 'bordered' | 'filled' | 'minimal'` | `'default'` | Accordion variant |
| `size` | `'small' | 'medium' | 'large'` | `'medium'` | Accordion size |
| `iconPosition` | `'left' | 'right'` | `'right'` | Icon position |
| `showIcon` | `boolean` | `true` | Show expand/collapse icon |
| `onToggle` | `(itemId: string, isOpen: boolean) => void` | - | Callback when item is toggled |
| `onItemClick` | `(item: AccordionItem, index: number) => void` | - | Callback when item is clicked |
| `className` | `string` | `''` | Additional CSS classes |
| `style` | `CSSProperties` | `{}` | Inline styles |

## AccordionItem Interface

```tsx
interface AccordionItem {
  id: string;
  title: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
  defaultOpen?: boolean;
}
```

## SSR Usage

```tsx
import { fetchAccordionSSR } from '@luxgen/ui';

// Server-side rendering
const { html, styles } = await fetchAccordionSSR(tenantId);
```

## Styling

The component uses CSS custom properties for theming:

```css
.accordion {
  font-family: var(--font-primary);
  color: var(--color-text);
}

.accordion-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: none;
  border: none;
  cursor: pointer;
  padding: 1rem 1.25rem;
  text-align: left;
  font-family: var(--font-primary);
  font-size: 1rem;
  color: var(--color-text);
  transition: all 0.2s ease;
}

.accordion-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
  background-color: var(--color-background);
}
```

## Variants

- **default**: Standard border and rounded corners
- **bordered**: Thicker border with more rounded corners
- **filled**: Background color with subtle border
- **minimal**: No border or background

## Sizes

- **small**: Compact size (0.875rem font, 0.75rem padding)
- **medium**: Default size (1rem font, 1rem padding)
- **large**: Large size (1.125rem font, 1.25rem padding)

## Interactive Features

### Multiple Selection
```tsx
<Accordion
  items={items}
  allowMultiple
  allowNone
/>
```

### Icon Configuration
```tsx
<Accordion
  items={items}
  iconPosition="left"
  showIcon={true}
/>
```

### Disabled Items
```tsx
<Accordion
  items={[
    {
      id: '1',
      title: 'Enabled Item',
      content: <div>Content</div>,
    },
    {
      id: '2',
      title: 'Disabled Item',
      content: <div>Content</div>,
      disabled: true,
    },
  ]}
/>
```

## Accessibility

- Full keyboard navigation support
- ARIA attributes for screen readers
- Focus management
- Semantic HTML structure
- High contrast support

## Testing

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Accordion } from '@luxgen/ui';

test('renders with items', () => {
  const items = [
    { id: '1', title: 'Section 1', content: <div>Content 1</div> },
    { id: '2', title: 'Section 2', content: <div>Content 2</div> },
  ];
  
  render(<Accordion items={items} />);
  
  expect(screen.getByText('Section 1')).toBeInTheDocument();
  expect(screen.getByText('Section 2')).toBeInTheDocument();
});

test('toggles items on click', () => {
  const items = [
    { id: '1', title: 'Section 1', content: <div>Content 1</div> },
  ];
  
  render(<Accordion items={items} />);
  
  const trigger = screen.getByText('Section 1');
  fireEvent.click(trigger);
  
  expect(screen.getByText('Content 1')).toBeInTheDocument();
});

test('calls onToggle when item is clicked', () => {
  const onToggle = jest.fn();
  const items = [
    { id: '1', title: 'Section 1', content: <div>Content 1</div> },
  ];
  
  render(<Accordion items={items} onToggle={onToggle} />);
  
  const trigger = screen.getByText('Section 1');
  fireEvent.click(trigger);
  
  expect(onToggle).toHaveBeenCalledWith('1', true);
});
```

## Examples

### Basic Accordion
```tsx
<Accordion
  items={[
    {
      id: '1',
      title: 'What is this?',
      content: <div>This is a basic accordion item.</div>,
    },
    {
      id: '2',
      title: 'How does it work?',
      content: <div>It works by expanding and collapsing content.</div>,
    },
  ]}
/>
```

### FAQ Accordion
```tsx
<Accordion
  items={[
    {
      id: '1',
      title: 'How do I get started?',
      content: (
        <div>
          <p>Getting started is easy:</p>
          <ol>
            <li>Sign up for an account</li>
            <li>Complete your profile</li>
            <li>Start using the platform</li>
          </ol>
        </div>
      ),
    },
  ]}
/>
```

### Multiple Selection
```tsx
<Accordion
  items={items}
  allowMultiple
  allowNone
/>
```

### Custom Styled Accordion
```tsx
<Accordion
  items={items}
  variant="bordered"
  size="large"
  iconPosition="left"
/>
```

### Disabled Items
```tsx
<Accordion
  items={[
    {
      id: '1',
      title: 'Available Section',
      content: <div>This section is available.</div>,
    },
    {
      id: '2',
      title: 'Disabled Section',
      content: <div>This section is disabled.</div>,
      disabled: true,
    },
  ]}
/>
```

### With Callbacks
```tsx
<Accordion
  items={items}
  onToggle={(itemId, isOpen) => {
    console.log(`Item ${itemId} is now ${isOpen ? 'open' : 'closed'}`);
  }}
  onItemClick={(item, index) => {
    console.log(`Clicked on item ${index}: ${item.title}`);
  }}
/>
```
