// Asset component styles using Tailwind CSS classes
export const assetStyles = {
  // AssetImage component styles
  image: {
    container: 'relative inline-block',
    image: 'object-contain transition-opacity duration-300',
    loading: 'absolute inset-0 flex items-center justify-center bg-gray-200',
    loadingSpinner: 'animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600',
    error: 'flex items-center justify-center bg-gray-200 text-gray-500',
    errorText: 'text-sm',
    fadeIn: 'opacity-0',
    fadeInLoaded: 'opacity-100',
  },

  // AssetIcon component styles
  icon: {
    container: 'flex items-center justify-center',
    image: 'object-contain',
    placeholder: 'flex items-center justify-center bg-gray-100 text-gray-400',
    placeholderText: 'text-xs',
  },

  // AssetLogo component styles
  logo: {
    container: 'flex items-center',
    image: 'object-contain',
    text: 'ml-2 font-semibold text-lg',
    placeholder: 'flex items-center justify-center bg-gray-200 text-gray-500',
    placeholderText: 'text-xs',
  },

  // AssetBackground component styles
  background: {
    container: 'relative',
    overlay: 'absolute inset-0',
    overlayDark: 'bg-black',
    overlayLight: 'bg-white',
    overlayCustom: 'bg-opacity-50',
  },

  // Loading states
  loading: {
    spinner: 'animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600',
    pulse: 'animate-pulse bg-gray-200',
    skeleton: 'bg-gray-200 rounded',
  },

  // Error states
  error: {
    container: 'flex items-center justify-center bg-red-50 text-red-500',
    icon: 'h-6 w-6 text-red-400',
    text: 'text-sm font-medium',
    message: 'mt-1 text-xs text-red-600',
  },

  // Success states
  success: {
    container: 'flex items-center justify-center bg-green-50 text-green-500',
    icon: 'h-6 w-6 text-green-400',
    text: 'text-sm font-medium',
  },

  // Size variants
  size: {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-24 h-24',
    '3xl': 'w-32 h-32',
  },

  // Aspect ratios
  aspectRatio: {
    square: 'aspect-square',
    video: 'aspect-video',
    photo: 'aspect-[4/3]',
    wide: 'aspect-[16/9]',
    portrait: 'aspect-[3/4]',
  },

  // Responsive breakpoints
  responsive: {
    mobile: 'w-full h-auto',
    tablet: 'w-full h-auto',
    desktop: 'w-full h-auto',
  },

  // Animation variants
  animation: {
    fadeIn: 'animate-fade-in',
    slideUp: 'animate-slide-up',
    scaleIn: 'animate-scale-in',
    bounce: 'animate-bounce',
    pulse: 'animate-pulse',
    spin: 'animate-spin',
  },

  // Hover effects
  hover: {
    scale: 'hover:scale-105 transition-transform duration-200',
    opacity: 'hover:opacity-80 transition-opacity duration-200',
    shadow: 'hover:shadow-lg transition-shadow duration-200',
    brightness: 'hover:brightness-110 transition-all duration-200',
  },

  // Focus states
  focus: {
    ring: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
    ringOffset: 'focus:ring-offset-2',
  },

  // Accessibility
  accessibility: {
    screenReader: 'sr-only',
    highContrast: 'text-black bg-white',
    reducedMotion: 'motion-reduce:animate-none',
  },

  // Theme variants
  theme: {
    light: {
      background: 'bg-white',
      text: 'text-gray-900',
      border: 'border-gray-200',
      placeholder: 'bg-gray-100 text-gray-400',
    },
    dark: {
      background: 'bg-gray-900',
      text: 'text-white',
      border: 'border-gray-700',
      placeholder: 'bg-gray-800 text-gray-500',
    },
  },

  // Asset type specific styles
  assetType: {
    image: {
      container: 'relative overflow-hidden rounded-lg',
      image: 'w-full h-full object-cover',
    },
    icon: {
      container: 'flex items-center justify-center',
      icon: 'w-full h-full',
    },
    logo: {
      container: 'flex items-center space-x-2',
      logo: 'h-8 w-auto',
      text: 'text-lg font-semibold',
    },
    background: {
      container: 'relative w-full h-full',
      image: 'absolute inset-0 w-full h-full object-cover',
    },
    illustration: {
      container: 'flex items-center justify-center',
      illustration: 'w-full h-full object-contain',
    },
  },

  // Utility classes
  utilities: {
    center: 'flex items-center justify-center',
    centerText: 'text-center',
    fullWidth: 'w-full',
    fullHeight: 'h-full',
    absoluteCenter: 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
    relative: 'relative',
    absolute: 'absolute',
    fixed: 'fixed',
    sticky: 'sticky',
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
  
  @keyframes scale-in {
    from { 
      opacity: 0; 
      transform: scale(0.9); 
    }
    to { 
      opacity: 1; 
      transform: scale(1); 
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
export const getSizeStyles = (size: number | string) => {
  const sizeValue = typeof size === 'number' ? `${size}px` : size;
  return {
    width: sizeValue,
    height: sizeValue,
  };
};

export const getAspectRatioStyles = (ratio: string) => {
  const ratios: { [key: string]: string } = {
    square: 'aspect-square',
    video: 'aspect-video',
    photo: 'aspect-[4/3]',
    wide: 'aspect-[16/9]',
    portrait: 'aspect-[3/4]',
  };
  
  return ratios[ratio] || 'aspect-square';
};

export const getAnimationStyles = (animation: string) => {
  const animations: { [key: string]: string } = {
    fadeIn: assetStyles.animation.fadeIn,
    slideUp: assetStyles.animation.slideUp,
    scaleIn: assetStyles.animation.scaleIn,
    bounce: assetStyles.animation.bounce,
    pulse: assetStyles.animation.pulse,
    spin: assetStyles.animation.spin,
  };
  
  return animations[animation] || '';
};

export const getHoverStyles = (hover: string) => {
  const hovers: { [key: string]: string } = {
    scale: assetStyles.hover.scale,
    opacity: assetStyles.hover.opacity,
    shadow: assetStyles.hover.shadow,
    brightness: assetStyles.hover.brightness,
  };
  
  return hovers[hover] || '';
};

export const getThemeStyles = (theme: 'light' | 'dark') => {
  return assetStyles.theme[theme];
};

export const getAssetTypeStyles = (type: string) => {
  const types: { [key: string]: any } = {
    image: assetStyles.assetType.image,
    icon: assetStyles.assetType.icon,
    logo: assetStyles.assetType.logo,
    background: assetStyles.assetType.background,
    illustration: assetStyles.assetType.illustration,
  };
  
  return types[type] || assetStyles.assetType.image;
};

// Responsive utility functions
export const getResponsiveStyles = (breakpoint: 'mobile' | 'tablet' | 'desktop') => {
  return assetStyles.responsive[breakpoint];
};

// Accessibility utility functions
export const getAccessibilityStyles = (level: 'basic' | 'enhanced' | 'high-contrast') => {
  const levels: { [key: string]: string } = {
    basic: assetStyles.accessibility.screenReader,
    enhanced: `${assetStyles.accessibility.screenReader} ${assetStyles.focus.ring}`,
    'high-contrast': `${assetStyles.accessibility.screenReader} ${assetStyles.accessibility.highContrast}`,
  };
  
  return levels[level] || assetStyles.accessibility.screenReader;
};
