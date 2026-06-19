import { performLogout } from './user-actions';
import {
  AUTH_STORAGE_KEYS,
  clearStoredSession,
  getStoredUser,
  isStoredSessionExpired,
  type SessionUser,
} from './session';

export type { LogoutOptions } from './user-actions';
export { performLogout, createHandleUserAction } from './user-actions';

export interface User extends SessionUser {}

export {
  AUTH_STORAGE_KEYS,
  clearStoredSession,
  getStoredUser,
  isStoredSessionExpired,
  persistSession,
} from './session';

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem(AUTH_STORAGE_KEYS.token);
  if (token && isStoredSessionExpired()) {
    clearStoredSession();
    return null;
  }
  return token;
};

export const setAuthToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_STORAGE_KEYS.token, token);
};

export const removeAuthToken = (): void => {
  clearStoredSession();
};

export const isAuthenticated = (): boolean => {
  return getAuthToken() !== null;
};

export const getCurrentUser = async (): Promise<User | null> => {
  const token = getAuthToken();
  if (!token) return null;

  const cached = getStoredUser();
  if (cached) return cached;

  try {
    const response = await fetch('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Failed to get current user:', error);
  }

  return null;
};

export const logout = (router?: Pick<import('next/router').NextRouter, 'push'>): void => {
  performLogout({ router });
};
