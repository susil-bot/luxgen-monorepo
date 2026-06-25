export function mockTenant(overrides = {}) {
  return {
    _id: '64f0000000000000000000aa',
    id: '64f0000000000000000000aa',
    name: 'Demo Tenant',
    subdomain: 'demo',
    ...overrides,
  };
}
