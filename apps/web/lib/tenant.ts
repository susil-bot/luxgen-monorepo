export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  settings: Record<string, any>;
  createdAt: string;
}

export const getTenantFromHost = (host: string): string => {
  const subdomain = host.split('.')[0];
  return subdomain === 'www' || subdomain === 'localhost' ? 'default' : subdomain;
};

export const getTenantFromUrl = (url: string): string => {
  try {
    const host = new URL(url).host;
    return getTenantFromHost(host);
  } catch {
    return 'default';
  }
};

export const getCurrentTenant = (): string => {
  if (typeof window === 'undefined') return 'default';
  return getTenantFromHost(window.location.host);
};

export const isMultiTenant = (): boolean => {
  const tenant = getCurrentTenant();
  return tenant !== 'default' && tenant !== 'www';
};

export const getTenantUrl = (tenant: string, path: string = ''): string => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const protocol = baseUrl.startsWith('https') ? 'https' : 'http';
  const domain = baseUrl.replace(/^https?:\/\//, '');
  
  if (tenant === 'default') {
    return `${protocol}://${domain}${path}`;
  }
  
  return `${protocol}://${tenant}.${domain}${path}`;
};
