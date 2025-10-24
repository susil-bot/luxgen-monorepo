/**
 * Idea Vibes Tenant - Brand Configuration
 * Creative and vibrant branding for innovation platform
 */

export const ideaVibesBrandConfig = {
  // Primary brand colors
  colors: {
    primary: '#8B5CF6',      // Vibrant purple
    secondary: '#F59E0B',     // Amber
    accent: '#EC4899',       // Pink
    success: '#10B981',      // Green
    warning: '#F59E0B',      // Amber
    error: '#EF4444',        // Red
    info: '#3B82F6',         // Blue
    creative: {
      purple: '#8B5CF6',
      pink: '#EC4899',
      orange: '#F59E0B',
      teal: '#14B8A6',
      indigo: '#6366F1'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
      secondary: 'linear-gradient(135deg, #F59E0B 0%, #EC4899 100%)',
      creative: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 50%, #F59E0B 100%)'
    }
  },

  // Typography
  typography: {
    fontFamily: {
      primary: 'Poppins, system-ui, sans-serif',
      secondary: 'Inter, system-ui, sans-serif',
      creative: 'Space Grotesk, sans-serif',
      mono: 'JetBrains Mono, monospace'
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
      '7xl': '4.5rem'
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900
    },
    lineHeight: {
      tight: 1.1,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2
    }
  },

  // Spacing system
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
    '4xl': '6rem',
    '5xl': '8rem',
    '6xl': '12rem'
  },

  // Border radius (more rounded for creative feel)
  borderRadius: {
    none: '0',
    sm: '0.25rem',
    base: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
    '2xl': '2rem',
    '3xl': '3rem',
    full: '9999px'
  },

  // Shadows (more dramatic for creative platform)
  shadows: {
    sm: '0 2px 4px 0 rgba(139, 92, 246, 0.1)',
    base: '0 4px 8px 0 rgba(139, 92, 246, 0.15)',
    md: '0 8px 16px 0 rgba(139, 92, 246, 0.2)',
    lg: '0 16px 32px 0 rgba(139, 92, 246, 0.25)',
    xl: '0 24px 48px 0 rgba(139, 92, 246, 0.3)',
    '2xl': '0 32px 64px 0 rgba(139, 92, 246, 0.35)',
    creative: '0 20px 40px 0 rgba(139, 92, 246, 0.3), 0 0 0 1px rgba(236, 72, 153, 0.1)',
    glow: '0 0 20px rgba(139, 92, 246, 0.5)'
  },

  // Animation and transitions
  animations: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms'
    },
    easing: {
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    }
  }
};
