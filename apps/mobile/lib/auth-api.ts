import { API } from '../constants/api';
import { resolveRequestTenant } from './tenant-auth';
import { fetchTenantCurrent } from './tenant-api';

async function authHeaders(): Promise<HeadersInit> {
  const tenant = await resolveRequestTenant();
  return {
    'Content-Type': 'application/json',
    'x-tenant': tenant,
  };
}

export async function requestPasswordReset(email: string): Promise<string> {
  const tenant = await resolveRequestTenant();
  let tenantMongoId: string | undefined;

  try {
    const current = await fetchTenantCurrent();
    tenantMongoId = current.id;
  } catch {
    tenantMongoId = undefined;
  }

  const response = await fetch(`${API.restUrl}/api/auth/forgot-password`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      ...(tenantMongoId ? { tenant: tenantMongoId } : { tenant }),
    }),
  });

  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to send reset code');
  }

  return result.message as string;
}

export async function resetPasswordWithToken(token: string, password: string): Promise<string> {
  const response = await fetch(`${API.restUrl}/api/auth/reset-password`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ token: token.trim(), password }),
  });

  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.message || result.errors?.token || 'Password reset failed');
  }

  return result.message as string;
}
