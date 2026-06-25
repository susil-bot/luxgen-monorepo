import { describe, expect, it } from 'vitest';
import { McpRateLimiter } from '../rate-limit';

describe('47', () => { it('rate limit', () => { const limiter = new McpRateLimiter(1, 60000); expect(limiter.check('k').limited).toBe(false); expect(limiter.check('k').limited).toBe(true); }); });
