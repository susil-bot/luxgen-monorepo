import { getCurrentTenant } from './tenant';
import type { SessionUser } from './session';

/** Map bare localhost / www to demo — matches API default tenant */
export function normalizeTenantSubdomain(subdomain: string | undefined | null): string {
  const raw = (subdomain ?? '').trim().toLowerCase();
  if (!raw || raw === 'default' || raw === 'www' || raw === 'localhost' || raw === '127.0.0.1') {
    return 'demo';
  }
  return raw;
}

/** Tenant subdomain inferred from the current browser host (e.g. demo.localhost → demo) */
export function getHostTenantSubdomain(): string {
  return normalizeTenantSubdomain(getCurrentTenant());
}

/** True when a stored session belongs to a different tenant than the current host */
export function isSessionTenantMismatch(user: SessionUser | null | undefined): boolean {
  if (!user?.tenant?.subdomain) return false;
  const hostTenant = getHostTenantSubdomain();
  const userTenant = normalizeTenantSubdomain(user.tenant.subdomain);
  return userTenant !== hostTenant;
}

export function tenantMismatchMessage(user: SessionUser): string {
  const accountTenant = normalizeTenantSubdomain(user.tenant.subdomain);
  const hostTenant = getHostTenantSubdomain();
  return `This account belongs to "${user.tenant.name}" (${accountTenant}.localhost). You are on ${hostTenant}.localhost — use the correct subdomain to sign in.`;
}

/** x-tenant header for GraphQL — always follow the browser host, never stale localStorage. */
export function resolveRequestTenant(): string {
  return getHostTenantSubdomain();
}
