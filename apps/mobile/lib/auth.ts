import * as SecureStore from 'expo-secure-store';

import { AUTH_KEYS } from '../constants/api';

export async function saveSession(token: string, tenantId: string, tenantSubdomain: string): Promise<void> {
  await SecureStore.setItemAsync(AUTH_KEYS.token, token);
  await SecureStore.setItemAsync(AUTH_KEYS.tenantId, tenantId);
  await SecureStore.setItemAsync(AUTH_KEYS.tenantSubdomain, tenantSubdomain);
}

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(AUTH_KEYS.token);
}

export async function getTenantId(): Promise<string | null> {
  return SecureStore.getItemAsync(AUTH_KEYS.tenantId);
}

export async function getTenantSubdomain(): Promise<string | null> {
  return SecureStore.getItemAsync(AUTH_KEYS.tenantSubdomain);
}

export async function clearSession(): Promise<void> {
  await SecureStore.deleteItemAsync(AUTH_KEYS.token);
  await SecureStore.deleteItemAsync(AUTH_KEYS.tenantId);
  await SecureStore.deleteItemAsync(AUTH_KEYS.tenantSubdomain);
}
