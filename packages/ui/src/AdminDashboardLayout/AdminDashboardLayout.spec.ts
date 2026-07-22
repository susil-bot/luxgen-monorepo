describe('AdminDashboardLayout', () => {
  it('exports component and fixtures', async () => {
    const mod = await import('./AdminDashboardLayout');
    const fix = await import('./fixture');
    expect(mod.AdminDashboardLayout).toBeDefined();
    expect(fix.adminDashboardLayoutFixtures?.default ?? fix.adminDashboardLayoutFixtures?.default).toBeDefined();
  });
});
