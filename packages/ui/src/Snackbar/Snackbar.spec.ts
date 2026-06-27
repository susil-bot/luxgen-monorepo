describe('Snackbar', () => {
  it('exports component and fixtures', async () => {
    const mod = await import('./Snackbar');
    const fix = await import('./fixture');
    expect(mod.Snackbar).toBeDefined();
    expect(fix.snackbarFixtures?.default ?? fix.snackbarFixtures?.default).toBeDefined();
  });
});
