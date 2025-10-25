# UserRetention Component

A standalone, reusable component for displaying user retention trends with interactive line charts.

## Features

- **Interactive Line Chart**: Smooth line chart with gradient fills and data point interactions
- **Grid Support**: Optional grid lines for better data visualization
- **Legend Support**: Optional legend with customizable colors
- **Responsive Design**: Adapts to different screen sizes and container widths
- **Theme Integration**: Full support for tenant themes with fallbacks
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Empty States**: Graceful handling of empty data scenarios

## Usage

```tsx
import { UserRetention } from '@luxgen/ui';

const retentionData = [
  { date: 'Jan', value: 400 },
  { date: 'Feb', value: 450 },
  { date: 'Mar', value: 500 },
  { date: 'Apr', value: 480 },
  { date: 'May', value: 550 }
];

<UserRetention
  title="User Retention Trends"
  data={retentionData}
  height={300}
  color="#3B82F6"
  showGrid={true}
  showLegend={true}
  onDataPointClick={(point) => console.log('Point clicked:', point)}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `'User Retention Trends'` | Chart title |
| `data` | `RetentionDataPoint[]` | `[]` | Array of data points |
| `height` | `number` | `300` | Chart height in pixels |
| `color` | `string` | `theme.primary` | Line and fill color |
| `showGrid` | `boolean` | `true` | Show grid lines |
| `showTooltip` | `boolean` | `true` | Show tooltips on hover |
| `showLegend` | `boolean` | `true` | Show legend |
| `variant` | `'default' \| 'compact' \| 'detailed'` | `'default'` | Component variant |
| `onDataPointClick` | `(point: RetentionDataPoint) => void` | - | Data point click handler |
| `tenantTheme` | `TenantTheme` | `defaultTheme` | Theme object for styling |

## RetentionDataPoint Interface

```tsx
interface RetentionDataPoint {
  date: string;
  value: number;
  label?: string;
}
```

## Variants

### Default
Standard size with full features and legend.

### Compact
Smaller size optimized for dashboards and sidebars.

### Detailed
Larger size with enhanced spacing for detailed analysis.

## Examples

### Basic Usage

```tsx
<UserRetention
  title="Monthly Retention"
  data={[
    { date: 'Jan', value: 400 },
    { date: 'Feb', value: 450 },
    { date: 'Mar', value: 500 }
  ]}
/>
```

### With Custom Styling

```tsx
<UserRetention
  title="User Retention Trends"
  data={retentionData}
  height={400}
  color="#10B981"
  showGrid={true}
  showLegend={true}
  variant="detailed"
  onDataPointClick={(point) => {
    console.log('Clicked point:', point);
    // Handle data point interaction
  }}
/>
```

### Compact Variant

```tsx
<UserRetention
  title="Retention"
  data={retentionData}
  variant="compact"
  showLegend={false}
/>
```

## Styling

The component uses CSS-in-JS styling with full theme support:

- **Theme Colors**: All colors are theme-aware and will adapt to your tenant theme
- **CSS Classes**: Additional styling can be applied using the `className` prop
- **Variant Styles**: Different layout variants for different use cases
- **Hover Effects**: Smooth transitions and hover animations

## Accessibility

- **Semantic HTML**: Proper heading structure and landmark roles
- **Keyboard Navigation**: Full keyboard support for all interactive elements
- **Screen Reader Support**: ARIA labels and descriptions for all components
- **Focus Management**: Proper focus indicators and tab order
- **Color Contrast**: Meets WCAG 2.1 AA standards for color contrast

## Performance

- **Efficient Rendering**: Optimized for large datasets and frequent updates
- **Memoization**: Components are memoized to prevent unnecessary re-renders
- **Bundle Size**: Tree-shakeable components to minimize bundle impact
- **Lazy Loading**: Charts are loaded on demand for better performance

## Testing

The component includes comprehensive test coverage:

- **Rendering Tests**: Default props, custom styling, loading states
- **Interaction Tests**: Data point clicks, hover effects
- **Accessibility Tests**: Proper heading structure, keyboard navigation
- **Edge Cases**: Empty states, error handling, variant testing

Run tests with:
```bash
npm test UserRetention.spec.js
```
