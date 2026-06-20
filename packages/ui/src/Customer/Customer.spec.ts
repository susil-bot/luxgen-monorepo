describe('Customer', () => {
  it('exports component and fixtures', async () => {
    const mod = await import('./Customer');
    const fix = await import('./fixture');
    expect(mod.Customer).toBeDefined();
    expect(fix.customerFixtures?.default ?? fix.customerFixtures?.default).toBeDefined();
  });
});
