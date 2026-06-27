describe('SplitPageLayout', () => {
  it('exports component and fixtures', async () => {
    const mod = await import('./SplitPageLayout');
    const fix = await import('./fixture');
    expect(mod.SplitPageLayout).toBeDefined();
    expect(fix.splitPageLayoutFixtures?.default ?? fix.splitPageLayoutFixtures?.default).toBeDefined();
  });
});
