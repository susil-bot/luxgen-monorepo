import React, { useState } from 'react';
import { LogoutProps } from './types';
import { getLogoutStyles } from './styles';

export const Logout: React.FC<LogoutProps> = ({
  onLogout,
  onCancel,
  user,
  variant = 'default',
  showConfirmation = true,
  className = '',
  disabled = false,
  loading = false,
}) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogoutClick = () => {
    if (showConfirmation) {
      setIsConfirming(true);
    } else {
      handleLogout();
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await onLogout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleCancel = () => {
    setIsConfirming(false);
    onCancel?.();
  };

  const handleConfirm = () => {
    setIsConfirming(false);
    handleLogout();
  };

  const styles = getLogoutStyles({ variant, disabled, loading: isLoggingOut });

  if (isConfirming) {
    return (
      <div className={`logout-confirmation ${className}`} style={styles.confirmation}>
        <div style={styles.confirmationContent}>
          <div style={styles.confirmationIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16,17 21,12 16,7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </div>
          <div style={styles.confirmationText}>
            <h3 style={styles.confirmationTitle}>Confirm Logout</h3>
            <p style={styles.confirmationMessage}>
              Are you sure you want to logout? Any unsaved changes will be lost.
            </p>
          </div>
        </div>
        <div style={styles.confirmationActions}>
          <button
            type="button"
            onClick={handleCancel}
            style={styles.cancelButton}
            disabled={isLoggingOut}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            style={styles.confirmButton}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`logout-component ${className}`} style={styles.container}>
      <button
        type="button"
        onClick={handleLogoutClick}
        style={styles.logoutButton}
        disabled={disabled || isLoggingOut}
        aria-label="Logout"
      >
        <div style={styles.buttonContent}>
          {isLoggingOut ? (
            <div style={styles.loadingSpinner}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="31.416" strokeDashoffset="31.416">
                  <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                  <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
                </circle>
              </svg>
            </div>
          ) : (
            <div style={styles.logoutIcon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16,17 21,12 16,7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </div>
          )}
          <span style={styles.buttonText}>
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </span>
        </div>
      </button>
      
      {user && (
        <div style={styles.userInfo}>
          <div style={styles.userAvatar}>
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} style={styles.avatarImage} />
            ) : (
              <div style={styles.avatarInitials}>
                {user.initials || user.name.split(' ').map(n => n[0]).join('')}
              </div>
            )}
          </div>
          <div style={styles.userDetails}>
            <div style={styles.userName}>{user.name}</div>
            <div style={styles.userRole}>{user.role}</div>
          </div>
        </div>
      )}
    </div>
  );
};
