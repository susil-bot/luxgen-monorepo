import { useState } from 'react';
import { getTenantUrl } from '../../lib/tenant';

interface Tenant {
  id: string;
  name: string;
  subdomain: string;
}

interface TenantSwitcherProps {
  currentTenant: string;
  tenants: Tenant[];
}

export function TenantSwitcher({ currentTenant, tenants }: TenantSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleTenantChange = (tenant: Tenant) => {
    const url = getTenantUrl(tenant.subdomain, '/dashboard');
    window.location.href = url;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        <span>{currentTenant}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-10">
          <div className="py-1">
            {tenants.map((tenant) => (
              <button
                key={tenant.id}
                onClick={() => handleTenantChange(tenant)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                  tenant.subdomain === currentTenant ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
              >
                <div className="font-medium">{tenant.name}</div>
                <div className="text-xs text-gray-500">{tenant.subdomain}.luxgen.com</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
