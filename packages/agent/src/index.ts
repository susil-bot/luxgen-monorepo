// Types
export type { AgentMessage, ToolUse, StagedFile, AgentSession, ApplyResult, SessionChatMessage } from './types/session';

export type { AgentEventType, AgentEvent, ChatMessage, RunAgentLoopOptions, RunAgentLoopResult } from './types/events';

export type {
  GitSessionStatus,
  AgentSessionGit,
  GitSessionInfo,
  CommitResult,
  MergeResult,
  PullRequestResult,
  GitStatusResult,
} from './types/git';

// Config
export { getAgentConfig, shouldUseGitWorktree } from './config/agent-mode';
export type { AgentConfig, AgentDeploymentMode } from './config/agent-mode';

export {
  getMonorepoRoot,
  getStagingDir,
  getWorktreesDir,
  getWorktreePath,
  getMergeWorktreePath,
  getAgentBranchName,
  sanitizeSessionId,
  ALLOWED_PATHS,
  ALLOWED_COMMANDS,
  isAllowedCommand,
  isFetchUrlAllowed,
  isPathAllowed,
  SENSITIVE_FILE_PATTERNS,
  isSensitiveFile,
} from './config/paths';

export {
  TOOL_TIMEOUTS,
  MAX_FILE_SIZE,
  MAX_DIR_ENTRIES,
  MAX_READ_CHARS,
  MAX_TOOL_CALLS_PER_RESPONSE,
  MAX_TOTAL_TOOL_CALLS,
  MAX_STAGED_FILES_PER_SESSION,
  MAX_CONSECUTIVE_TOOL_ONLY,
  MAX_ITERATIONS,
  MAX_CONTEXT_CHARS,
} from './config/limits';

// Changeset
export {
  getSessionPath,
  loadSession,
  saveSession,
  saveSessionMessages,
  stageFile,
  applySession,
  discardSession,
  pruneOldSessions,
  pruneOldWorktrees,
  ensureSessionHydrated,
  clearSessionCache,
  getWorkspaceRoot,
  isGitWorktreeActive,
} from './changeset/session-store';

// Git
export {
  ensureGitSession,
  isGitSessionActive,
  getGitStatus,
  commitStagedSession,
  mergeAgentBranch,
  createPullRequest,
  detectMergeConflicts,
  cleanupGitSession,
  discardGitSession,
} from './git/service';

export { isGitRepository, hasGhCli } from './git/exec';

// Tools
export { isBinary } from './tools/binary';
export { AGENT_TOOLS, AGENT_TOOLS_OPENAI } from './tools/definitions';
export { executeToolWithTimeout, listDirRecursive, searchInDir } from './tools/execute';

// Prompts
export { SYSTEM_PROMPT } from './prompts/system';

// Providers
export { findAvailableModel, checkOllamaHealth, pingOllama, supportsToolCalling, MODEL_META } from './providers/ollama';
export type { OllamaHealthResult } from './providers/ollama';

// Core
export { runAgentLoop } from './core/orchestrator';

// Validation
export { runValidationPipeline, getSessionValidation } from './validation/pipeline';
export { getValidationPolicy, validationBlocksCommit } from './validation/policy';
export type {
  ValidationResult,
  ValidationCheckResult,
  ValidationPolicy,
  ValidationCheckName,
} from './types/validation';

// Persistence
export {
  isMongoPersistenceEnabled,
  ensureMongoConnection,
  syncSessionToMongo,
  appendAuditEntry,
  getTaskFromMongo,
  sessionFromMongoDoc,
  listTasksFromMongo,
  getAuditLog,
  updateTaskValidation,
} from './persistence/mongo';

// Auth
export {
  isAuthRequired,
  resolveAgentAuth,
  bindSessionAuth,
  bindSessionAuthAsync,
  extractBearerToken,
} from './auth/context';
export type { TaskStatus, TaskMode, AgentAuthContext, HeadlessTaskJob, AuditAction } from './types/task';

// Queue
export {
  enqueueHeadlessTask,
  dequeueHeadlessTask,
  getQueueDepth,
  connectQueue,
  disconnectQueue,
  isQueueEnabled,
  acquireTenantStreamSlot,
  releaseTenantStreamSlot,
  isAgentMessageRateLimited,
  resetAgentRateLimitFallback,
  listDeadLetterJobs,
  handleJobFailure,
  requeueHeadlessTask,
  moveJobToDeadLetter,
  MAX_CONCURRENT_STREAMS_PER_TENANT,
  MAX_AGENT_MESSAGES_PER_MINUTE,
} from './queue/redis-queue';
export { processHeadlessJob, runWorkerLoop, shutdownWorker } from './queue/worker';

// Automation bridge
export { emitAutomationEvent, emitAgentAutomationEvent, emitCommerceAutomationEvent } from './automation/bridge';
export type { CommerceAutomationEventKind } from './automation/bridge';
export { AUTOMATION_EVENTS_CHANNEL, AUTOMATION_SCHEMA_DOC, AGENT_TRIGGER_TYPES } from './automation/events';
export type { AutomationEventPayload } from './automation/events';
