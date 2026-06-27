describe('CountryLanguageDropdown', () => {
  it('exports component and fixtures', async () => {
    const mod = await import('./CountryLanguageDropdown');
    const fix = await import('./fixture');
    expect(mod.CountryLanguageDropdown).toBeDefined();
    expect(fix.countryLanguageDropdownFixtures?.default ?? fix.countryLanguageDropdownFixtures?.default).toBeDefined();
  });
});
