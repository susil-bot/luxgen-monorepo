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

// Main function to get all styles for the UserRetentionTrends component
export const getUserRetentionStyles = (
  tenantTheme: TenantTheme,
  variant: 'default' | 'compact' | 'detailed',
  customColor?: string
) => {
  const variantStyles = getVariantStyles(variant);
  const lineColor = customColor || tenantTheme.colors.primary || '#3B82F6';

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
      marginBottom: '16px',
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

    legend: {
      display: 'flex',
      alignItems: 'center',
      gap: variantStyles.legendGap,
    },

    legendItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },

    legendColor: {
      width: '12px',
      height: '12px',
      borderRadius: '2px',
    },

    legendText: {
      fontSize: '0.875rem',
      color: tenantTheme.colors.textSecondary || '#64748B',
      fontWeight: '500',
    },

    lineColor, // Export the calculated line color
  };
};

// CSS classes for additional styling
export const userRetentionClasses = {
  container: 'user-retention-container',
  title: 'user-retention-title',
  chart: 'user-retention-chart',
  emptyState: 'user-retention-empty',
  legend: 'user-retention-legend',
  legendItem: 'user-retention-legend-item',
  legendColor: 'user-retention-legend-color',
  legendText: 'user-retention-legend-text',
};

// CSS styles for additional hover effects and animations
export const userRetentionCSS = `
  .user-retention-container {
    transition: all 0.2s ease;
  }

  .user-retention-container:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }

  .user-retention-chart circle {
    transition: all 0.2s ease;
  }

  .user-retention-chart circle:hover {
    r: 6;
    stroke-width: 3;
  }

  .user-retention-legend-item {
    transition: all 0.2s ease;
  }

  .user-retention-legend-item:hover {
    transform: scale(1.05);
  }
`;
