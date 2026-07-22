describe('DataList', () => {
  it('exports component and fixtures', async () => {
    const mod = await import('./DataList');
    const fix = await import('./fixture');
    expect(mod.DataList).toBeDefined();
    expect(fix.dataListFixtures?.default ?? fix.dataListFixtures?.default).toBeDefined();
  });
});
