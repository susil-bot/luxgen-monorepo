import { describe, expect, it } from 'vitest';
import { buildAuthRestPayload } from '../services/userService';
import { mockIUser } from '@luxgen/test-harness';

describe('01 userService auto', () => {
  it('builds auth payload from IUser fixture', () => {
    const payload = buildAuthRestPayload('token-123', mockIUser(), true);
    expect(payload.token).toBe('token-123');
    expect(payload.user.email).toBe('user@example.com');
    expect(payload.user.tenant.subdomain).toBe('demo');
    expect(payload.user.status).toBe('ACTIVE');
  });
});
