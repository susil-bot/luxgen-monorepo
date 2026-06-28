import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

import { API, AUTH_KEYS } from '../constants/api';

/** Map bare localhost / www to demo — matches web `tenant-auth.ts` */
export function normalizeTenantSubdomain(subdomain: string | undefined | null): string {
  const raw = (subdomain ?? '').trim().toLowerCase();
  if (!raw || raw === 'default' || raw === 'www' || raw === 'localhost' || raw === '127.0.0.1') {
    return 'demo';
  }
  return raw;
}

/** White-label build slug from `EXPO_PUBLIC_TENANT_SLUG` / app.config extra */
export function getBuildTimeTenantSlug(): string | null {
  const fromEnv = process.env.EXPO_PUBLIC_TENANT_SLUG?.trim();
  if (fromEnv) return normalizeTenantSubdomain(fromEnv);

  const fromExtra = Constants.expoConfig?.extra?.tenantSlug;
  if (typeof fromExtra === 'string' && fromExtra.trim()) {
    return normalizeTenantSubdomain(fromExtra);
  }

  return null;
}

export async function getActiveTenantSubdomain(): Promise<string> {
  const stored = await AsyncStorage.getItem(AUTH_KEYS.activeTenant);
  if (stored?.trim()) {
    return normalizeTenantSubdomain(stored);
  }

  const buildSlug = getBuildTimeTenantSlug();
  if (buildSlug) {
    return buildSlug;
  }

  return normalizeTenantSubdomain(API.defaultTenant);
}

export async function setActiveTenantSubdomain(subdomain: string): Promise<void> {
  await AsyncStorage.setItem(AUTH_KEYS.activeTenant, normalizeTenantSubdomain(subdomain));
}

/** x-tenant header for GraphQL / REST — follows active app tenant, not stale session alone */
export async function resolveRequestTenant(): Promise<string> {
  return getActiveTenantSubdomain();
}

export function isSessionTenantMismatch(userTenantSubdomain: string | undefined | null, activeTenant: string): boolean {
  if (!userTenantSubdomain) return false;
  return normalizeTenantSubdomain(userTenantSubdomain) !== normalizeTenantSubdomain(activeTenant);
}
