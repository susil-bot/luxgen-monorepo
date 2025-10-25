import { useState, useCallback } from 'react';

export interface UseLogoutOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  redirectTo?: string;
  clearStorage?: boolean;
  storageKeys?: string[];
}

export interface UseLogoutReturn {
  logout: () => Promise<void>;
  isLoggingOut: boolean;
  error: Error | null;
}

export const useLogout = (options: UseLogoutOptions = {}): UseLogoutReturn => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const {
    onSuccess,
    onError,
    redirectTo = '/login',
    clearStorage = true,
    storageKeys = ['token', 'user', 'tenant'],
  } = options;

  const logout = useCallback(async () => {
    setIsLoggingOut(true);
    setError(null);

    try {
      // Clear storage if enabled
      if (clearStorage) {
        storageKeys.forEach(key => {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
        });
      }

      // Clear any cookies (if using document.cookie)
      if (typeof document !== 'undefined') {
        document.cookie.split(';').forEach(cookie => {
          const eqPos = cookie.indexOf('=');
          const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
          document.cookie = `${name.trim()}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        });
      }

      // Call success callback
      onSuccess?.();

      // Redirect if specified
      if (redirectTo && typeof window !== 'undefined') {
        window.location.href = redirectTo;
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Logout failed');
      setError(error);
      onError?.(error);
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  }, [onSuccess, onError, redirectTo, clearStorage, storageKeys]);

  return {
    logout,
    isLoggingOut,
    error,
  };
};
