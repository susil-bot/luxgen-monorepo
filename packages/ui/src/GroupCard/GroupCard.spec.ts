describe('GroupCard', () => {
  it('exports component and fixtures', async () => {
    const mod = await import('./GroupCard');
    const fix = await import('./fixture');
    expect(mod.GroupCard).toBeDefined();
    expect(fix.groupCardFixtures?.default ?? fix.groupCardFixtures?.default).toBeDefined();
  });
});
