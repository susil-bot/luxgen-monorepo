describe('AdminDashboard', () => {
  it('exports component and fixtures', async () => {
    const mod = await import('./AdminDashboard');
    const fix = await import('./fixture');
    expect(mod.AdminDashboard).toBeDefined();
    expect(fix.adminDashboardFixtures?.default ?? fix.adminDashboardFixtures?.default).toBeDefined();
  });
});
