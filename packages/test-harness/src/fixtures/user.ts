import type { IUser } from '@luxgen/db';

export function mockIUser(overrides: Partial<IUser> = {}): IUser {
  return {
    _id: '64f000000000000000000001',
    id: '64f000000000000000000001',
    email: 'user@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'STUDENT',
    status: 'ACTIVE',
    tenant: {
      _id: '64f0000000000000000000aa',
      id: '64f0000000000000000000aa',
      name: 'Demo Tenant',
      subdomain: 'demo',
    },
    ...overrides,
  } as unknown as IUser;
}
