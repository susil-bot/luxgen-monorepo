import { describe, expect, it } from 'vitest';
import { AUTH_NOTICE_BY_REASON } from '../auth-notices';

describe('39', () => { it('AUTH_NOTICE_BY_REASON', () => { expect(AUTH_NOTICE_BY_REASON.session_expired.title).toBe('Session expired'); }); });
