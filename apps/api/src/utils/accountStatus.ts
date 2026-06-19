import { IUser } from '@luxgen/db';

const INACTIVE_STATUSES = new Set(['INACTIVE', 'SUSPENDED']);

export function isAccountActive(user: IUser): boolean {
  if (user.isActive === false) return false;
  if (user.status && INACTIVE_STATUSES.has(String(user.status))) {
    return false;
  }
  return true;
}

export const ACCOUNT_DEACTIVATED_MESSAGE = 'Account is deactivated. Contact your administrator.';
