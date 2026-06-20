describe('Assets', () => {
  it('exports component and fixtures', async () => {
    const mod = await import('./Assets');
    const fix = await import('./fixture');
    expect(mod.Assets).toBeDefined();
    expect(fix.assetsFixtures?.default ?? fix.assetsFixtures?.default).toBeDefined();
  });
});
