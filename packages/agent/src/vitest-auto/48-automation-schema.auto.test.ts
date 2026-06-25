import { describe, expect, it } from 'vitest';
import { AUTOMATION_SCHEMA_DOC } from '../automation/events';

describe('48', () => { it('AUTOMATION_SCHEMA_DOC', () => { expect(AUTOMATION_SCHEMA_DOC.triggers.length).toBeGreaterThan(0); expect(AUTOMATION_SCHEMA_DOC.actions.length).toBeGreaterThan(0); }); });
