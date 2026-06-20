describe('SearchBar', () => {
  it('exports component and fixtures', async () => {
    const mod = await import('./SearchBar');
    const fix = await import('./fixture');
    expect(mod.SearchBar).toBeDefined();
    expect(fix.searchBarFixtures?.default ?? fix.searchBarFixtures?.default).toBeDefined();
  });
});
