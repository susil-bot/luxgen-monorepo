import { IUser, UserStatus } from '@luxgen/db';

export function isAccountActive(user: IUser): boolean {
  if (user.isActive === false) return false;
  if (user.status === UserStatus.INACTIVE || user.status === UserStatus.SUSPENDED) {
    return false;
  }
  return true;
}

export const ACCOUNT_DEACTIVATED_MESSAGE = 'Account is deactivated. Contact your administrator.';
