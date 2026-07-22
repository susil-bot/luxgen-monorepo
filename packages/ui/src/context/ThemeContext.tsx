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

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, initialTheme }) => {
  const [theme, setTheme] = useState<TenantTheme>(
    initialTheme || {
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
    },
  );

  // Theme state for components that read tenant branding; DOM tokens applied by web TenantThemeBridge.
  const applyTheme = (newTheme: TenantTheme) => {
    setTheme(newTheme);
  };

  useEffect(() => {
    if (initialTheme) {
      setTheme(initialTheme);
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
        style={
          {
            backgroundColor: 'var(--color-bg-primary)',
            color: 'var(--color-label-primary)',
            fontFamily: theme.fonts.primary,
            minHeight: '100vh',
          } as React.CSSProperties
        }
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
