describe('UserManagement', () => {
  it('exports component and fixtures', async () => {
    const mod = await import('./UserManagement');
    const fix = await import('./fixture');
    expect(mod.UserManagement).toBeDefined();
    expect(fix.userManagementFixtures?.default ?? fix.userManagementFixtures?.default).toBeDefined();
  });
});
