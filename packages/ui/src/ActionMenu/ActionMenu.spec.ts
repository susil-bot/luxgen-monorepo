describe('ActionMenu', () => {
  it('exports component and fixtures', async () => {
    const mod = await import('./ActionMenu');
    const fix = await import('./fixture');
    expect(mod.ActionMenu).toBeDefined();
    expect(fix.actionMenuFixtures?.default ?? fix.actionMenuFixtures?.default).toBeDefined();
  });
});
