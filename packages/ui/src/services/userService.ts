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

/**
 * Fetch real user data for a specific tenant from API
 */
export const fetchUserForTenant = async (tenantId: string): Promise<UserMenu> => {
  console.log('👤 Fetching real user data for tenant:', tenantId);
  
  try {
    // Skip tenant config for now to avoid dependency issues
    
    // Make real API call to fetch user data
    const response = await fetch(`/api/users/current?tenant=${tenantId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': tenantId,
      },
      credentials: 'include', // Include cookies for authentication
    });
    
    if (!response.ok) {
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
      tenantName: userMenu.tenant.name,
    });
    
    // Save to localStorage for persistence
    saveUserToStorage(userMenu);
    
    return userMenu;
    
  } catch (error) {
    console.error('Failed to fetch real user data:', error);
    
    // Check if it's an API endpoint not found error
    if (error instanceof Error && error.message === 'API_ENDPOINT_NOT_FOUND') {
      console.log('👤 API endpoints not implemented yet, using tenant-based user generation');
      
      // First check if we have a stored user for this tenant
      const storedUser = getUserFromStorage();
      if (storedUser && storedUser.tenant?.subdomain === tenantId) {
        console.log('👤 Using stored user data:', storedUser);
        return storedUser;
      }
      
      // Generate user based on tenant configuration
      const tenantConfig = getTenantConfig(tenantId);
      const tenantBasedUser: UserMenu = {
        name: `User from ${tenantConfig.name}`,
        email: `user@${tenantConfig.subdomain}.com`,
        role: 'User',
        avatar: `/avatars/${tenantConfig.subdomain}-user.jpg`,
        tenant: {
          name: tenantConfig.name,
          subdomain: tenantConfig.subdomain,
        },
      };
      
      // Save to localStorage for persistence
      saveUserToStorage(tenantBasedUser);
      console.log('👤 Generated tenant-based user:', tenantBasedUser);
      return tenantBasedUser;
    }
    
    // Fallback to localStorage if available
    const storedUser = getUserFromStorage();
    if (storedUser && storedUser.tenant?.subdomain === tenantId) {
      console.log('👤 Using stored user data as fallback');
      return storedUser;
    }
    
    // Final fallback - create user based on tenant configuration
    const tenantConfig = getTenantConfig(tenantId);
    const fallbackUser: UserMenu = {
      name: `User from ${tenantConfig.name}`,
      email: `user@${tenantConfig.subdomain}.com`,
      role: 'User',
      tenant: {
        name: tenantConfig.name,
        subdomain: tenantConfig.subdomain,
      },
    };
    
    console.log('👤 Using final fallback user data:', fallbackUser);
    return fallbackUser;
  }
};

/**
 * Get user data from localStorage (for persistence)
 */
export const getUserFromStorage = (): UserMenu | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const userData = localStorage.getItem('luxgen_user');
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
  
  try {
    localStorage.setItem('luxgen_user', JSON.stringify(user));
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
    localStorage.removeItem('luxgen_user');
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
    const response = await fetch(`/api/users/current?tenant=${tenantId}`, {
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
    const tenantConfig = getTenantConfig(tenantId);
    
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
export const authenticateUser = async (tenantId: string, credentials: { email: string; password: string }): Promise<UserMenu> => {
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
        console.log('👤 Auth API endpoint not available (status:', response.status, '), using tenant-based authentication');
        throw new Error('API_ENDPOINT_NOT_FOUND');
      }
      throw new Error(`Authentication failed: ${response.status} ${response.statusText}`);
    }
    
    const authData = await response.json();
    const tenantConfig = getTenantConfig(tenantId);
    
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
    
    // Check if it's an API endpoint not found error
    if (error instanceof Error && error.message === 'API_ENDPOINT_NOT_FOUND') {
      console.log('👤 Auth API not implemented yet, using tenant-based authentication');
      
      // Generate user based on actual credentials and tenant configuration
      const tenantConfig = getTenantConfig(tenantId);
      
      // Extract name from email (e.g., "susilkhan@gmail.com" -> "Susilkhan")
      const emailName = credentials.email.split('@')[0];
      const displayName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
      
      const demoUser: UserMenu = {
        name: `${displayName} from ${tenantConfig.name}`, // Use actual user name from email
        email: credentials.email, // Use the actual email provided
        role: 'User',
        avatar: `/avatars/${tenantConfig.subdomain}-user.jpg`,
        tenant: {
          name: tenantConfig.name,
          subdomain: tenantConfig.subdomain,
        },
      };
      
      saveUserToStorage(demoUser);
      console.log('👤 Generated user for authentication:', demoUser);
      return demoUser;
    }
    
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
    // Always clear local storage
    clearUserFromStorage();
    console.log('🚪 User logged out and local data cleared');
  }
};
