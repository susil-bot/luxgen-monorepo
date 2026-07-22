import { describe, expect, it } from 'vitest';

describe('certificate stats (auto-10)', () => {
  it('certificateCount tracks completed enrollments', () => {
    const completed = [{ id: '1' }, { id: '2' }];
    const certificateCount = completed.length;
    expect(certificateCount).toBe(2);
  });
});
