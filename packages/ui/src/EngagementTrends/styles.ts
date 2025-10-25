import { TenantTheme } from '../types';

// Helper function to get variant-specific styles
const getVariantStyles = (variant: 'default' | 'compact' | 'detailed') => {
  switch (variant) {
    case 'compact':
      return {
        containerPadding: '12px',
        titleSize: '1rem',
        chartHeight: '200px',
        legendGap: '8px',
      };
    case 'detailed':
      return {
        containerPadding: '24px',
        titleSize: '1.25rem',
        chartHeight: '400px',
        legendGap: '12px',
      };
    default: // default variant
      return {
        containerPadding: '20px',
        titleSize: '1.125rem',
        chartHeight: '300px',
        legendGap: '10px',
      };
  }
};

// Main function to get all styles for the EngagementTrends component
export const getEngagementTrendsStyles = (
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
      height: variantStyles.chartHeight,
      backgroundColor: tenantTheme.colors.background || '#F8FAFC',
      borderRadius: '8px',
      border: `2px dashed ${tenantTheme.colors.border || '#E2E8F0'}`,
      color: tenantTheme.colors.textSecondary || '#64748B',
      fontSize: '0.875rem',
    },

    interactionsColor: '#3B82F6',
    completionsColor: '#10B981',
  };
};

// CSS classes for additional styling
export const engagementTrendsClasses = {
  container: 'engagement-trends-container',
  title: 'engagement-trends-title',
  chart: 'engagement-trends-chart',
  emptyState: 'engagement-trends-empty',
};

// CSS styles for additional hover effects and animations
export const engagementTrendsCSS = `
  .engagement-trends-container {
    transition: all 0.2s ease;
  }

  .engagement-trends-container:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }

  .engagement-trends-chart rect {
    transition: all 0.2s ease;
  }

  .engagement-trends-chart rect:hover {
    filter: brightness(1.1);
    stroke: #FFFFFF;
    stroke-width: 1;
  }
`;
