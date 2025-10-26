import { CSSProperties } from 'react';
import { LogoutStylesProps } from './types';

export const getLogoutStyles = ({ variant, disabled, loading }: LogoutStylesProps) => {
  const baseStyles: CSSProperties = {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSize: '14px',
    lineHeight: '1.5',
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'compact':
        return {
          container: {
            ...baseStyles,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          },
          logoutButton: {
            padding: '6px 12px',
            fontSize: '12px',
            minHeight: '32px',
          },
          buttonText: {
            fontSize: '12px',
          },
        };
      case 'minimal':
        return {
          container: {
            ...baseStyles,
            display: 'flex',
            alignItems: 'center',
          },
          logoutButton: {
            padding: '4px',
            minWidth: '32px',
            minHeight: '32px',
            borderRadius: '6px',
            border: 'none',
            background: 'transparent',
            color: '#6b7280',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
            transition: 'all 0.2s ease',
          },
          buttonText: {
            display: 'none',
          },
        };
      case 'danger':
        return {
          container: {
            ...baseStyles,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          },
          logoutButton: {
            background: '#dc2626',
            color: 'white',
            border: '1px solid #dc2626',
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
            transition: 'all 0.2s ease',
            minHeight: '40px',
          },
          confirmButton: {
            background: '#dc2626',
            color: 'white',
            border: '1px solid #dc2626',
          },
        };
      default:
        return {
          container: {
            ...baseStyles,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          },
          logoutButton: {
            background: '#f3f4f6',
            color: '#374151',
            border: '1px solid #d1d5db',
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
            transition: 'all 0.2s ease',
            minHeight: '40px',
          },
          confirmButton: {
            background: '#dc2626',
            color: 'white',
            border: '1px solid #dc2626',
          },
        };
    }
  };

  const variantStyles = getVariantStyles();

  return {
    container: {
      ...variantStyles.container,
    },
    logoutButton: {
      ...variantStyles.logoutButton,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      border: 'none',
      outline: 'none',
      ...(disabled && {
        cursor: 'not-allowed',
        opacity: 0.5,
      }),
      ...(loading && {
        cursor: 'wait',
        opacity: 0.7,
      }),
      ':hover': !disabled && !loading ? {
        background: variant === 'danger' ? '#b91c1c' : '#e5e7eb',
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      } : {},
    },
    buttonContent: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    logoutIcon: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '16px',
      height: '16px',
    },
    loadingSpinner: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '16px',
      height: '16px',
    },
    buttonText: {
      ...variantStyles.buttonText,
      fontWeight: '500',
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 12px',
      background: '#f9fafb',
      borderRadius: '6px',
      border: '1px solid #e5e7eb',
    },
    userAvatar: {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#e5e7eb',
    },
    avatarImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
    avatarInitials: {
      fontSize: '12px',
      fontWeight: '600',
      color: '#6b7280',
    },
    userDetails: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
    },
    userName: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#111827',
    },
    userRole: {
      fontSize: '12px',
      color: '#6b7280',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },
    confirmation: {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      border: '1px solid #e5e7eb',
      zIndex: 1000,
      minWidth: '400px',
      maxWidth: '500px',
    },
    confirmationContent: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '16px',
      padding: '24px',
    },
    confirmationIcon: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      background: '#fef3c7',
      color: '#f59e0b',
      flexShrink: 0,
    },
    confirmationText: {
      flex: 1,
    },
    confirmationTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#111827',
      margin: '0 0 8px 0',
    },
    confirmationMessage: {
      fontSize: '14px',
      color: '#6b7280',
      margin: '0',
      lineHeight: '1.5',
    },
    confirmationActions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '12px',
      padding: '16px 24px',
      background: '#f9fafb',
      borderRadius: '0 0 8px 8px',
      borderTop: '1px solid #e5e7eb',
    },
    cancelButton: {
      padding: '8px 16px',
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151',
      background: 'white',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    confirmButton: {
      ...variantStyles.confirmButton,
      padding: '8px 16px',
      fontSize: '14px',
      fontWeight: '500',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      border: 'none',
      outline: 'none',
    },
  };
};
