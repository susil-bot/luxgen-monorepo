// NotFound component styles using Tailwind CSS classes
export const notFoundStyles = {
  // Main container styles
  container: 'min-h-screen flex items-center justify-center px-4 py-8',
  
  // Content wrapper styles
  content: 'max-w-2xl w-full',
  
  // Illustration styles
  illustration: {
    wrapper: 'flex justify-center mb-8',
    container: 'relative',
    number: 'text-9xl font-bold text-gray-200 select-none',
    icon: 'absolute inset-0 flex items-center justify-center',
    iconSvg: 'w-32 h-32 text-gray-300',
  },
  
  // Title styles
  title: {
    default: 'text-4xl font-bold text-gray-900 mb-4',
    detailed: 'text-5xl font-bold text-gray-900 mb-6',
    minimal: 'text-4xl font-bold text-gray-900 mb-4',
  },
  
  // Description styles
  description: {
    default: 'text-lg text-gray-600 mb-8 max-w-xl mx-auto',
    detailed: 'text-xl text-gray-600 mb-8 max-w-2xl mx-auto',
    minimal: 'text-gray-600 mb-8',
  },
  
  // Search form styles
  search: {
    form: 'mb-8',
    container: 'flex max-w-sm mx-auto',
    detailedContainer: 'flex max-w-md mx-auto',
    input: 'flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
    button: 'px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition-colors',
    detailedButton: 'px-6 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition-colors',
  },
  
  // Navigation button styles
  navigation: {
    container: 'flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4',
    detailedContainer: 'flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4',
    minimalContainer: 'flex justify-center space-x-4',
    backButton: 'px-5 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors',
    detailedBackButton: 'px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors',
    minimalBackButton: 'px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors',
    homeButton: 'px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors',
    detailedHomeButton: 'px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors',
    minimalHomeButton: 'px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors',
  },
  
  // Custom actions styles
  customActions: {
    container: 'mt-6',
    detailedContainer: 'mt-8',
  },
  
  // Help text styles
  helpText: {
    container: 'mt-8 text-center',
    text: 'text-sm text-gray-500 mb-4',
    actionsContainer: 'flex flex-wrap justify-center gap-2',
    actionButton: 'px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors',
  },
  
  // Responsive styles
  responsive: {
    mobile: 'flex-col',
    tablet: 'flex-col',
    desktop: 'flex-row',
  },
  
  // Animation styles
  animation: {
    fadeIn: 'opacity-0 animate-fade-in',
    slideUp: 'transform translate-y-4 animate-slide-up',
    bounce: 'animate-bounce',
  },
  
  // Loading states
  loading: {
    spinner: 'animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600',
    overlay: 'absolute inset-0 flex items-center justify-center bg-gray-200',
    image: 'opacity-0 transition-opacity duration-300',
    imageLoaded: 'opacity-100 transition-opacity duration-300',
  },
  
  // Error states
  error: {
    container: 'flex items-center justify-center bg-gray-200 text-gray-500',
    text: 'text-sm',
  },
  
  // Accessibility styles
  accessibility: {
    focusRing: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
    screenReader: 'sr-only',
    highContrast: 'text-black bg-white',
  },
  
  // Theme variants
  theme: {
    light: {
      background: 'bg-white',
      text: 'text-gray-900',
      muted: 'text-gray-600',
      border: 'border-gray-300',
    },
    dark: {
      background: 'bg-gray-900',
      text: 'text-white',
      muted: 'text-gray-400',
      border: 'border-gray-600',
    },
  },
  
  // Size variants
  size: {
    small: {
      title: 'text-2xl',
      description: 'text-sm',
      button: 'px-3 py-1 text-sm',
    },
    medium: {
      title: 'text-4xl',
      description: 'text-lg',
      button: 'px-5 py-2',
    },
    large: {
      title: 'text-6xl',
      description: 'text-xl',
      button: 'px-8 py-3 text-lg',
    },
  },
};

// Animation keyframes (to be used with CSS-in-JS or added to global CSS)
export const animationKeyframes = `
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slide-up {
    from { 
      opacity: 0; 
      transform: translateY(20px); 
    }
    to { 
      opacity: 1; 
      transform: translateY(0); 
    }
  }
  
  @keyframes bounce {
    0%, 20%, 53%, 80%, 100% {
      transform: translate3d(0,0,0);
    }
    40%, 43% {
      transform: translate3d(0, -30px, 0);
    }
    70% {
      transform: translate3d(0, -15px, 0);
    }
    90% {
      transform: translate3d(0, -4px, 0);
    }
  }
`;

// Utility functions for dynamic styling
export const getVariantStyles = (variant: 'default' | 'minimal' | 'detailed') => {
  const baseStyles = {
    title: notFoundStyles.title[variant],
    description: notFoundStyles.description[variant],
    search: variant === 'detailed' ? notFoundStyles.search.detailedContainer : notFoundStyles.search.container,
    navigation: notFoundStyles.navigation[`${variant}Container` as keyof typeof notFoundStyles.navigation],
  };
  
  return baseStyles;
};

export const getSizeStyles = (size: 'small' | 'medium' | 'large') => {
  return notFoundStyles.size[size];
};

export const getThemeStyles = (theme: 'light' | 'dark') => {
  return notFoundStyles.theme[theme];
};

// Responsive breakpoint utilities
export const getResponsiveStyles = (breakpoint: 'mobile' | 'tablet' | 'desktop') => {
  return notFoundStyles.responsive[breakpoint];
};

// Animation utilities
export const getAnimationStyles = (animation: 'fadeIn' | 'slideUp' | 'bounce') => {
  return notFoundStyles.animation[animation];
};
