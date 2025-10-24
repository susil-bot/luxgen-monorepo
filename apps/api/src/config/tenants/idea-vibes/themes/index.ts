/**
 * Idea Vibes Tenant - Theme Configuration
 * Creative and vibrant UI themes
 */

export const ideaVibesThemes = {
  // Creative theme (default)
  creative: {
    name: 'Idea Vibes Creative',
    colors: {
      background: '#FFFFFF',
      surface: '#FAFAFA',
      primary: '#8B5CF6',
      secondary: '#F59E0B',
      accent: '#EC4899',
      text: {
        primary: '#1F2937',
        secondary: '#6B7280',
        muted: '#9CA3AF'
      },
      border: '#E5E7EB',
      shadow: 'rgba(139, 92, 246, 0.1)',
      gradient: {
        primary: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
        secondary: 'linear-gradient(135deg, #F59E0B 0%, #EC4899 100%)',
        creative: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 50%, #F59E0B 100%)'
      }
    },
    components: {
      button: {
        primary: {
          background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
          color: '#FFFFFF',
          hover: 'linear-gradient(135deg, #7C3AED 0%, #DB2777 100%)',
          border: 'none',
          borderRadius: '25px',
          boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)'
        },
        secondary: {
          background: 'transparent',
          color: '#8B5CF6',
          hover: 'rgba(139, 92, 246, 0.1)',
          border: '2px solid #8B5CF6',
          borderRadius: '25px'
        },
        creative: {
          background: 'linear-gradient(45deg, #8B5CF6, #EC4899, #F59E0B)',
          color: '#FFFFFF',
          hover: 'linear-gradient(45deg, #7C3AED, #DB2777, #D97706)',
          border: 'none',
          borderRadius: '30px',
          boxShadow: '0 8px 25px rgba(139, 92, 246, 0.4)',
          transform: 'scale(1.05)'
        }
      },
      card: {
        background: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: '20px',
        shadow: '0 10px 30px rgba(139, 92, 246, 0.1)',
        hover: {
          shadow: '0 20px 40px rgba(139, 92, 246, 0.2)',
          transform: 'translateY(-5px)'
        }
      },
      input: {
        background: '#FFFFFF',
        border: '2px solid #E5E7EB',
        borderRadius: '15px',
        focus: {
          border: '2px solid #8B5CF6',
          shadow: '0 0 0 4px rgba(139, 92, 246, 0.1)'
        }
      }
    }
  },

  // Dark creative theme
  darkCreative: {
    name: 'Idea Vibes Dark Creative',
    colors: {
      background: '#0F0F23',
      surface: '#1A1A2E',
      primary: '#A855F7',
      secondary: '#F59E0B',
      accent: '#EC4899',
      text: {
        primary: '#F8FAFC',
        secondary: '#CBD5E1',
        muted: '#94A3B8'
      },
      border: '#334155',
      shadow: 'rgba(139, 92, 246, 0.3)',
      gradient: {
        primary: 'linear-gradient(135deg, #A855F7 0%, #EC4899 100%)',
        secondary: 'linear-gradient(135deg, #F59E0B 0%, #EC4899 100%)',
        creative: 'linear-gradient(135deg, #A855F7 0%, #EC4899 50%, #F59E0B 100%)'
      }
    },
    components: {
      button: {
        primary: {
          background: 'linear-gradient(135deg, #A855F7 0%, #EC4899 100%)',
          color: '#FFFFFF',
          hover: 'linear-gradient(135deg, #9333EA 0%, #DB2777 100%)',
          border: 'none',
          borderRadius: '25px',
          boxShadow: '0 4px 15px rgba(168, 85, 247, 0.4)'
        },
        secondary: {
          background: 'transparent',
          color: '#A855F7',
          hover: 'rgba(168, 85, 247, 0.1)',
          border: '2px solid #A855F7',
          borderRadius: '25px'
        }
      },
      card: {
        background: '#1A1A2E',
        border: '1px solid #334155',
        borderRadius: '20px',
        shadow: '0 10px 30px rgba(139, 92, 246, 0.2)',
        hover: {
          shadow: '0 20px 40px rgba(139, 92, 246, 0.3)',
          transform: 'translateY(-5px)'
        }
      },
      input: {
        background: '#1A1A2E',
        border: '2px solid #334155',
        borderRadius: '15px',
        focus: {
          border: '2px solid #A855F7',
          shadow: '0 0 0 4px rgba(168, 85, 247, 0.1)'
        }
      }
    }
  },

  // Neon theme (high energy)
  neon: {
    name: 'Idea Vibes Neon',
    colors: {
      background: '#000000',
      surface: '#0A0A0A',
      primary: '#00FFFF',
      secondary: '#FF00FF',
      accent: '#FFFF00',
      text: {
        primary: '#FFFFFF',
        secondary: '#CCCCCC',
        muted: '#999999'
      },
      border: '#333333',
      shadow: 'rgba(0, 255, 255, 0.5)',
      glow: {
        primary: '0 0 20px #00FFFF',
        secondary: '0 0 20px #FF00FF',
        accent: '0 0 20px #FFFF00'
      }
    },
    components: {
      button: {
        primary: {
          background: '#00FFFF',
          color: '#000000',
          hover: '#00CCCC',
          border: '2px solid #00FFFF',
          borderRadius: '0px',
          boxShadow: '0 0 20px #00FFFF, inset 0 0 20px rgba(0, 255, 255, 0.3)'
        },
        secondary: {
          background: 'transparent',
          color: '#00FFFF',
          hover: 'rgba(0, 255, 255, 0.1)',
          border: '2px solid #00FFFF',
          borderRadius: '0px',
          boxShadow: '0 0 10px #00FFFF'
        }
      },
      card: {
        background: '#0A0A0A',
        border: '2px solid #333333',
        borderRadius: '0px',
        shadow: '0 0 30px rgba(0, 255, 255, 0.3)',
        hover: {
          shadow: '0 0 50px rgba(0, 255, 255, 0.5)',
          border: '2px solid #00FFFF'
        }
      },
      input: {
        background: '#0A0A0A',
        border: '2px solid #333333',
        borderRadius: '0px',
        focus: {
          border: '2px solid #00FFFF',
          boxShadow: '0 0 10px #00FFFF'
        }
      }
    }
  }
};

// Theme selector configuration
export const themeConfig = {
  default: 'creative',
  available: ['creative', 'darkCreative', 'neon'],
  autoDetect: true,
  persist: true,
  storageKey: 'idea-vibes-theme',
  allowCustomThemes: true
};
