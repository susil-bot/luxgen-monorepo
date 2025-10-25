import { TenantTheme } from '../types';

// Helper function to get variant-specific styles
const getVariantStyles = (variant: 'default' | 'compact' | 'detailed') => {
  switch (variant) {
    case 'compact':
      return {
        containerPadding: '12px',
        titleSize: '1rem',
        avatarSize: '28px',
        itemPadding: '8px',
        nameSize: '0.75rem',
        emailSize: '0.75rem',
        buttonPadding: '4px 8px',
        buttonSize: '0.75rem',
      };
    case 'detailed':
      return {
        containerPadding: '24px',
        titleSize: '1.25rem',
        avatarSize: '40px',
        itemPadding: '16px',
        nameSize: '1rem',
        emailSize: '0.875rem',
        buttonPadding: '8px 16px',
        buttonSize: '0.875rem',
      };
    default: // default variant
      return {
        containerPadding: '20px',
        titleSize: '1.125rem',
        avatarSize: '32px',
        itemPadding: '12px',
        nameSize: '0.875rem',
        emailSize: '0.75rem',
        buttonPadding: '6px 12px',
        buttonSize: '0.75rem',
      };
  }
};

// Main function to get all styles for the PermissionRequest component
export const getPermissionRequestStyles = (
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
    },

    requestItem: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      padding: variantStyles.itemPadding,
      borderBottom: `1px solid ${tenantTheme.colors.border || '#E2E8F0'}`,
    },

    requestUser: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },

    requestAvatar: {
      width: variantStyles.avatarSize,
      height: variantStyles.avatarSize,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#FFFFFF',
      fontWeight: '600',
      fontSize: '0.75rem',
      flexShrink: 0,
    },

    requestActions: {
      display: 'flex',
      gap: '8px',
      justifyContent: 'flex-end',
    },

    requestButton: {
      padding: variantStyles.buttonPadding,
      borderRadius: '6px',
      fontSize: variantStyles.buttonSize,
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      border: 'none',
    },

    approveButton: {
      backgroundColor: '#10B981',
      color: '#FFFFFF',
    },

    denyButton: {
      backgroundColor: '#EF4444',
      color: '#FFFFFF',
    },
  };
};

// CSS classes for additional styling
export const permissionRequestClasses = {
  container: 'permission-request-container',
  title: 'permission-request-title',
  requestItem: 'permission-request-item',
  requestUser: 'permission-request-user',
  requestAvatar: 'permission-request-avatar',
  requestActions: 'permission-request-actions',
  requestButton: 'permission-request-button',
  approveButton: 'permission-request-approve',
  denyButton: 'permission-request-deny',
};

// CSS styles for additional hover effects and animations
export const permissionRequestCSS = `
  .permission-request-container {
    transition: all 0.2s ease;
  }

  .permission-request-container:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }

  .permission-request-button {
    transition: all 0.2s ease;
  }

  .permission-request-button:hover {
    opacity: 0.8;
    transform: scale(1.05);
  }

  .permission-request-avatar {
    transition: all 0.2s ease;
  }

  .permission-request-item:hover .permission-request-avatar {
    transform: scale(1.1);
  }
`;