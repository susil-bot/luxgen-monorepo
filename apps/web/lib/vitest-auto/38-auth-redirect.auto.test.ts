import { describe, expect, it } from 'vitest';
import { resolveAuthRedirectReason } from '../session-guard';

describe('38', () => { it('resolveAuthRedirectReason', () => { expect(resolveAuthRedirectReason([{ message: 'Authentication required', extensions: { code: 'UNAUTHENTICATED' } }])).toBe('session_expired'); }); });
