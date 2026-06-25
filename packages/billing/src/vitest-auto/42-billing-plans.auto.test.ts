import { describe, expect, it } from 'vitest';
import { getPlanDefinition, normalizePlan } from '../plans';

describe('42', () => { it('billing plans', () => { expect(normalizePlan('unknown')).toBe('free'); expect(getPlanDefinition('pro').name).toBe('Pro'); }); });
