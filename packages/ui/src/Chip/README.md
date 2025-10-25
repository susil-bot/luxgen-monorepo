---
title: Chip
---

A versatile chip component for displaying tags, labels, and interactive elements. Supports multiple variants, sizes, shapes, and interactive states with tenant-aware theming.

## Purpose

To provide a flexible chip component for displaying tags, labels, categories, and interactive elements with consistent styling and behavior.

## Features

- **Multiple Variants**: Primary, secondary, success, error, warning, info, and outline styles
- **Flexible Sizing**: Small, medium, and large sizes
- **Shape Options**: Rounded, pill, and square shapes
- **Interactive States**: Clickable, closable, selected, and disabled states
- **Icon Support**: Optional icons for enhanced visual communication
- **Tenant-Aware Theming**: Uses CSS custom properties for dynamic theming
- **Accessibility**: Proper ARIA attributes and keyboard navigation
- **Responsive Design**: Adapts to different screen sizes

## Props

| Property                    | Type                    | Default     | Description                                                                                                                        |
| --------------------------- | ----------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| label                       | String                  | -           | Required text content for the chip                                                                                                |
| variant                     | String                  | 'primary'   | Chip variant ('primary', 'secondary', 'success', 'error', 'warning', 'info', 'outline')                                          |
| size                        | String                  | 'medium'    | Chip size ('small', 'medium', 'large')                                                                                            |
| shape                       | String                  | 'rounded'   | Chip shape ('rounded', 'pill', 'square')                                                                                         |
| closable                    | Boolean                 | false       | Show close button                                                                                                                 |
| onClose                     | Function                | -           | Callback when close button is clicked                                                                                            |
| icon                        | ReactNode               | -           | Optional icon to display                                                                                                          |
| maxWidth                    | String/Number           | -           | Maximum width for the chip                                                                                                        |
| className                   | String                  | ''          | Additional CSS classes                                                                                                             |
| style                       | Object                  | -           | Inline styles                                                                                                                       |
| disabled                    | Boolean                 | false       | Disable the chip                                                                                                                  |
| onClick                     | Function                | -           | Click handler for interactive chips                                                                                               |
| selected                    | Boolean                 | false       | Show selected state                                                                                                               |

## Component Usage

### Basic Usage

```jsx
import { Chip } from '@luxgen/ui';

<Chip label="React" />
<Chip label="TypeScript" variant="secondary" />
<Chip label="JavaScript" variant="success" />
```

### With Different Variants

```jsx
<Chip label="Primary" variant="primary" />
<Chip label="Secondary" variant="secondary" />
<Chip label="Success" variant="success" />
<Chip label="Error" variant="error" />
<Chip label="Warning" variant="warning" />
<Chip label="Info" variant="info" />
<Chip label="Outline" variant="outline" />
```

### With Different Sizes

```jsx
<Chip label="Small" size="small" />
<Chip label="Medium" size="medium" />
<Chip label="Large" size="large" />
```

### With Different Shapes

```jsx
<Chip label="Rounded" shape="rounded" />
<Chip label="Pill" shape="pill" />
<Chip label="Square" shape="square" />
```

### Closable Chips

```jsx
<Chip
  label="Closable"
  closable={true}
  onClose={() => console.log('Chip closed')}
/>
```

### With Icons

```jsx
import { StarIcon, HeartIcon } from '@luxgen/ui';

<Chip
  label="Favorite"
  icon={<StarIcon />}
  variant="warning"
/>
<Chip
  label="Liked"
  icon={<HeartIcon />}
  variant="error"
/>
```

### Interactive Chips

```jsx
<Chip
  label="Clickable"
  onClick={() => console.log('Chip clicked')}
  variant="primary"
/>
<Chip
  label="Selected"
  selected={true}
  onClick={() => console.log('Chip selected')}
  variant="secondary"
/>
```

### Disabled Chips

```jsx
<Chip
  label="Disabled"
  disabled={true}
  variant="primary"
/>
```

## Variants

### Primary Variant

```jsx
<Chip label="Primary" variant="primary" />
```

- Uses tenant primary color
- White text
- Hover effects

### Secondary Variant

```jsx
<Chip label="Secondary" variant="secondary" />
```

- Uses tenant secondary color
- White text
- Hover effects

### Success Variant

```jsx
<Chip label="Success" variant="success" />
```

- Green background
- Dark green text
- Success state styling

### Error Variant

```jsx
<Chip label="Error" variant="error" />
```

- Red background
- Dark red text
- Error state styling

### Warning Variant

```jsx
<Chip label="Warning" variant="warning" />
```

- Yellow background
- Dark yellow text
- Warning state styling

### Info Variant

```jsx
<Chip label="Info" variant="info" />
```

- Blue background
- Dark blue text
- Info state styling

### Outline Variant

```jsx
<Chip label="Outline" variant="outline" />
```

- Transparent background
- Primary color border and text
- Hover effects

## Sizes

### Small Size

```jsx
<Chip label="Small" size="small" />
```

- Compact padding (px-2 py-1)
- Small text (text-xs)
- Minimal spacing

### Medium Size

```jsx
<Chip label="Medium" size="medium" />
```

- Standard padding (px-3 py-1.5)
- Medium text (text-sm)
- Balanced spacing

### Large Size

```jsx
<Chip label="Large" size="large" />
```

- Generous padding (px-4 py-2)
- Large text (text-base)
- Spacious layout

## Shapes

### Rounded Shape

```jsx
<Chip label="Rounded" shape="rounded" />
```

