describe('Toolkit', () => {
  it('exports component and fixtures', async () => {
    const mod = await import('./Toolkit');
    const fix = await import('./fixture');
    expect(mod.Toolkit).toBeDefined();
    expect(fix.toolkitFixtures.default.items.length).toBeGreaterThan(0);
  });
});
