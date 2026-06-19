import { getAgentConfig } from '../config/agent-mode';
import type { ValidationPolicy } from '../types/validation';

export function getValidationPolicy(): ValidationPolicy {
  const mode = getAgentConfig().mode;
  if (mode === 'local') return 'off';
  if (mode === 'production') return 'strict';
  if (mode === 'staging') return 'strict';
  return 'warn';
}

export function validationBlocksCommit(result: { passed: boolean } | undefined, policy: ValidationPolicy): boolean {
  if (policy === 'off') return false;
  if (!result) return policy === 'strict';
  if (policy === 'strict' && !result.passed) return true;
  return false;
}
