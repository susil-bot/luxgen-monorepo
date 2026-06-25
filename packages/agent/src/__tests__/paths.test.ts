import { describe, expect, it } from 'vitest';
import {
  isAllowedCommand,
  isFetchUrlAllowed,
  isPathAllowed,
  sanitizeSessionId,
} from '../config/paths';

describe('sanitizeSessionId', () => {
  it('replaces unsafe characters', () => {
    expect(sanitizeSessionId('abc/def?x')).toBe('abc-def-x');
  });
});

describe('isPathAllowed', () => {
  it('allows apps/web paths', () => {
    expect(isPathAllowed('apps/web/pages/index.tsx')).toBe(true);
  });

  it('denies paths outside allowlist', () => {
    expect(isPathAllowed('/etc/passwd')).toBe(false);
  });
});

describe('isAllowedCommand', () => {
  it('allows npm and denies curl', () => {
    expect(isAllowedCommand('npm')).toBe(true);
    expect(isAllowedCommand('curl')).toBe(false);
  });
});

describe('isFetchUrlAllowed', () => {
  it('allows github in production', () => {
    expect(isFetchUrlAllowed('https://github.com/org/repo', 'production')).toBe(true);
  });

  it('blocks localhost in production', () => {
    expect(isFetchUrlAllowed('http://localhost:3000', 'production')).toBe(false);
  });
});
