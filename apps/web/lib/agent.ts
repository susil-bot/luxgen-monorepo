/**
 * Client-safe agent types and prompts.
 * Runtime @luxgen/agent APIs are server-only — import from `@luxgen/agent` in pages/api/* only.
 */
export type { AgentSession, StagedFile } from '../../../packages/agent/src/types/session';
export type { ValidationResult } from '../../../packages/agent/src/types/validation';

export { SYSTEM_PROMPT } from './agent-system-prompt';
