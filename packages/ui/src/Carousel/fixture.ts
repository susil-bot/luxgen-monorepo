import { CarouselProps, CarouselItem } from './Carousel';
import { defaultTheme } from '../theme';

const sampleItems: CarouselItem[] = [
  {
    id: '1',
    content: <div style={{ padding: '2rem', textAlign: 'center', background: '#f3f4f6', borderRadius: '0.5rem' }}>Slide 1 Content</div>,
    title: 'Slide 1',
    description: 'First slide description',
  },
  {
    id: '2',
    content: <div style={{ padding: '2rem', textAlign: 'center', background: '#e5e7eb', borderRadius: '0.5rem' }}>Slide 2 Content</div>,
    title: 'Slide 2',
    description: 'Second slide description',
  },
  {
    id: '3',
    content: <div style={{ padding: '2rem', textAlign: 'center', background: '#d1d5db', borderRadius: '0.5rem' }}>Slide 3 Content</div>,
    title: 'Slide 3',
    description: 'Third slide description',
  },
];

export const carouselFixtures = {
  default: {
    tenantTheme: defaultTheme,
    items: sampleItems,
  } as CarouselProps,
  
  withAutoPlay: {
    tenantTheme: defaultTheme,
    items: sampleItems,
    autoPlay: true,
    autoPlayInterval: 2000,
  } as CarouselProps,
  
  withArrows: {
    tenantTheme: defaultTheme,
    items: sampleItems,
    showArrows: true,
  } as CarouselProps,
  
  withDots: {
    tenantTheme: defaultTheme,
    items: sampleItems,
    showDots: true,
  } as CarouselProps,
  
  withThumbnails: {
    tenantTheme: defaultTheme,
    items: sampleItems,
    showThumbnails: true,
  } as CarouselProps,
  
  withMultipleSlides: {
    tenantTheme: defaultTheme,
    items: sampleItems,
    slidesToShow: 2,
    slidesToScroll: 1,
  } as CarouselProps,
  
  withoutInfinite: {
    tenantTheme: defaultTheme,
    items: sampleItems,
    infinite: false,
  } as CarouselProps,
  
  withCallbacks: {
    tenantTheme: defaultTheme,
    items: sampleItems,
    onSlideChange: (index: number) => console.log('Slide changed to:', index),
    onItemClick: (item: CarouselItem, index: number) => console.log('Item clicked:', item, index),
  } as CarouselProps,
  
  withCustomTheme: {
    tenantTheme: {
      ...defaultTheme,
      colors: {
        ...defaultTheme.colors,
        primary: '#8B5CF6',
      },
    },
    items: sampleItems,
  } as CarouselProps,
  
  singleItem: {
    tenantTheme: defaultTheme,
    items: [sampleItems[0]],
  } as CarouselProps,
  
  emptyItems: {
    tenantTheme: defaultTheme,
    items: [],
  } as CarouselProps,
  
  withAllFeatures: {
    tenantTheme: defaultTheme,
    items: sampleItems,
    autoPlay: true,
    autoPlayInterval: 3000,
    showArrows: true,
    showDots: true,
    showThumbnails: true,
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    onSlideChange: (index: number) => console.log('Slide changed to:', index),
    onItemClick: (item: CarouselItem, index: number) => console.log('Item clicked:', item, index),
  } as CarouselProps,
};
