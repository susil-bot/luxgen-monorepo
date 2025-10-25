# Banner Carousel Component

A feature-rich banner carousel component with auto-play, navigation controls, and customizable slides.

## Features

- **Auto-play**: Configurable automatic slide transitions
- **Navigation**: Arrow controls and dot indicators
- **Responsive**: Adapts to different screen sizes
- **Customizable**: Full control over slide content and styling
- **Accessible**: Keyboard navigation and ARIA labels
- **Interactive**: Play/pause controls and click handlers

## Usage

```tsx
import { BannerCarousel } from '@luxgen/ui';

const slides = [
  {
    id: '1',
    title: 'Enjoy free home lessons this summer',
    subtitle: 'Designer Dresses - Pick from trendy Designer Course',
    date: 'September 12-22',
    ctaText: 'Get Started',
    ctaHref: '/courses',
    backgroundColor: '#4A70F7',
    ctaColor: '#F78C4A'
  }
];

<BannerCarousel 
  slides={slides}
  autoPlay={true}
  showArrows={true}
  showDots={true}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `slides` | `BannerSlide[]` | - | **Required.** Array of slide data |
| `autoPlay` | `boolean` | `true` | Enable automatic slide transitions |
| `autoPlayInterval` | `number` | `5000` | Auto-play interval in milliseconds |
| `showArrows` | `boolean` | `true` | Show navigation arrows |
| `showDots` | `showDots` | `true` | Show dot indicators |
| `className` | `string` | `''` | Additional CSS classes |
| `onSlideChange` | `(index: number) => void` | - | Slide change callback |
| `onCtaClick` | `(slide: BannerSlide) => void` | - | CTA button click callback |

## BannerSlide Interface

```tsx
interface BannerSlide {
  id: string;                    // Unique identifier
  title: string;                 // Main headline
  subtitle?: string;             // Secondary headline
  description?: string;          // Descriptive text
  date?: string;                 // Date/period text
  ctaText?: string;             // Call-to-action button text
  ctaHref?: string;             // CTA link destination
  ctaOnClick?: () => void;      // CTA click handler
  backgroundImage?: string;     // Background image URL
  backgroundColor?: string;      // Background color
  textColor?: string;           // Text color
  ctaColor?: string;            // CTA button color
}
```

## Examples

### Basic Carousel
```tsx
const slides = [
  {
    id: '1',
    title: 'Welcome to Our Platform',
    description: 'Discover amazing courses and learn new skills',
    ctaText: 'Get Started',
    backgroundColor: '#4A70F7'
  }
];

<BannerCarousel slides={slides} />
```

### Advanced Configuration
```tsx
<BannerCarousel 
  slides={slides}
  autoPlay={false}
  autoPlayInterval={3000}
  showArrows={true}
  showDots={true}
  onSlideChange={(index) => console.log('Slide changed:', index)}
  onCtaClick={(slide) => console.log('CTA clicked:', slide)}
  className="my-8"
/>
```

### Custom Styled Slide
```tsx
const customSlide = {
  id: 'custom',
  title: 'Special Offer',
  subtitle: 'Limited Time',
  date: 'December 1-31',
  description: 'Get 50% off on all courses',
  ctaText: 'Claim Offer',
  backgroundColor: '#10B981',
  textColor: '#FFFFFF',
  ctaColor: '#F59E0B',
  backgroundImage: '/images/offer-bg.jpg'
};
```

## Features

### Auto-play Control
- Automatic slide transitions
- Pause on user interaction
- Play/pause button
- Configurable interval

### Navigation
- Left/right arrow controls
- Dot indicators
- Keyboard navigation
- Touch/swipe support (when implemented)

### Responsive Design
- Adapts to different screen sizes
- Mobile-optimized layout
- Flexible content positioning

### Accessibility
- ARIA labels for screen readers
- Keyboard navigation
- Focus management
- Semantic HTML structure

## Styling

The component uses Tailwind CSS and can be customized:

```tsx
<BannerCarousel 
  slides={slides}
  className="rounded-xl shadow-2xl"
/>
```

## Integration

Perfect for:
- Hero banners
- Promotional campaigns
- Course announcements
- Feature highlights
- Marketing content
