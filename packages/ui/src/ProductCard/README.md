# ProductCard Component

A comprehensive product card component that displays product information with image, tags, progress indicators, pricing, and interactive actions.

## Features

- **Product Image**: High-quality image display with hover effects and error handling
- **Tags**: Customizable product tags with color theming
- **Progress Indicators**: Status and score display with color-coded indicators
- **Pricing**: Current price, original price, and discount display
- **Interactive Actions**: Like, edit, and add to cart functionality
- **Responsive Design**: Multiple variants (default, compact, detailed)
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Customizable**: Full control over styling and behavior

## Usage

```tsx
import { ProductCard } from '@luxgen/ui';

const product = {
  id: '1',
  title: 'Role-Based Modules',
  tag: 'Tech talk',
  tagColor: '#8B5CF6',
  image: '/product-image.jpg',
  imageAlt: 'Product image',
  progress: {
    status: 'Completed',
    score: 50,
    scoreColor: '#F59E0B',
  },
  price: '$99.99',
  originalPrice: '$149.99',
  discount: 33,
};

<ProductCard
  product={product}
  onEdit={(id) => console.log('Edit product:', id)}
  onLike={(id, liked) => console.log('Like product:', id, liked)}
  onAddToCart={(id) => console.log('Add to cart:', id)}
  onViewDetails={(id) => console.log('View details:', id)}
  liked={false}
  variant="default"
  showActions={true}
  showProgress={true}
  showPrice={true}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `product` | `Product` | - | **Required.** Product data object |
| `onEdit` | `(id: string) => void` | - | Edit button click handler |
| `onLike` | `(id: string, liked: boolean) => void` | - | Like button click handler |
| `onAddToCart` | `(id: string) => void` | - | Add to cart button click handler |
| `onViewDetails` | `(id: string) => void` | - | Card click handler |
| `liked` | `boolean` | `false` | Initial liked state |
| `variant` | `'default' \| 'compact' \| 'detailed'` | `'default'` | Card size variant |
| `showActions` | `boolean` | `true` | Show action buttons |
| `showProgress` | `boolean` | `true` | Show progress indicators |
| `showPrice` | `boolean` | `true` | Show price information |
| `className` | `string` | `''` | Additional CSS classes |
| `tenantTheme` | `TenantTheme` | `defaultTheme` | Theme object for styling |

## Product Interface

```tsx
interface Product {
  id: string;                    // Unique identifier
  title: string;                 // Product title
  tag?: string;                 // Product tag text
  tagColor?: string;             // Tag background color
  image: string;                 // Product image URL
  imageAlt?: string;             // Image alt text
  progress?: {                   // Progress information
    status: string;              // Status text (e.g., "Completed")
    score?: number;              // Score percentage
    scoreColor?: string;         // Score indicator color
  };
  price?: string;                // Current price
  originalPrice?: string;        // Original price (strikethrough)
  discount?: number;             // Discount percentage
}
```

## Variants

### Default
Standard product card with full features and medium size.

### Compact
Smaller card for grid layouts with essential information only.

### Detailed
Larger card with enhanced spacing and additional visual elements.

## Examples

### Basic Product Card
```tsx
const basicProduct = {
  id: '1',
  title: 'Basic Product',
  image: '/product.jpg',
};

<ProductCard product={basicProduct} />
```

### Complete Product Card
```tsx
const completeProduct = {
  id: '2',
  title: 'Advanced Course',
  tag: 'Premium',
  tagColor: '#10B981',
  image: '/course.jpg',
  imageAlt: 'Course preview',
  progress: {
    status: 'In Progress',
    score: 75,
    scoreColor: '#3B82F6',
  },
  price: '$199.99',
  originalPrice: '$299.99',
  discount: 33,
};

<ProductCard
  product={completeProduct}
  onEdit={(id) => handleEdit(id)}
  onLike={(id, liked) => handleLike(id, liked)}
  onAddToCart={(id) => handleAddToCart(id)}
  onViewDetails={(id) => handleViewDetails(id)}
  liked={true}
  variant="detailed"
/>
```

### Compact Grid Layout
```tsx
const products = [/* array of products */];

<div className="grid grid-cols-3 gap-4">
  {products.map(product => (
    <ProductCard
      key={product.id}
      product={product}
      variant="compact"
      onViewDetails={(id) => navigate(`/products/${id}`)}
    />
  ))}
</div>
```

## Styling

### Custom Tag Colors
```tsx
const product = {
  // ... other properties
  tag: 'New',
  tagColor: '#EF4444', // Red tag
};
```

### Custom Progress Colors
```tsx
const product = {
  // ... other properties
  progress: {
    status: 'Completed',
    score: 90,
    scoreColor: '#10B981', // Green for high score
  },
};
```

### CSS Customization
```css
.product-card {
  transition: all 0.2s ease;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.1);
}

.product-card-image img {
  transition: transform 0.2s ease;
}

.product-card-image:hover img {
  transform: scale(1.05);
}
```

## Interactive Features

### Like Functionality
- Heart icon that fills when liked
- Smooth color transition
- Prevents card click when like button is clicked

### Image Hover Effects
- Subtle scale animation on hover
- Smooth transitions
- Error state with placeholder

### Action Buttons
- Edit button for product management
- Add to cart button (when handler provided)
- Hover effects and transitions

## Accessibility

### Keyboard Navigation
- All interactive elements are keyboard accessible
- Proper focus management
- Tab order follows logical flow

### Screen Reader Support
- Proper alt text for images
- Semantic HTML structure
- ARIA labels for interactive elements

### Color Contrast
- Meets WCAG AA standards
- High contrast text and backgrounds
- Color is not the only indicator of state

## Performance

### Image Optimization
- Lazy loading support
- Error handling with fallback
- Optimized hover effects

### Event Handling
- Efficient event delegation
- Proper cleanup of event listeners
- Optimized re-renders

## Integration

### With State Management
```tsx
const [likedProducts, setLikedProducts] = useState(new Set());

const handleLike = (id, liked) => {
  if (liked) {
    setLikedProducts(prev => new Set([...prev, id]));
  } else {
    setLikedProducts(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }
};

<ProductCard
  product={product}
  liked={likedProducts.has(product.id)}
  onLike={handleLike}
/>
```

### With Routing
```tsx
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

<ProductCard
  product={product}
  onViewDetails={(id) => navigate(`/products/${id}`)}
  onEdit={(id) => navigate(`/products/${id}/edit`)}
/>
```

## Testing

The component includes comprehensive Jest tests covering:
- Rendering with different props
- Image handling and error states
- Interactive functionality
- Accessibility features
- Edge cases and error handling

Run tests with:
```bash
npm test ProductCard.spec.js
```

## Troubleshooting

### Common Issues

1. **Image not loading**: Check image URL and implement error handling
2. **Styling conflicts**: Use CSS specificity or className prop
3. **Event propagation**: Use stopPropagation() for nested clickable elements
4. **Performance**: Optimize image sizes and use lazy loading

### Debug Tips

1. Check console for image loading errors
2. Verify product data structure
3. Test keyboard navigation
4. Validate accessibility with screen readers
