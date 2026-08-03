import { describe, expect, it } from 'vitest';
import { filterByQuery } from './helpers/filterByQuery';
import { transformSearchResults } from './transformers';

describe('search presenter transformers', () => {
  it('filterByQuery matches case-insensitive substring', () => {
    const items = [{ title: 'React Patterns' }, { title: 'Mongo Basics' }];
    const hits = filterByQuery(items, 'react', (i) => i.title);
    expect(hits).toHaveLength(1);
    expect(hits[0].title).toBe('React Patterns');
  });

  it('transformSearchResults builds hrefs and counts', () => {
    const vm = transformSearchResults(
      'ada',
      'demo',
      [
        { id: 'c1', title: 'Advanced Ada' },
        { id: 'c2', title: 'Python' },
      ],
      [{ id: 'u1', email: 'ada@demo.com', firstName: 'Ada', lastName: 'Lovelace' }],
    );
    expect(vm.courseCount).toBe(1);
    expect(vm.userCount).toBe(1);
    expect(vm.courses[0].href).toBe('/courses/c1?tenant=demo');
    expect(vm.users[0].label).toBe('Ada Lovelace');
  });
});
