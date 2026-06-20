/**
 * Webpack client stub for `@luxgen/agent`.
 * The real package is server-only (ioredis, fs, git). Use `/api/agent/*` from the browser.
 */
const serverOnly = (name: string): never => {
  throw new Error(`@luxgen/agent.${name} is server-only — call /api/agent routes instead`);
};

export const SYSTEM_PROMPT = '';
export const extractBearerToken = () => serverOnly('extractBearerToken');
export const isAuthRequired = () => serverOnly('isAuthRequired');
export const resolveAgentAuth = () => serverOnly('resolveAgentAuth');
export const runAgentLoop = () => serverOnly('runAgentLoop');
export const loadSession = () => serverOnly('loadSession');
export const checkOllamaHealth = () => serverOnly('checkOllamaHealth');
