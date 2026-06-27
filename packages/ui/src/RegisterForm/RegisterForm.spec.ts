describe('RegisterForm', () => {
  it('exports component and fixtures', async () => {
    const mod = await import('./RegisterForm');
    const fix = await import('./fixture');
    expect(mod.RegisterForm).toBeDefined();
    expect(fix.registerFormFixtures?.default ?? fix.registerFormFixtures?.default).toBeDefined();
  });
});
