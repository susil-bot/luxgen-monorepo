/**
 * Webpack client stub for `@luxgen/agent`.
 * The real package is server-only (ioredis, fs, git). Use `/api/agent/*` from the browser.
 */
const serverOnly = (name: string): never => {
  throw new Error(`@luxgen/agent.${name} is server-only — call /api/agent routes instead`);
};

export const SYSTEM_PROMPT = '';
/** Safe for client pages that only need tool metadata (e.g. developer hub). */
export const AGENT_TOOLS: Array<{ name: string; description: string }> = [];
export const AGENT_TOOLS_OPENAI: unknown[] = [];
export const extractBearerToken = () => serverOnly('extractBearerToken');
export const isAuthRequired = () => serverOnly('isAuthRequired');
export const resolveAgentAuth = () => serverOnly('resolveAgentAuth');
export const runAgentLoop = () => serverOnly('runAgentLoop');
export const loadSession = () => serverOnly('loadSession');
export const checkOllamaHealth = () => serverOnly('checkOllamaHealth');
