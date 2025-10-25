import { TenantTheme } from '../types';

// Helper function to get variant-specific styles
const getVariantStyles = (variant: 'default' | 'compact' | 'detailed') => {
  switch (variant) {
    case 'compact':
      return {
        containerPadding: '12px',
        titleSize: '1rem',
        headerGap: '8px',
        buttonPadding: '6px 12px',
        buttonSize: '0.75rem',
      };
    case 'detailed':
      return {
        containerPadding: '24px',
        titleSize: '1.25rem',
        headerGap: '12px',
        buttonPadding: '10px 20px',
        buttonSize: '1rem',
      };
    default: // default variant
      return {
        containerPadding: '20px',
        titleSize: '1.125rem',
        headerGap: '10px',
        buttonPadding: '8px 16px',
        buttonSize: '0.875rem',
      };
  }
};

// Main function to get all styles for the LastSurvey component
export const getLastSurveyStyles = (
  tenantTheme: TenantTheme,
  variant: 'default' | 'compact' | 'detailed'
) => {
  const variantStyles = getVariantStyles(variant);

  return {
    container: {
      backgroundColor: tenantTheme.colors.surface || '#FFFFFF',
      borderRadius: '12px',
      padding: variantStyles.containerPadding,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
      border: `1px solid ${tenantTheme.colors.border || '#E2E8F0'}`,
      fontFamily: tenantTheme.fonts.primary,
      color: tenantTheme.colors.text,
    },

    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px',
      gap: variantStyles.headerGap,
    },

    title: {
      fontSize: variantStyles.titleSize,
      fontWeight: '600',
      color: tenantTheme.colors.text,
      margin: 0,
    },

    status: {
      padding: '4px 8px',
      borderRadius: '6px',
      fontSize: '0.75rem',
      fontWeight: '500',
      whiteSpace: 'nowrap',
    },

    progress: {
      marginBottom: '16px',
    },

    progressBar: {
      width: '100%',
      height: '8px',
      backgroundColor: tenantTheme.colors.border || '#E2E8F0',
      borderRadius: '4px',
      overflow: 'hidden',
      marginBottom: '8px',
    },

    progressFill: {
      height: '100%',
      backgroundColor: tenantTheme.colors.primary,
      borderRadius: '4px',
      transition: 'width 0.3s ease',
    },

    progressText: {
      fontSize: '0.875rem',
      color: tenantTheme.colors.textSecondary || '#64748B',
      margin: 0,
    },
  };
};

// CSS classes for additional styling
export const lastSurveyClasses = {
  container: 'last-survey-container',
  header: 'last-survey-header',
  title: 'last-survey-title',
  status: 'last-survey-status',
  progress: 'last-survey-progress',
  progressBar: 'last-survey-progress-bar',
  progressFill: 'last-survey-progress-fill',
  progressText: 'last-survey-progress-text',
};

// CSS styles for additional hover effects and animations
export const lastSurveyCSS = `
  .last-survey-container {
    transition: all 0.2s ease;
  }

  .last-survey-container:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }

  .last-survey-container button {
    transition: all 0.2s ease;
  }

  .last-survey-container button:hover {
    transform: translateY(-1px);
    opacity: 0.9;
  }

  .last-survey-progress-fill {
    transition: width 0.3s ease;
  }
`;