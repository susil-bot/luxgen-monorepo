import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TenantTheme } from '../config/centralized-tenants';

interface ThemeContextType {
  theme: TenantTheme;
  setTheme: (theme: TenantTheme) => void;
  applyTheme: (theme: TenantTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: TenantTheme;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  initialTheme 
}) => {
  const [theme, setTheme] = useState<TenantTheme>(initialTheme || {
    colors: {
      primary: '#3B82F6',
      secondary: '#1E40AF',
      accent: '#60A5FA',
      background: '#F8FAFC',
      surface: '#FFFFFF',
      text: '#1F2937',
      textSecondary: '#6B7280',
      border: '#E5E7EB',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
    },
    fonts: {
      primary: 'Inter, system-ui, sans-serif',
      secondary: 'Inter, system-ui, sans-serif',
      mono: 'JetBrains Mono, monospace',
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      xxl: '3rem',
    },
    borderRadius: {
      sm: '0.25rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    },
  });

  // Apply theme globally through CSS custom properties
  const applyTheme = (newTheme: TenantTheme) => {
    console.log('🎨 ThemeContext: applyTheme called with:', {
      primary: newTheme.colors.primary,
      secondary: newTheme.colors.secondary,
      background: newTheme.colors.background,
    });
    
    setTheme(newTheme);
    
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      
      // Debug: Log theme application
      console.log('🎨 Applying theme to DOM:', {
        primary: newTheme.colors.primary,
        secondary: newTheme.colors.secondary,
        background: newTheme.colors.background,
      });
      
      // Apply color variables with fallbacks
      root.style.setProperty('--color-primary', newTheme.colors?.primary || '#3B82F6');
      root.style.setProperty('--color-secondary', newTheme.colors?.secondary || '#10B981');
      root.style.setProperty('--color-accent', newTheme.colors?.accent || '#8B5CF6');
      root.style.setProperty('--color-background', newTheme.colors?.background || '#F8FAFC');
      root.style.setProperty('--color-surface', newTheme.colors?.surface || '#FFFFFF');
      root.style.setProperty('--color-text', newTheme.colors?.text || '#1F2937');
      root.style.setProperty('--color-text-secondary', newTheme.colors?.textSecondary || '#6B7280');
      root.style.setProperty('--color-border', newTheme.colors?.border || '#E5E7EB');
      root.style.setProperty('--color-success', newTheme.colors?.success || '#10B981');
      root.style.setProperty('--color-warning', newTheme.colors?.warning || '#F59E0B');
      root.style.setProperty('--color-error', newTheme.colors?.error || '#EF4444');
      
      // Apply font variables with fallbacks
      root.style.setProperty('--font-primary', newTheme.fonts?.primary || 'Inter');
      root.style.setProperty('--font-secondary', newTheme.fonts?.secondary || 'Inter');
      root.style.setProperty('--font-mono', newTheme.fonts?.mono || 'Fira Code');
      
      // Apply spacing variables
      root.style.setProperty('--spacing-xs', newTheme.spacing?.xs || '0.25rem');
      root.style.setProperty('--spacing-sm', newTheme.spacing?.sm || '0.5rem');
      root.style.setProperty('--spacing-md', newTheme.spacing?.md || '1rem');
      root.style.setProperty('--spacing-lg', newTheme.spacing?.lg || '1.5rem');
      root.style.setProperty('--spacing-xl', newTheme.spacing?.xl || '2rem');
      root.style.setProperty('--spacing-xxl', newTheme.spacing?.xxl || '3rem');
      
      // Apply border radius variables with fallbacks
      root.style.setProperty('--border-radius-sm', newTheme.borderRadius?.sm || '0.25rem');
      root.style.setProperty('--border-radius-md', newTheme.borderRadius?.md || '0.375rem');
      root.style.setProperty('--border-radius-lg', newTheme.borderRadius?.lg || '0.5rem');
      root.style.setProperty('--border-radius-xl', newTheme.borderRadius?.xl || '0.75rem');
      
      // Apply shadow variables with fallbacks
      root.style.setProperty('--shadow-sm', newTheme.shadows?.sm || '0 1px 2px 0 rgb(0 0 0 / 0.05)');
      root.style.setProperty('--shadow-md', newTheme.shadows?.md || '0 4px 6px -1px rgb(0 0 0 / 0.1)');
      root.style.setProperty('--shadow-lg', newTheme.shadows?.lg || '0 10px 15px -3px rgb(0 0 0 / 0.1)');
      root.style.setProperty('--shadow-xl', newTheme.shadows?.xl || '0 20px 25px -5px rgb(0 0 0 / 0.1)');
      
      // Verify CSS variables were applied
      setTimeout(() => {
        const appliedPrimary = getComputedStyle(root).getPropertyValue('--color-primary');
        const appliedBackground = getComputedStyle(root).getPropertyValue('--color-background');
        console.log('✅ CSS Variables Applied:', {
          primary: appliedPrimary,
          background: appliedBackground,
          expectedPrimary: newTheme.colors.primary,
          expectedBackground: newTheme.colors.background,
        });
      }, 100);
    }
  };

  // Apply theme on mount and when theme changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Update theme when initialTheme changes
  useEffect(() => {
    if (initialTheme) {
      console.log('🎨 ThemeContext: Updating theme from initialTheme:', {
        primary: initialTheme.colors.primary,
        background: initialTheme.colors.background,
      });
      setTheme(initialTheme);
      applyTheme(initialTheme);
    }
  }, [initialTheme]);

  const contextValue: ThemeContextType = {
    theme,
    setTheme,
    applyTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <div
        style={{
          backgroundColor: theme.colors.background,
          color: theme.colors.text,
          fontFamily: theme.fonts.primary,
          minHeight: '100vh',
          '--color-primary': theme.colors.primary,
          '--color-secondary': theme.colors.secondary,
          '--color-background': theme.colors.background,
        } as React.CSSProperties}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
