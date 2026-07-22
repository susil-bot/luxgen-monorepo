describe('Order', () => {
  it('exports component and fixtures', async () => {
    const mod = await import('./Order');
    const fix = await import('./fixture');
    expect(mod.Order).toBeDefined();
    expect(fix.orderFixtures?.default ?? fix.orderFixtures?.default).toBeDefined();
  });
});
