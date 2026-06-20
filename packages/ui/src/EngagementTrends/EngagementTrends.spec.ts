describe('EngagementTrends', () => {
  it('exports component and fixtures', async () => {
    const mod = await import('./EngagementTrends');
    const fix = await import('./fixture');
    expect(mod.EngagementTrends).toBeDefined();
    expect(fix.engagementTrendsFixtures?.default ?? fix.engagementTrendsFixtures?.default).toBeDefined();
  });
});
