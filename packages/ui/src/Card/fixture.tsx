import { CardProps } from './Card';
import { defaultTheme } from '../theme';

export const cardFixtures = {
  default: {
    tenantTheme: defaultTheme,
    children: <div>Card content</div>,
  } as CardProps,
  
  withTitle: {
    tenantTheme: defaultTheme,
    children: <div>Card content</div>,
    title: 'Card Title',
  } as CardProps,
  
  withDescription: {
    tenantTheme: defaultTheme,
    children: <div>Card content</div>,
    title: 'Card Title',
    description: 'Card description',
  } as CardProps,
  
  withIcon: {
    tenantTheme: defaultTheme,
    children: <div>Card content</div>,
    title: 'Card Title',
    description: 'Card description',
    icon: '🔖',
  } as CardProps,
  
  elevated: {
    tenantTheme: defaultTheme,
    children: <div>Card content</div>,
    title: 'Elevated Card',
    variant: 'elevated' as const,
  } as CardProps,
  
  outlined: {
    tenantTheme: defaultTheme,
    children: <div>Card content</div>,
    title: 'Outlined Card',
    variant: 'outlined' as const,
  } as CardProps,
  
  filled: {
    tenantTheme: defaultTheme,
    children: <div>Card content</div>,
    title: 'Filled Card',
    variant: 'filled' as const,
  } as CardProps,
  
  small: {
    tenantTheme: defaultTheme,
    children: <div>Card content</div>,
    title: 'Small Card',
    size: 'small' as const,
  } as CardProps,
  
  medium: {
    tenantTheme: defaultTheme,
    children: <div>Card content</div>,
    title: 'Medium Card',
    size: 'medium' as const,
  } as CardProps,
  
  large: {
    tenantTheme: defaultTheme,
    children: <div>Card content</div>,
    title: 'Large Card',
    size: 'large' as const,
  } as CardProps,
  
  clickable: {
    tenantTheme: defaultTheme,
    children: <div>Card content</div>,
    title: 'Clickable Card',
    clickable: true,
    onClick: () => console.log('Card clicked'),
  } as CardProps,
  
  withHover: {
    tenantTheme: defaultTheme,
    children: <div>Card content</div>,
    title: 'Hover Card',
    hover: true,
  } as CardProps,
  
  withImage: {
    tenantTheme: defaultTheme,
    children: <div>Card content</div>,
    title: 'Card with Image',
    image: 'https://via.placeholder.com/300x200',
    imageAlt: 'Placeholder image',
  } as CardProps,
  
  withHeader: {
    tenantTheme: defaultTheme,
    children: <div>Card content</div>,
    header: <div>Custom header</div>,
  } as CardProps,
  
  withFooter: {
    tenantTheme: defaultTheme,
    children: <div>Card content</div>,
    title: 'Card with Footer',
    footer: <div>Custom footer</div>,
  } as CardProps,
  
  withCustomTheme: {
    tenantTheme: {
      ...defaultTheme,
      colors: {
        ...defaultTheme.colors,
        primary: '#8B5CF6',
      },
    },
    children: <div>Card content</div>,
    title: 'Custom Themed Card',
  } as CardProps,
  
  withAllFeatures: {
    tenantTheme: defaultTheme,
    children: <div>Card content with all features</div>,
    title: 'Feature Rich Card',
    description: 'This card has all the features',
    icon: '⭐',
    variant: 'elevated' as const,
    size: 'large' as const,
    padding: 'large' as const,
    shadow: 'large' as const,
    hover: true,
    clickable: true,
    onClick: () => console.log('Feature rich card clicked'),
    image: 'https://via.placeholder.com/400x300',
    imageAlt: 'Feature rich card image',
    header: <div>Custom header content</div>,
    footer: <div>Custom footer content</div>,
  } as CardProps,
};
