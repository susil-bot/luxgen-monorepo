# RegisterVisual Component

A reusable visual component for registration pages that displays an animated abstract graphic and testimonial card.

## Features

- **Animated Abstract Graphic**: Multi-layered animated rings with floating particles
- **Testimonial Card**: Customizable quote, author, and statistics
- **Responsive Design**: Adapts to different screen sizes
- **Customizable Content**: Props for testimonial text and styling

## Usage

```tsx
import { RegisterVisual } from '@luxgen/ui';

function RegisterPage() {
  return (
    <RegisterVisual
      testimonial={{
        quote: "Join thousands of professionals who have found their dream careers through our platform. Start your journey today!",
        author: "Join Our Community",
        stats: "Over 10,000+ successful placements"
      }}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `testimonial` | `object` | See below | Testimonial content |
| `testimonial.quote` | `string` | Default quote | The testimonial quote text |
| `testimonial.author` | `string` | "Join Our Community" | The author name |
| `testimonial.stats` | `string` | "Over 10,000+ successful placements" | Statistics text |
| `className` | `string` | `''` | Additional CSS classes |
| `title` | `string` | "Join Our Community" | Title for the testimonial |
| `subtitle` | `string` | "Over 10,000+ successful placements" | Subtitle for the testimonial |

## Default Testimonial

```tsx
{
  quote: "Join thousands of professionals who have found their dream careers through our platform. Start your journey today!",
  author: "Join Our Community", 
  stats: "Over 10,000+ successful placements"
}
```

## Styling

The component uses Tailwind CSS classes and includes:
- Gradient backgrounds with blur effects
- Animated rings with different delays
- Floating particle animations
- Responsive sizing for different screen sizes
- Green color theme matching the registration flow

## Animation Details

- **Outer Ring**: Pulses continuously
- **Middle Ring**: Pulses with 0.5s delay
- **Inner Ring**: Pulses with 1s delay  
- **Center Dot**: Pings continuously
- **Floating Particles**: 8 particles with staggered bounce animations

## Responsive Behavior

- **Mobile**: Smaller rings and particles
- **Tablet**: Medium-sized rings
- **Desktop**: Large rings with full animation effects
- **Large Desktop**: Extra large rings for maximum visual impact
