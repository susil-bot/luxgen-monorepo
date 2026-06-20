import { UserMenu } from '../NavBar/NavBar';
import { getTenantConfig } from './tenantService';

// Real user data structure based on tenant configuration
interface RealUserData {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  tenant: {
    name: string;
    subdomain: string;
  };
  permissions: string[];
  lastLogin: string;
  isActive: boolean;
}

const AUTH_TOKEN_KEY = 'authToken';
const AUTH_EXPIRES_KEY = 'authTokenExpiresAt';
const LUXGEN_USER_KEY = 'luxgen_user';
const CURRENT_USER_KEY = 'currentUser';

/** Map canonical web session (persistSession) to UserMenu — avoids extra /api/users/me round-trip. */
export const getSessionUserAsUserMenu = (): UserMenu | null => {
  if (!hasValidAuthSession()) return null;

  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) return null;

    const session = JSON.parse(raw) as {
      firstName?: string;
      lastName?: string;
      email: string;
      role?: string;
      tenant?: { name: string; subdomain: string };
    };

    const name = `${session.firstName ?? ''} ${session.lastName ?? ''}`.trim() || session.email;

    return {
      name,
      email: session.email,
      role: session.role,
      tenant: session.tenant,
    };
  } catch {
    return null;
  }
};

/** True when authToken exists and is not past expiry (matches apps/web/lib/session.ts). */
export const hasValidAuthSession = (): boolean => {
  if (typeof window === 'undefined') return false;

  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (!token) return false;

  const expiresRaw = localStorage.getItem(AUTH_EXPIRES_KEY);
  if (expiresRaw) {
    const expiresAt = Number(expiresRaw);
    if (Number.isFinite(expiresAt) && Date.now() >= expiresAt - 30_000) {
      return false;
    }
  }

  return true;
};

/** Clear all client auth keys (canonical session + legacy luxgen_user cache). */
export const clearAuthSessionStorage = (): void => {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(LUXGEN_USER_KEY);
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem('currentUser');
  localStorage.removeItem('currentTenant');
  localStorage.removeItem(AUTH_EXPIRES_KEY);
  localStorage.removeItem('authSessionEpoch');
  window.dispatchEvent(new Event('luxgen-auth-change'));
  console.log('👤 Auth session cleared from storage');
};

