describe('Layout', () => {
  it('exports component and fixtures', async () => {
    const mod = await import('./Layout');
    const fix = await import('./fixture');
    expect(mod.Layout).toBeDefined();
    expect(fix.layoutFixtures?.default ?? fix.layoutFixtures?.default).toBeDefined();
  });
});
