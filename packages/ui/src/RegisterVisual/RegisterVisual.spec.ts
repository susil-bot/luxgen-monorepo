describe('RegisterVisual', () => {
  it('exports component and fixtures', async () => {
    const mod = await import('./RegisterVisual');
    const fix = await import('./fixture');
    expect(mod.RegisterVisual).toBeDefined();
    expect(fix.registerVisualFixtures?.default ?? fix.registerVisualFixtures?.default).toBeDefined();
  });
});
