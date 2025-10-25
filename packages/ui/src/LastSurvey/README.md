# LastSurvey Component

A standalone, reusable component for displaying the most recent survey with progress tracking, status indicators, and action buttons.

## Features

- **Survey Information**: Display survey title, description, and metadata
- **Progress Tracking**: Visual progress bar with completion percentage
- **Status Indicators**: Color-coded status badges (Active, Completed, Draft, Closed)
- **Action Buttons**: View, Edit, and Share survey actions
- **Responsive Design**: Adapts to different screen sizes and container widths
- **Theme Integration**: Full support for tenant themes with fallbacks
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Empty States**: Graceful handling of missing survey data

## Usage

```tsx
import { LastSurvey } from '@luxgen/ui';

const survey = {
  id: '1',
  title: 'Customer Satisfaction Survey',
  status: 'active',
  progress: 75,
  totalResponses: 150,
  targetResponses: 200,
  createdAt: '2024-01-15',
  expiresAt: '2024-02-15',
  description: 'Quarterly customer satisfaction assessment'
};

<LastSurvey
  title="Last Survey"
  survey={survey}
  showProgress={true}
  showActions={true}
  onViewSurvey={(survey) => console.log('View survey:', survey)}
  onEditSurvey={(survey) => console.log('Edit survey:', survey)}
  onShareSurvey={(survey) => console.log('Share survey:', survey)}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `'Last Survey'` | Component title |
| `survey` | `Survey` | - | Survey object (required) |
| `showProgress` | `boolean` | `true` | Show progress bar and completion info |
| `showActions` | `boolean` | `true` | Show action buttons |
| `variant` | `'default' \| 'compact' \| 'detailed'` | `'default'` | Component variant |
| `onViewSurvey` | `(survey: Survey) => void` | - | View survey handler |
| `onEditSurvey` | `(survey: Survey) => void` | - | Edit survey handler |
| `onShareSurvey` | `(survey: Survey) => void` | - | Share survey handler |
| `tenantTheme` | `TenantTheme` | `defaultTheme` | Theme object for styling |

## Survey Interface

```tsx
interface Survey {
  id: string;
  title: string;
  status: 'active' | 'completed' | 'draft' | 'closed';
  progress: number;
  totalResponses: number;
  targetResponses?: number;
  createdAt: string;
  expiresAt?: string;
  description?: string;
}
```

## Variants

### Default
Standard size with full features and action buttons.

### Compact
Smaller size optimized for dashboards and sidebars.

### Detailed
Larger size with enhanced spacing for detailed survey information.

## Examples

### Basic Usage

```tsx
<LastSurvey
  title="Last Survey"
  survey={survey}
  showProgress={true}
  showActions={true}
/>
```

### With Custom Styling

```tsx
<LastSurvey
  title="Survey Overview"
  survey={survey}
  showProgress={true}
  showActions={true}
  variant="detailed"
  onViewSurvey={(survey) => {
    console.log('Viewing survey:', survey);
    // Navigate to survey details
  }}
  onEditSurvey={(survey) => {
    console.log('Editing survey:', survey);
    // Navigate to survey editor
  }}
  onShareSurvey={(survey) => {
    console.log('Sharing survey:', survey);
    // Open share dialog
  }}
/>
```

### Compact Variant

```tsx
<LastSurvey
  title="Survey"
  survey={survey}
  showProgress={false}
  showActions={false}
  variant="compact"
/>
```

### Without Actions

```tsx
<LastSurvey
  title="Survey Status"
  survey={survey}
  showProgress={true}
  showActions={false}
/>
```

## Status Types

- **Active**: Green status badge for ongoing surveys
- **Completed**: Blue status badge for finished surveys
- **Draft**: Orange status badge for draft surveys
- **Closed**: Gray status badge for closed surveys

## Progress Tracking

The component displays survey progress with:

- **Progress Bar**: Visual representation of completion percentage
- **Response Count**: Current responses vs target (if specified)
- **Completion Percentage**: Text display of progress percentage

## Action Buttons

- **View Survey**: Primary action to view survey details
- **Edit Survey**: Secondary action to edit survey
- **Share Survey**: Tertiary action to share survey

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

- **Efficient Rendering**: Optimized for frequent updates and state changes
- **Memoization**: Components are memoized to prevent unnecessary re-renders
- **Bundle Size**: Tree-shakeable components to minimize bundle impact
- **Lazy Loading**: Actions are loaded on demand for better performance

## Testing

The component includes comprehensive test coverage:

- **Rendering Tests**: Default props, custom styling, status display
- **Interaction Tests**: Button clicks, action handlers
- **Accessibility Tests**: Proper heading structure, keyboard navigation
- **Edge Cases**: Different statuses, progress states, variant testing

Run tests with:
```bash
npm test LastSurvey.spec.js
```
