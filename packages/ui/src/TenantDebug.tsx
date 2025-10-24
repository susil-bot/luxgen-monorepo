import React from 'react';
import { useTenant } from './TenantProvider';

export const TenantDebug: React.FC = () => {
  const { currentTenant, tenantConfig } = useTenant();

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg shadow-lg z-50 text-sm">
      <div className="font-bold mb-2">🏢 Tenant Debug</div>
      <div>Current: <span className="text-yellow-300">{currentTenant}</span></div>
      <div>Name: <span className="text-green-300">{tenantConfig.name}</span></div>
      <div>Logo: <span className="text-blue-300">{tenantConfig.logo.text}</span></div>
      <div>Color: <span className="text-purple-300">{tenantConfig.branding.primaryColor}</span></div>
    </div>
  );
};
