describe('ProductEdit', () => {
  it('exports component and fixtures', async () => {
    const mod = await import('./ProductEdit');
    const fix = await import('./fixture');
    expect(mod.ProductEdit).toBeDefined();
    expect(fix.productEditFixtures?.default ?? fix.productEditFixtures?.default).toBeDefined();
  });
});
