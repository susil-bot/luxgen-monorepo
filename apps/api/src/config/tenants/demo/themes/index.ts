/**
 * Demo Tenant - Theme Configuration
 * UI themes and styling configurations
 */

export const demoThemes = {
  // Light theme (default)
  light: {
    name: 'Demo Light',
    colors: {
      background: '#FFFFFF',
      surface: '#F8FAFC',
      primary: '#1E40AF',
      secondary: '#64748B',
      accent: '#059669',
      text: {
        primary: '#0F172A',
        secondary: '#475569',
        muted: '#94A3B8'
      },
      border: '#E2E8F0',
      shadow: 'rgba(0, 0, 0, 0.1)'
    },
    components: {
      button: {
        primary: {
          background: '#1E40AF',
          color: '#FFFFFF',
          hover: '#1E3A8A',
          border: 'none',
          borderRadius: '0.375rem'
        },
        secondary: {
          background: 'transparent',
          color: '#1E40AF',
          hover: '#F1F5F9',
          border: '1px solid #1E40AF',
          borderRadius: '0.375rem'
        }
      },
      card: {
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '0.5rem',
        shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      },
      input: {
        background: '#FFFFFF',
        border: '1px solid #D1D5DB',
        borderRadius: '0.375rem',
        focus: {
          border: '2px solid #1E40AF',
          shadow: '0 0 0 3px rgba(30, 64, 175, 0.1)'
        }
      }
    }
  },

  // Dark theme
  dark: {
    name: 'Demo Dark',
    colors: {
      background: '#0F172A',
      surface: '#1E293B',
      primary: '#3B82F6',
      secondary: '#94A3B8',
      accent: '#10B981',
      text: {
        primary: '#F8FAFC',
        secondary: '#CBD5E1',
        muted: '#64748B'
      },
      border: '#334155',
      shadow: 'rgba(0, 0, 0, 0.3)'
    },
    components: {
      button: {
        primary: {
          background: '#3B82F6',
          color: '#FFFFFF',
          hover: '#2563EB',
          border: 'none',
          borderRadius: '0.375rem'
        },
        secondary: {
          background: 'transparent',
          color: '#3B82F6',
          hover: '#1E293B',
          border: '1px solid #3B82F6',
          borderRadius: '0.375rem'
        }
      },
      card: {
        background: '#1E293B',
        border: '1px solid #334155',
        borderRadius: '0.5rem',
        shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      },
      input: {
        background: '#1E293B',
        border: '1px solid #475569',
        borderRadius: '0.375rem',
        focus: {
          border: '2px solid #3B82F6',
          shadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
        }
      }
    }
  },

  // High contrast theme (accessibility)
  highContrast: {
    name: 'Demo High Contrast',
    colors: {
      background: '#FFFFFF',
      surface: '#F0F0F0',
      primary: '#0000FF',
      secondary: '#000000',
      accent: '#FF0000',
      text: {
        primary: '#000000',
        secondary: '#333333',
        muted: '#666666'
      },
      border: '#000000',
      shadow: 'rgba(0, 0, 0, 0.5)'
    },
    components: {
      button: {
        primary: {
          background: '#0000FF',
          color: '#FFFFFF',
          hover: '#0000CC',
          border: '2px solid #000000',
          borderRadius: '0.25rem'
        },
        secondary: {
          background: 'transparent',
          color: '#000000',
          hover: '#F0F0F0',
          border: '2px solid #000000',
          borderRadius: '0.25rem'
        }
      },
      card: {
        background: '#FFFFFF',
        border: '2px solid #000000',
        borderRadius: '0.25rem',
        shadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
      },
      input: {
        background: '#FFFFFF',
        border: '2px solid #000000',
        borderRadius: '0.25rem',
        focus: {
          border: '3px solid #0000FF',
          shadow: '0 0 0 2px #0000FF'
        }
      }
    }
  }
};

// Theme selector configuration
export const themeConfig = {
  default: 'light',
  available: ['light', 'dark', 'highContrast'],
  autoDetect: true,
  persist: true,
  storageKey: 'demo-theme'
};
