describe('UserDashboard', () => {
  it('exports component and fixtures', async () => {
    const mod = await import('./UserDashboard');
    const fix = await import('./fixture');
    expect(mod.UserDashboard).toBeDefined();
    expect(fix.userDashboardFixtures?.default ?? fix.userDashboardFixtures?.default).toBeDefined();
  });
});
