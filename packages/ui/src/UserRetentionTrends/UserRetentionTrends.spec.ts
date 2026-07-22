describe('UserRetentionTrends', () => {
  it('exports component and fixtures', async () => {
    const mod = await import('./UserRetentionTrends');
    const fix = await import('./fixture');
    expect(mod.UserRetentionTrends).toBeDefined();
    expect(fix.userRetentionTrendsFixtures?.default ?? fix.userRetentionTrendsFixtures?.default).toBeDefined();
  });
});
