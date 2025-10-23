# Carousel Component

A flexible carousel component for displaying multiple items in a sliding interface with navigation controls, autoplay, and various display options.

## Features

- **SSR Support**: Server-side rendering with theme injection
- **Navigation Controls**: Arrow navigation, dots, and thumbnails
- **Autoplay**: Automatic slide progression with customizable intervals
- **Infinite Scroll**: Seamless looping through slides
- **Multiple Display**: Support for showing multiple slides at once
- **Touch Support**: Touch/swipe gestures for mobile devices
- **Keyboard Navigation**: Arrow key support for accessibility
- **Theme Integration**: Supports tenant-specific theming
- **Responsive Design**: Adapts to different screen sizes

## Usage

```tsx
import { Carousel } from '@luxgen/ui';

// Basic usage
<Carousel
  items={[
    { id: '1', content: <div>Slide 1</div> },
    { id: '2', content: <div>Slide 2</div> },
    { id: '3', content: <div>Slide 3</div> },
  ]}
/>

// With autoplay
<Carousel
  items={items}
  autoPlay
  autoPlayInterval={3000}
/>

// With navigation controls
<Carousel
  items={items}
  showArrows
  showDots
  showThumbnails
/>

// With multiple slides
<Carousel
  items={items}
  slidesToShow={2}
  slidesToScroll={1}
/>

// With callbacks
<Carousel
  items={items}
  onSlideChange={(index) => console.log('Slide changed to:', index)}
  onItemClick={(item, index) => console.log('Item clicked:', item, index)}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tenantTheme` | `TenantTheme` | `defaultTheme` | Theme object for styling |
| `items` | `CarouselItem[]` | - | Array of carousel items |
| `autoPlay` | `boolean` | `false` | Enable automatic slide progression |
| `autoPlayInterval` | `number` | `3000` | Interval between slides in milliseconds |
| `showArrows` | `boolean` | `true` | Show navigation arrows |
| `showDots` | `boolean` | `true` | Show dot indicators |
| `showThumbnails` | `boolean` | `false` | Show thumbnail navigation |
| `infinite` | `boolean` | `true` | Enable infinite scrolling |
| `slidesToShow` | `number` | `1` | Number of slides to display at once |
| `slidesToScroll` | `number` | `1` | Number of slides to scroll at once |
| `onSlideChange` | `(index: number) => void` | - | Callback when slide changes |
| `onItemClick` | `(item: CarouselItem, index: number) => void` | - | Callback when item is clicked |
| `className` | `string` | `''` | Additional CSS classes |
| `style` | `CSSProperties` | `{}` | Inline styles |

## CarouselItem Interface

```tsx
interface CarouselItem {
  id: string;
  content: React.ReactNode;
  title?: string;
  description?: string;
}
```

## SSR Usage

```tsx
import { fetchCarouselSSR } from '@luxgen/ui';

// Server-side rendering
const { html, styles } = await fetchCarouselSSR(tenantId);
```

## Styling

The component uses CSS custom properties for theming:

```css
.carousel {
  position: relative;
  overflow: hidden;
  font-family: var(--font-primary);
  color: var(--color-text);
}

.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 50%;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-text);
  font-size: 1.25rem;
  z-index: 2;
}

.carousel-dot {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  border: none;
  background: var(--color-border);
  margin: 0 0.25rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.carousel-dot.active {
  background: var(--color-primary);
}
```

## Navigation Options

### Arrow Navigation
- Left/right arrows for slide navigation
- Disabled state when at boundaries (if not infinite)
- Hover effects and transitions

### Dot Navigation
- Clickable dots indicating current position
- Active state highlighting
- Responsive positioning

### Thumbnail Navigation
- Thumbnail previews of slides
- Click to navigate to specific slide
- Active state highlighting

## Autoplay Features

### Automatic Progression
- Configurable interval between slides
- Pause on hover/interaction
- Resume on mouse leave

### Controls
- Play/pause functionality
- Stop autoplay option
- Manual override

## Touch Support

### Gestures
- Swipe left/right to navigate
- Touch and drag support
- Momentum scrolling

### Mobile Optimization
- Touch-friendly controls
- Responsive sizing
- Gesture recognition

## Keyboard Navigation

### Arrow Keys
- Left/right arrow keys for navigation
- Up/down arrow keys for vertical navigation
- Tab navigation for accessibility

### Focus Management
- Keyboard focus indicators
- Tab order management
- Screen reader support

## Accessibility

- ARIA labels and descriptions
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- Semantic HTML structure

## Testing

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Carousel } from '@luxgen/ui';

test('renders with items', () => {
  const items = [
    { id: '1', content: <div>Slide 1</div> },
    { id: '2', content: <div>Slide 2</div> },
  ];
  
  render(<Carousel items={items} />);
  
  expect(screen.getByText('Slide 1')).toBeInTheDocument();
});

test('navigates with arrows', () => {
  const items = [
    { id: '1', content: <div>Slide 1</div> },
    { id: '2', content: <div>Slide 2</div> },
  ];
  
  render(<Carousel items={items} showArrows />);
  
  const nextButton = screen.getByText('›');
  fireEvent.click(nextButton);
  
  expect(screen.getByText('Slide 2')).toBeInTheDocument();
});

test('calls onSlideChange when slide changes', () => {
  const onSlideChange = jest.fn();
  const items = [
    { id: '1', content: <div>Slide 1</div> },
    { id: '2', content: <div>Slide 2</div> },
  ];
  
  render(<Carousel items={items} onSlideChange={onSlideChange} />);
  
  const nextButton = screen.getByText('›');
  fireEvent.click(nextButton);
  
  expect(onSlideChange).toHaveBeenCalledWith(1);
});
```

## Examples

### Basic Carousel
```tsx
<Carousel
  items={[
    { id: '1', content: <div>Slide 1</div> },
    { id: '2', content: <div>Slide 2</div> },
    { id: '3', content: <div>Slide 3</div> },
  ]}
/>
```

### Autoplay Carousel
```tsx
<Carousel
  items={items}
  autoPlay
  autoPlayInterval={2000}
/>
```

### Navigation Controls
```tsx
<Carousel
  items={items}
  showArrows
  showDots
  showThumbnails
/>
```

### Multiple Slides
```tsx
<Carousel
  items={items}
  slidesToShow={2}
  slidesToScroll={1}
/>
```

### Custom Themed Carousel
```tsx
<Carousel
  tenantTheme={customTheme}
  items={items}
/>
```

### With Callbacks
```tsx
<Carousel
  items={items}
  onSlideChange={(index) => setCurrentSlide(index)}
  onItemClick={(item, index) => handleItemClick(item, index)}
/>
```

### Complex Content
```tsx
<Carousel
  items={[
    {
      id: '1',
      content: (
        <div>
          <h3>Slide 1</h3>
          <p>Description</p>
          <button>Action</button>
        </div>
      ),
      title: 'Slide 1',
      description: 'First slide',
    },
  ]}
/>
```
