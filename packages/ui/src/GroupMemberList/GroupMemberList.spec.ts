describe('GroupMemberList', () => {
  it('exports component and fixtures', async () => {
    const mod = await import('./GroupMemberList');
    const fix = await import('./fixture');
    expect(mod.GroupMemberList).toBeDefined();
    expect(fix.groupMemberListFixtures?.default ?? fix.groupMemberListFixtures?.default).toBeDefined();
  });
});
