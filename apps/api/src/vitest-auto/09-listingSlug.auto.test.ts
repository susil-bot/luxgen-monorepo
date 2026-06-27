import { describe, expect, it } from 'vitest';

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

describe('09 listing slug auto', () => {
  it('slugifies inline business name', () => {
    expect(slugify('Hello LuxGen Listing!')).toBe('hello-luxgen-listing');
  });
});
