describe('Chip', () => {
  it('exports component and fixtures', async () => {
    const mod = await import('./Chip');
    const fix = await import('./fixture');
    expect(mod.Chip).toBeDefined();
    expect(fix.chipFixtures?.default ?? fix.chipFixtures?.default).toBeDefined();
  });
});
