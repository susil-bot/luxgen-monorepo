describe('AIStudio', () => {
  it('exports component and fixtures', async () => {
    const mod = await import('./AIStudio');
    const fix = await import('./fixture');
    expect(mod.AIStudio).toBeDefined();
    expect(fix.aiStudioFixtures?.default ?? fix.aIStudioFixtures?.default).toBeDefined();
  });
});
