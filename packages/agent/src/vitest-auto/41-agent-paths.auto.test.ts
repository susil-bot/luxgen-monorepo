import { describe, expect, it } from 'vitest';
import { getAgentBranchName, sanitizeSessionId } from '../config/paths';

describe('41', () => { it('agent paths', () => { expect(getAgentBranchName(sanitizeSessionId('a/b'))).toContain('agent/'); }); });
