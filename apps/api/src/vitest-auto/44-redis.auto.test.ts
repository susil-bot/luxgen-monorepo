import { describe, expect, it } from 'vitest';
import { isRedisAvailable } from '../lib/redis';

describe('44', () => { it('isRedisAvailable', () => { expect(typeof isRedisAvailable()).toBe('boolean'); }); });
