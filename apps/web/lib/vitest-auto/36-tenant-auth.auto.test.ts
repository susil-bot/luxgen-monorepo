import { describe, expect, it } from 'vitest';
import { normalizeTenantSubdomain } from '../tenant-auth';

describe('36', () => { it('normalizeTenantSubdomain', () => { expect(normalizeTenantSubdomain('localhost')).toBe('demo'); }); });
