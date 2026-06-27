describe('Timeline', () => {
  it('exports component and fixtures', async () => {
    const mod = await import('./Timeline');
    const fix = await import('./fixture');
    expect(mod.Timeline).toBeDefined();
    expect(fix.timelineFixtures?.default ?? fix.timelineFixtures?.default).toBeDefined();
  });
});