export const fetchUserForTenant = async (tenantId: string): Promise<UserMenu> => {
  console.log('👤 Fetching real user data for tenant:', tenantId);

  try {
    // Skip tenant config for now to avoid dependency issues

    // Make real API call to fetch user data
    const response = await fetch(`/api/users/me?tenant=${tenantId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': tenantId,
        Authorization: `Bearer ${localStorage.getItem('authToken') || ''}`,
      },
      credentials: 'include', // Include cookies for authentication
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('UNAUTHENTICATED');
      }
      throw new Error(`Failed to fetch user data: ${response.status} ${response.statusText}`);
    }

    const realUserData: RealUserData = await response.json();

    // Transform real data to UserMenu format
    const userMenu: UserMenu = {
      name: realUserData.name,
      email: realUserData.email,
      role: realUserData.role,
      avatar: realUserData.avatar,
      tenant: {
        name: realUserData.tenant.name,
        subdomain: realUserData.tenant.subdomain,
      },
    };

    console.log('👤 Real user data loaded:', {
      tenant: tenantId,
      name: userMenu.name,
      email: userMenu.email,
      role: userMenu.role,
      tenantName: userMenu.tenant?.name,
    });

    // Save to localStorage for persistence
    saveUserToStorage(userMenu);

    return userMenu;
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHENTICATED') {
      throw error;
    }

    console.error('Failed to fetch real user data:', error);
    throw error;
  }
};

/**
 * Get user data from localStorage (for persistence)
 */
export const getUserFromStorage = (): UserMenu | null => {
  if (typeof window === 'undefined') return null;
  if (!hasValidAuthSession()) return null;

  try {
    const userData = localStorage.getItem(LUXGEN_USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error loading user from storage:', error);
    return null;
  }
};

/**
 * Save user data to localStorage
 */
export const saveUserToStorage = (user: UserMenu): void => {
  if (typeof window === 'undefined') return;
  if (!hasValidAuthSession()) return;

  try {
    localStorage.setItem(LUXGEN_USER_KEY, JSON.stringify(user));
    console.log('👤 User data saved to storage');
  } catch (error) {
    console.error('Error saving user to storage:', error);
  }
};

/**
 * Clear user data from localStorage
 */
export const clearUserFromStorage = (): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(LUXGEN_USER_KEY);
    console.log('👤 User data cleared from storage');
  } catch (error) {
    console.error('Error clearing user from storage:', error);
  }
};

/**
 * Update real user data for current tenant via API
 */
export const updateUserForTenant = async (tenantId: string, updates: Partial<UserMenu>): Promise<UserMenu> => {
  console.log('👤 Updating real user data for tenant:', tenantId, updates);

  try {
    // Make API call to update user data
    const response = await fetch(`/api/users/me?tenant=${tenantId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': tenantId,
      },
      credentials: 'include',
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      // If API endpoint doesn't exist (404) or server error (500), fall back to local update
      if (response.status === 404 || response.status === 500) {
        console.log('👤 Update API endpoint not available (status:', response.status, '), using local update');
        throw new Error('API_ENDPOINT_NOT_FOUND');
      }
      throw new Error(`Failed to update user data: ${response.status} ${response.statusText}`);
    }

    const updatedUserData: RealUserData = await response.json();
    const tenantConfig = await getTenantConfig(tenantId);

    // Transform to UserMenu format
    const updatedUser: UserMenu = {
      name: updatedUserData.name,
      email: updatedUserData.email,
      role: updatedUserData.role,
      avatar: updatedUserData.avatar,
      tenant: {
        name: tenantConfig.name,
        subdomain: tenantConfig.subdomain,
      },
    };

    // Save to localStorage
    saveUserToStorage(updatedUser);

    console.log('👤 User data updated successfully:', updatedUser);
    return updatedUser;
  } catch (error) {
    console.error('Failed to update user data:', error);

    // Check if it's an API endpoint not found error
    if (error instanceof Error && error.message === 'API_ENDPOINT_NOT_FOUND') {
      console.log('👤 Update API not implemented yet, using local update');

      // Fallback to local update
      const currentUser = await fetchUserForTenant(tenantId);
      const updatedUser = { ...currentUser, ...updates };
      saveUserToStorage(updatedUser);
      return updatedUser;
    }

    // Other errors - fallback to local update
    const currentUser = await fetchUserForTenant(tenantId);
    const updatedUser = { ...currentUser, ...updates };
    saveUserToStorage(updatedUser);
    return updatedUser;
  }
};

/**
 * Authenticate user with real credentials
 */
export const authenticateUser = async (
  tenantId: string,
  credentials: { email: string; password: string },
): Promise<UserMenu> => {
  console.log('🔐 Authenticating user for tenant:', tenantId);

  try {
    const response = await fetch(`/api/auth/login?tenant=${tenantId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': tenantId,
      },
      credentials: 'include',
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      // If API endpoint doesn't exist (404) or server error (500), fall back to tenant-based authentication
      if (response.status === 404 || response.status === 500) {
        console.log(
          '👤 Auth API endpoint not available (status:',
          response.status,
          '), using tenant-based authentication',
        );
        throw new Error('API_ENDPOINT_NOT_FOUND');
      }
      throw new Error(`Authentication failed: ${response.status} ${response.statusText}`);
    }

    const authData = await response.json();
    const tenantConfig = await getTenantConfig(tenantId);

    const userMenu: UserMenu = {
      name: authData.user.name,
      email: authData.user.email,
      role: authData.user.role,
      avatar: authData.user.avatar,
      tenant: {
        name: tenantConfig.name,
        subdomain: tenantConfig.subdomain,
      },
    };

    saveUserToStorage(userMenu);
    console.log('🔐 User authenticated successfully:', userMenu);
    return userMenu;
  } catch (error) {
    console.error('Authentication failed:', error);
    throw error;
  }
};

/**
 * Logout user and clear session
 */
export const logoutUser = async (tenantId: string): Promise<void> => {
  console.log('🚪 Logging out user for tenant:', tenantId);

  try {
    const response = await fetch(`/api/auth/logout?tenant=${tenantId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': tenantId,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 404 || response.status === 500) {
        console.log('👤 Logout API endpoint not available (status:', response.status, '), clearing local data only');
      } else {
        console.warn('Logout API call failed, but clearing local data');
      }
    }
  } catch (error) {
    console.warn('Logout API call failed, but clearing local data:', error);
  } finally {
    clearAuthSessionStorage();
    console.log('🚪 User logged out and session cleared');
  }
};
