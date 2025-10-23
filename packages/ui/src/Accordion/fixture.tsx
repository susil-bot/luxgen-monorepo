import { AccordionProps, AccordionItem } from './Accordion';
import { defaultTheme } from '../theme';

const sampleItems: AccordionItem[] = [
  {
    id: '1',
    title: 'Accordion Item 1',
    content: <div>Content for accordion item 1</div>,
    disabled: false,
    defaultOpen: false,
  },
  {
    id: '2',
    title: 'Accordion Item 2',
    content: <div>Content for accordion item 2</div>,
    disabled: false,
    defaultOpen: true,
  },
  {
    id: '3',
    title: 'Accordion Item 3',
    content: <div>Content for accordion item 3</div>,
    disabled: true,
    defaultOpen: false,
  },
];

export const accordionFixtures = {
  default: {
    tenantTheme: defaultTheme,
    items: sampleItems,
  } as AccordionProps,
  
  withMultiple: {
    tenantTheme: defaultTheme,
    items: sampleItems,
    allowMultiple: true,
  } as AccordionProps,
  
  withNone: {
    tenantTheme: defaultTheme,
    items: sampleItems,
    allowNone: false,
  } as AccordionProps,
  
  bordered: {
    tenantTheme: defaultTheme,
    items: sampleItems,
    variant: 'bordered' as const,
  } as AccordionProps,
  
  filled: {
    tenantTheme: defaultTheme,
    items: sampleItems,
    variant: 'filled' as const,
  } as AccordionProps,
  
  minimal: {
    tenantTheme: defaultTheme,
    items: sampleItems,
    variant: 'minimal' as const,
  } as AccordionProps,
  
  small: {
    tenantTheme: defaultTheme,
    items: sampleItems,
    size: 'small' as const,
  } as AccordionProps,
  
  medium: {
    tenantTheme: defaultTheme,
    items: sampleItems,
    size: 'medium' as const,
  } as AccordionProps,
  
  large: {
    tenantTheme: defaultTheme,
    items: sampleItems,
    size: 'large' as const,
  } as AccordionProps,
  
  withLeftIcon: {
    tenantTheme: defaultTheme,
    items: sampleItems,
    iconPosition: 'left' as const,
  } as AccordionProps,
  
  withRightIcon: {
    tenantTheme: defaultTheme,
    items: sampleItems,
    iconPosition: 'right' as const,
  } as AccordionProps,
  
  withoutIcon: {
    tenantTheme: defaultTheme,
    items: sampleItems,
    showIcon: false,
  } as AccordionProps,
  
  withCallbacks: {
    tenantTheme: defaultTheme,
    items: sampleItems,
    onToggle: (itemId: string, isOpen: boolean) => console.log('Toggle:', itemId, isOpen),
    onItemClick: (item: AccordionItem, index: number) => console.log('Item clicked:', item, index),
  } as AccordionProps,
  
  withCustomTheme: {
    tenantTheme: {
      ...defaultTheme,
      colors: {
        ...defaultTheme.colors,
        primary: '#8B5CF6',
      },
    },
    items: sampleItems,
  } as AccordionProps,
  
  singleItem: {
    tenantTheme: defaultTheme,
    items: [sampleItems[0]],
  } as AccordionProps,
  
  emptyItems: {
    tenantTheme: defaultTheme,
    items: [],
  } as AccordionProps,
  
  withAllFeatures: {
    tenantTheme: defaultTheme,
    items: sampleItems,
    allowMultiple: true,
    allowNone: true,
    variant: 'bordered' as const,
    size: 'large' as const,
    iconPosition: 'left' as const,
    showIcon: true,
    onToggle: (itemId: string, isOpen: boolean) => console.log('Toggle:', itemId, isOpen),
    onItemClick: (item: AccordionItem, index: number) => console.log('Item clicked:', item, index),
  } as AccordionProps,
};
