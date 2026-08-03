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

  it('transformSearchResults builds course/learner cards with open hrefs', () => {
    const vm = transformSearchResults(
      'ada',
      'demo',
      [
        { id: 'c1', title: 'Advanced Ada', status: 'published', description: 'Deep dive' },
        { id: 'c2', title: 'Python' },
      ],
      [
        { id: 'u1', email: 'ada@demo.com', firstName: 'Ada', lastName: 'Lovelace', role: 'STUDENT' },
        { id: 'u2', email: 'admin@demo.com', firstName: 'Admin', role: 'ADMIN' },
      ],
    );
    expect(vm.courseCount).toBe(1);
    expect(vm.userCount).toBe(1);
    expect(vm.results).toHaveLength(2);
    expect(vm.courses[0].href).toBe('/courses/c1?tenant=demo');
    expect(vm.courses[0].typeLabel).toBe('Course');
    expect(vm.courses[0].status).toBe('Published');
    expect(vm.users[0].title).toBe('Ada Lovelace');
    expect(vm.users[0].typeLabel).toBe('Learner');
    expect(vm.users[0].href).toBe('/admin/customers/u1?tenant=demo');
  });

  it('excludes non-learner users from learner hits', () => {
    const vm = transformSearchResults('admin', 'demo', [], [
      { id: 'a1', email: 'admin@demo.com', firstName: 'Admin', role: 'ADMIN' },
    ]);
    expect(vm.userCount).toBe(0);
    expect(vm.isEmpty).toBe(true);
  });
});
