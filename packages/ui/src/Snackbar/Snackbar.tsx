import React, { useState, useEffect, useCallback } from 'react';
import { withSSR } from '../ssr';

export type SnackbarType = 'success' | 'error' | 'warning' | 'info';

export interface SnackbarProps {
  open: boolean;
  message: string;
  type?: SnackbarType;
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  onClose?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  closable?: boolean;
  className?: string;
  tenantTheme?: any;
}

export interface SnackbarItem {
  id: string;
  message: string;
  type: SnackbarType;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const defaultTheme = {
  colors: {
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
  },
};

const SnackbarComponent: React.FC<SnackbarProps> = ({
  open,
  message,
  type = 'info',
  duration = 5000,
  position = 'top-right',
  onClose,
  action,
  closable = true,
  className = '',
  tenantTheme = defaultTheme,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (open) {
      setIsVisible(true);
      setIsExiting(false);
      
      if (duration > 0) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);
        
        return () => clearTimeout(timer);
      }
    } else {
      handleClose();
    }
  }, [open, duration]);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300); // Animation duration
  }, [onClose]);

  const getTypeStyles = () => {
    const colors = tenantTheme?.colors || defaultTheme.colors;
    
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-800',
          icon: 'text-green-500',
          button: 'text-green-600 hover:text-green-700',
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
          icon: 'text-red-500',
          button: 'text-red-600 hover:text-red-700',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-800',
          icon: 'text-yellow-500',
          button: 'text-yellow-600 hover:text-yellow-700',
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-800',
          icon: 'text-blue-500',
          button: 'text-blue-600 hover:text-blue-700',
        };
    }
  };

  const getPositionStyles = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return 'top-4 right-4';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  if (!isVisible) return null;

  const styles = getTypeStyles();
  const positionStyles = getPositionStyles();

  return (
    <div
      className={`fixed z-50 max-w-sm w-full ${positionStyles} ${className}`}
      {...props}
    >
      <div
        className={`
          ${styles.bg} ${styles.border} ${styles.text}
          border rounded-lg shadow-lg p-4
          transform transition-all duration-300 ease-in-out
          ${isExiting ? 'opacity-0 scale-95 translate-y-2' : 'opacity-100 scale-100 translate-y-0'}
        `}
      >
        <div className="flex items-start">
          <div className={`flex-shrink-0 ${styles.icon}`}>
            {getIcon()}
          </div>
          
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium">
              {message}
            </p>
            
            {action && (
              <div className="mt-2">
                <button
                  type="button"
                  className={`text-sm font-medium ${styles.button} transition-colors`}
                  onClick={action.onClick}
                >
                  {action.label}
                </button>
              </div>
            )}
          </div>
          
          {closable && (
            <div className="ml-4 flex-shrink-0">
              <button
                type="button"
                className={`${styles.text} hover:opacity-75 transition-opacity`}
                onClick={handleClose}
              >
                <span className="sr-only">Close</span>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const Snackbar = withSSR(SnackbarComponent);
