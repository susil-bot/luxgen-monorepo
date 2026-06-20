import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserMenu } from '../NavBar/NavBar';
import {
  fetchUserForTenant,
  getUserFromStorage,
  getSessionUserAsUserMenu,
  saveUserToStorage,
  clearUserFromStorage,
  clearAuthSessionStorage,
  hasValidAuthSession,
  updateUserForTenant,
  logoutUser,
} from '../services/userService';

interface UserContextType {
  user: UserMenu | null;
  isLoading: boolean;
  error: string | null;
  updateUser: (updates: Partial<UserMenu>) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
  currentTenant: string;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children, currentTenant }) => {
  const [user, setUser] = useState<UserMenu | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUser = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!hasValidAuthSession()) {
        clearAuthSessionStorage();
        setUser(null);
        return;
      }

      const sessionUser = getSessionUserAsUserMenu();
      const storedUser = getUserFromStorage() ?? sessionUser;

      if (storedUser) {
        setUser(storedUser);
        if (!getUserFromStorage() && sessionUser) {
          saveUserToStorage(sessionUser);
        }
        return;
      }

      const tenantKey = sessionUser?.tenant?.subdomain ?? currentTenant;
      const userData = await fetchUserForTenant(tenantKey);
      setUser(userData);
      saveUserToStorage(userData);
    } catch (err) {
      if (err instanceof Error && err.message === 'UNAUTHENTICATED') {
        clearAuthSessionStorage();
        setUser(null);
        return;
      }

      const fallback = getSessionUserAsUserMenu();
      if (fallback) {
        setUser(fallback);
        saveUserToStorage(fallback);
        return;
      }
      console.error('Error loading user:', err);
      setError(err instanceof Error ? err.message : 'Failed to load user');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Update user data via real API
  const updateUser = async (updates: Partial<UserMenu>) => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      // Use real API to update user data
      const updatedUser = await updateUserForTenant(currentTenant, updates);
      setUser(updatedUser);
      console.log('👤 User updated via API:', updatedUser);
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setIsLoading(false);
    }
  };

  // Logout user via real API
  const logout = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Use real API to logout
      await logoutUser(currentTenant);
      setUser(null);
      console.log('👤 User logged out via API');
    } catch (err) {
      console.error('Error during logout:', err);
      // Still clear local data even if API fails
      setUser(null);
      clearUserFromStorage();
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    await loadUser();
  };

  // Load user when tenant changes or auth session updates
  useEffect(() => {
    if (!currentTenant) return;

    void loadUser();

    const onAuthChange = () => {
      void loadUser();
    };

    window.addEventListener('storage', onAuthChange);
    window.addEventListener('luxgen-auth-change', onAuthChange);

    return () => {
      window.removeEventListener('storage', onAuthChange);
      window.removeEventListener('luxgen-auth-change', onAuthChange);
    };
  }, [currentTenant]);

  const contextValue: UserContextType = {
    user,
    isLoading,
    error,
    updateUser,
    logout,
    refreshUser,
  };

  return <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>;
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
