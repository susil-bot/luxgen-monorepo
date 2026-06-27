import { describe, expect, it } from 'vitest';
import { allToolDefinitions } from '../tools/definitions';

describe('50', () => {
  it('allToolDefinitions', () => {
    const tools = allToolDefinitions({ tenant: 'demo', scopes: ['read', 'write'], production: false, keyId: 'k1' });
    expect(tools.length).toBeGreaterThan(0);
  });
});
