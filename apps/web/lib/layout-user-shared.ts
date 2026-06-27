import type { SessionUser } from './session';

export interface LayoutUser {
  name: string;
  email: string;
  role: string;
  tenant: string;
  avatarUrl?: string;
}

/** Map persisted session user to AppLayout user prop */
export function sessionToLayoutUser(session: SessionUser): LayoutUser {
  return {
    name: `${session.firstName} ${session.lastName}`.trim(),
    email: session.email,
    role: session.role,
    tenant: session.tenant.subdomain,
    avatarUrl: session.avatar,
  };
}
