export type AgentDeploymentMode = 'local' | 'dev' | 'staging' | 'production';

export interface AgentConfig {
  mode: AgentDeploymentMode;
  gitEnabled: boolean;
  baseBranch: string;
  autoMerge: boolean;
}

export function getAgentConfig(): AgentConfig {
  const mode = (process.env.AGENT_DEPLOYMENT_MODE || 'local') as AgentDeploymentMode;
  const gitEnabled =
    process.env.AGENT_GIT_ENABLED === 'true' || (process.env.AGENT_GIT_ENABLED !== 'false' && mode !== 'local');
  const baseBranch = process.env.AGENT_GIT_BASE_BRANCH || 'main';
  const autoMerge = process.env.AGENT_AUTO_MERGE === 'true';

  return { mode, gitEnabled, baseBranch, autoMerge };
}

export function shouldUseGitWorktree(): boolean {
  return getAgentConfig().gitEnabled;
}
