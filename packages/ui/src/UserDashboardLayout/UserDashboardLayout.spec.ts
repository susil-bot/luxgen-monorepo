describe('UserDashboardLayout', () => {
  it('exports component and fixtures', async () => {
    const mod = await import('./UserDashboardLayout');
    const fix = await import('./fixture');
    expect(mod.UserDashboardLayout).toBeDefined();
    expect(fix.userDashboardLayoutFixtures?.default ?? fix.userDashboardLayoutFixtures?.default).toBeDefined();
  });
});
