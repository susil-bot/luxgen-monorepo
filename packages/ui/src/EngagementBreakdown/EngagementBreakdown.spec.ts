describe('EngagementBreakdown', () => {
  it('exports component and fixtures', async () => {
    const mod = await import('./EngagementBreakdown');
    const fix = await import('./fixture');
    expect(mod.EngagementBreakdown).toBeDefined();
    expect(fix.engagementBreakdownFixtures?.default ?? fix.engagementBreakdownFixtures?.default).toBeDefined();
  });
});
