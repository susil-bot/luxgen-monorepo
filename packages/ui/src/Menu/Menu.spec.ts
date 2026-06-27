describe('Menu', () => {
  it('exports component and fixtures', async () => {
    const mod = await import('./Menu');
    const fix = await import('./fixture');
    expect(mod.Menu).toBeDefined();
    expect(fix.menuFixtures?.default ?? fix.menuFixtures?.default).toBeDefined();
  });
});
