import { describe, expect, it } from 'vitest';
import { sessionToLayoutUser } from '../app-layout-user';

describe('37', () => {
  it('sessionToLayoutUser', () => {
    const user = sessionToLayoutUser({
      id: 'u',
      email: 'x@y.com',
      firstName: 'A',
      lastName: 'B',
      role: 'ADMIN',
      tenant: { id: 't', name: 'Demo', subdomain: 'demo' },
    });
    expect(user.tenant).toBe('demo');
  });
});
