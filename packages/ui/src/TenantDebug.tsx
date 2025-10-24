import React from 'react';
import { useGlobalContext } from './context/GlobalContext';
import { useTheme } from './context/ThemeContext';
import { useUser } from './context/UserContext';

export const TenantDebug: React.FC = () => {
  const { currentTenant, tenantConfig, isInitialized } = useGlobalContext();
  const { theme } = useTheme();
  const { user, isLoading: userLoading } = useUser();

  if (!isInitialized) {
    return null;
  }

  const cssPrimary = typeof window !== 'undefined' 
    ? getComputedStyle(document.documentElement).getPropertyValue('--color-primary')
    : 'N/A';

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg shadow-lg z-50 text-sm max-w-xs">
      <div className="font-bold mb-2">🏢 Tenant Debug</div>
      <div>Current: <span className="text-yellow-300">{currentTenant}</span></div>
      <div>Name: <span className="text-green-300">{tenantConfig.name}</span></div>
      <div>Tenant Logo: <span className="text-blue-300">{tenantConfig.branding.logo.text}</span></div>
      <div>Logo Src: <span className="text-blue-300">{tenantConfig.branding.logo.image || 'N/A'}</span></div>
      <div>Brand Color: <span className="text-purple-300">{tenantConfig.theme.colors.primary}</span></div>
      <div>Theme Primary: <span className="text-cyan-300">{tenantConfig.theme.colors.primary}</span></div>
      <div>Theme Background: <span className="text-orange-300">{tenantConfig.theme.colors.background}</span></div>
      <div>Active Theme: <span className="text-pink-300">{theme.colors.primary}</span></div>
      <div className="mt-2 text-xs text-gray-400">
        CSS Var: <span style={{ color: 'var(--color-primary)' }}>●</span> {cssPrimary}
      </div>
      <div className="mt-1 text-xs text-gray-400">
        Applied: {theme.colors.primary === tenantConfig.theme.colors.primary ? '✅' : '❌'}
      </div>
      {user && (
        <>
          <div className="mt-2 pt-2 border-t border-gray-600">
            <div className="font-bold mb-1">👤 User Info</div>
            <div>Name: <span className="text-green-300">{user.name}</span></div>
            <div>Email: <span className="text-blue-300">{user.email}</span></div>
            <div>Role: <span className="text-purple-300">{user.role}</span></div>
            {user.tenant && (
              <div>Tenant: <span className="text-yellow-300">{user.tenant.name}</span></div>
            )}
          </div>
        </>
      )}
      {userLoading && (
        <div className="mt-2 text-xs text-gray-400">Loading user...</div>
      )}
    </div>
  );
};
