'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.getAgentConfig = getAgentConfig;
exports.shouldUseGitWorktree = shouldUseGitWorktree;
function getAgentConfig() {
  const mode = process.env.AGENT_DEPLOYMENT_MODE || 'local';
  const gitEnabled =
    process.env.AGENT_GIT_ENABLED === 'true' || (process.env.AGENT_GIT_ENABLED !== 'false' && mode !== 'local');
  const baseBranch = process.env.AGENT_GIT_BASE_BRANCH || 'main';
  const autoMerge = process.env.AGENT_AUTO_MERGE === 'true';
  return { mode, gitEnabled, baseBranch, autoMerge };
}
function shouldUseGitWorktree() {
  return getAgentConfig().gitEnabled;
}
