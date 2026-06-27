import { describe, expect, it } from 'vitest';
import { filterToolsByScope, isToolAllowed } from '../tools/scopes';

describe('46', () => {
  it('mcp scopes', () => {
    const filtered = filterToolsByScope([{ name: 'list_automations' }, { name: 'create_automation' }], ['read']);
    expect(isToolAllowed('create_automation', ['read'])).toBe(false);
    expect(filtered).toEqual([{ name: 'list_automations' }]);
  });
});