- Medium border radius (rounded-md)
- Modern appearance
- Default shape

### Pill Shape

```jsx
<Chip label="Pill" shape="pill" />
```

- Full border radius (rounded-full)
- Capsule appearance
- Smooth edges

### Square Shape

```jsx
<Chip label="Square" shape="square" />
```

- No border radius (rounded-none)
- Sharp corners
- Geometric appearance

## Interactive States

### Clickable Chips

```jsx
<Chip
  label="Click me"
  onClick={() => console.log('Clicked')}
  variant="primary"
/>
```

- Cursor pointer on hover
- Scale effect on hover
- Keyboard navigation support

### Selected State

```jsx
<Chip
  label="Selected"
  selected={true}
  onClick={() => console.log('Selected')}
  variant="primary"
/>
```

- Ring border around chip
- Visual selection indicator
- Maintains click functionality

### Disabled State

```jsx
<Chip
  label="Disabled"
  disabled={true}
  variant="primary"
/>
```

- Reduced opacity
- No pointer cursor
- No interactions

## Closable Chips

### Basic Closable

```jsx
<Chip
  label="Remove me"
  closable={true}
  onClose={() => console.log('Removed')}
/>
```

### Closable with Custom Handler

```jsx
const handleClose = (chipLabel) => {
  console.log(`Removing chip: ${chipLabel}`);
  // Remove from state
};

<Chip
  label="Tag"
  closable={true}
  onClose={() => handleClose('Tag')}
/>
```

## Icon Integration

### With Icons

```jsx
import { StarIcon, HeartIcon, TagIcon } from '@luxgen/ui';

<Chip
  label="Starred"
  icon={<StarIcon />}
  variant="warning"
/>
<Chip
  label="Liked"
  icon={<HeartIcon />}
  variant="error"
/>
<Chip
  label="Tagged"
  icon={<TagIcon />}
  variant="info"
/>
```

### Icon Positioning

Icons are positioned to the left of the label text and are flex-shrink-0 to prevent distortion.

## Accessibility

### Keyboard Navigation

- **Tab**: Focus on clickable chips
- **Enter/Space**: Activate clickable chips
- **Escape**: Close closable chips

### ARIA Attributes

- `role="button"` for clickable chips
- `aria-label` for close buttons
- `tabIndex` for keyboard navigation
- Proper focus management

### Screen Reader Support

- Close buttons have descriptive labels
- Interactive chips announce their purpose
- State changes are communicated

## Styling

### Custom Classes

```jsx
<Chip
  label="Custom"
  className="my-custom-chip"
  variant="primary"
/>
```

### Inline Styles

```jsx
<Chip
  label="Styled"
  style={{
    backgroundColor: '#ff6b6b',
    color: 'white'
  }}
/>
```

### CSS Custom Properties

The chip component uses CSS custom properties for tenant-aware theming:

```css
.chip {
  --color-primary: #3B82F6;
  --color-secondary: #10B981;
}
```

## Examples

### Tag Cloud

```jsx
const tags = ['React', 'TypeScript', 'JavaScript', 'CSS', 'HTML'];

<div className="flex flex-wrap gap-2">
  {tags.map(tag => (
    <Chip
      key={tag}
      label={tag}
      variant="outline"
      onClick={() => console.log(`Selected: ${tag}`)}
    />
  ))}
</div>
```

### Filter Chips

```jsx
const [selectedFilters, setSelectedFilters] = useState([]);

const filters = ['All', 'Active', 'Inactive', 'Pending'];

<div className="flex flex-wrap gap-2">
  {filters.map(filter => (
    <Chip
      key={filter}
      label={filter}
      variant={selectedFilters.includes(filter) ? 'primary' : 'outline'}
      onClick={() => {
        if (selectedFilters.includes(filter)) {
          setSelectedFilters(prev => prev.filter(f => f !== filter));
        } else {
          setSelectedFilters(prev => [...prev, filter]);
        }
      }}
    />
  ))}
</div>
```

### Status Indicators

```jsx
const statuses = [
  { label: 'Published', variant: 'success' },
  { label: 'Draft', variant: 'warning' },
  { label: 'Archived', variant: 'info' },
  { label: 'Deleted', variant: 'error' }
];

<div className="flex flex-wrap gap-2">
  {statuses.map(status => (
    <Chip
      key={status.label}
      label={status.label}
      variant={status.variant}
    />
  ))}
</div>
```

### Removable Tags

```jsx
const [tags, setTags] = useState(['React', 'TypeScript', 'JavaScript']);

const removeTag = (tagToRemove) => {
  setTags(prev => prev.filter(tag => tag !== tagToRemove));
};

<div className="flex flex-wrap gap-2">
  {tags.map(tag => (
    <Chip
      key={tag}
      label={tag}
      variant="primary"
      closable={true}
      onClose={() => removeTag(tag)}
    />
  ))}
</div>
```

## Troubleshooting

### Common Issues

1. **Chip not clickable**: Check if `onClick` prop is provided
2. **Close button not working**: Verify `onClose` callback is provided
3. **Styling not applied**: Check CSS custom properties and Tailwind classes
4. **Accessibility issues**: Ensure proper ARIA attributes and keyboard navigation

### Debug Steps

1. Check console for click events
2. Verify prop values are correct
3. Test keyboard navigation
4. Check CSS custom properties in DevTools

### Performance

- Chips are lightweight components
- Minimal re-renders with proper key props
- Efficient event handling
- Optimized for large lists
