describe('CourseMenu', () => {
  it('exports component and fixtures', async () => {
    const mod = await import('./CourseMenu');
    const fix = await import('./fixture');
    expect(mod.CourseMenu).toBeDefined();
    expect(fix.courseMenuFixtures?.default ?? fix.courseMenuFixtures?.default).toBeDefined();
  });
});
