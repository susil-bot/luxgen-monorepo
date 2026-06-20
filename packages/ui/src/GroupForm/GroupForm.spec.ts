describe('GroupForm', () => {
  it('exports component and fixtures', async () => {
    const mod = await import('./GroupForm');
    const fix = await import('./fixture');
    expect(mod.GroupForm).toBeDefined();
    expect(fix.groupFormFixtures?.default ?? fix.groupFormFixtures?.default).toBeDefined();
  });
});
