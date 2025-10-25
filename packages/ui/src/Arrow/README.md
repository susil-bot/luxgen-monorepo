# Arrow Component

A versatile arrow component for navigation controls in carousels, sliders, and other interactive elements.

## Features

- **Multiple Directions**: Left, right, up, down
- **Size Variants**: Small, medium, large
- **Style Variants**: Default, outline, ghost
- **Accessibility**: ARIA labels and keyboard navigation
- **Customizable**: Full styling control with className prop

## Usage

```tsx
import { Arrow } from '@luxgen/ui';

// Basic usage
<Arrow direction="left" onClick={handlePrevious} />

// With custom styling
<Arrow 
  direction="right" 
  size="large" 
  variant="outline" 
  disabled={false}
  onClick={handleNext}
  aria-label="Next slide"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `direction` | `'left' \| 'right' \| 'up' \| 'down'` | - | **Required.** Arrow direction |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Arrow size |
| `variant` | `'default' \| 'outline' \| 'ghost'` | `'default'` | Visual style variant |
| `disabled` | `boolean` | `false` | Disable the arrow |
| `onClick` | `() => void` | - | Click handler |
| `className` | `string` | `''` | Additional CSS classes |
| `aria-label` | `string` | - | Accessibility label |

## Variants

### Default
Semi-transparent background with white text, perfect for overlays.

### Outline
White background with border, ideal for light backgrounds.

### Ghost
Transparent background with subtle hover effects.

## Examples

### Carousel Navigation
```tsx
<div className="flex items-center space-x-2">
  <Arrow direction="left" onClick={goToPrevious} />
  <Arrow direction="right" onClick={goToNext} />
</div>
```

### Dropdown Menu
```tsx
<Arrow direction="down" size="small" variant="ghost" />
```

### Large Navigation
```tsx
<Arrow 
  direction="up" 
  size="large" 
  variant="outline"
  onClick={scrollToTop}
  aria-label="Scroll to top"
/>
```

## Accessibility

- Proper ARIA labels for screen readers
- Keyboard navigation support
- Focus management with visible focus rings
- Semantic button element

## Styling

The component uses Tailwind CSS classes and can be customized with the `className` prop:

```tsx
<Arrow 
  direction="left" 
  className="shadow-lg hover:shadow-xl transition-shadow"
/>
```
