import { TenantTheme } from '../types';

// Helper function to get variant-specific styles
const getVariantStyles = (variant: 'default' | 'compact' | 'detailed') => {
  switch (variant) {
    case 'compact':
      return {
        containerPadding: '12px',
        titleSize: '1rem',
        chartSize: '150px',
        legendGap: '8px',
      };
    case 'detailed':
      return {
        containerPadding: '24px',
        titleSize: '1.25rem',
        chartSize: '250px',
        legendGap: '12px',
      };
    default: // default variant
      return {
        containerPadding: '20px',
        titleSize: '1.125rem',
        chartSize: '200px',
        legendGap: '10px',
      };
  }
};

// Main function to get all styles for the EngagementBreakdown component
export const getEngagementBreakdownStyles = (
  tenantTheme: TenantTheme,
  variant: 'default' | 'compact' | 'detailed',
  size: number
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

    title: {
      fontSize: variantStyles.titleSize,
      fontWeight: '600',
      color: tenantTheme.colors.text,
      margin: 0,
      marginBottom: '16px',
    },

    chart: {
      width: '100%',
      position: 'relative',
    },

    emptyState: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: size,
      backgroundColor: tenantTheme.colors.background || '#F8FAFC',
      borderRadius: '8px',
      border: `2px dashed ${tenantTheme.colors.border || '#E2E8F0'}`,
      color: tenantTheme.colors.textSecondary || '#64748B',
      fontSize: '0.875rem',
    },
  };
};

// CSS classes for additional styling
export const engagementBreakdownClasses = {
  container: 'engagement-breakdown-container',
  title: 'engagement-breakdown-title',
  chart: 'engagement-breakdown-chart',
  emptyState: 'engagement-breakdown-empty',
};

// CSS styles for additional hover effects and animations
export const engagementBreakdownCSS = `
  .engagement-breakdown-container {
    transition: all 0.2s ease;
  }

  .engagement-breakdown-container:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }

  .engagement-breakdown-chart path {
    transition: all 0.2s ease;
  }

  .engagement-breakdown-chart path:hover {
    stroke-width: 3;
    filter: brightness(1.1);
  }
`;
