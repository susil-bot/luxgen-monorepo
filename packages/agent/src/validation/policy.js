'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.getValidationPolicy = getValidationPolicy;
exports.validationBlocksCommit = validationBlocksCommit;
const agent_mode_1 = require('../config/agent-mode');
function getValidationPolicy() {
  const mode = (0, agent_mode_1.getAgentConfig)().mode;
  if (mode === 'local') return 'off';
  if (mode === 'production') return 'strict';
  if (mode === 'staging') return 'strict';
  return 'warn';
}
function validationBlocksCommit(result, policy) {
  if (policy === 'off') return false;
  if (!result) return policy === 'strict';
  if (policy === 'strict' && !result.passed) return true;
  return false;
}
