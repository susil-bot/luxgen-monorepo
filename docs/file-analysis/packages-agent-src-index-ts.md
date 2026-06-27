# index.ts — Brief + Junior Q&A

**Path:** `packages/agent/src/index.ts` (156 lines)  
**Role:** Application module

## Exports

- `getAgentConfig` — line 17
- `shouldUseGitWorktree` — line 17
- `getMonorepoRoot` — line 20
- `getStagingDir` — line 20
- `getWorktreesDir` — line 20
- `getWorktreePath` — line 20
- `getMergeWorktreePath` — line 20
- `getAgentBranchName` — line 20
- `sanitizeSessionId` — line 20
- `ALLOWED_PATHS` — line 20
- `ALLOWED_COMMANDS` — line 20
- `isAllowedCommand` — line 20
- `isFetchUrlAllowed` — line 20
- `isPathAllowed` — line 20
- `SENSITIVE_FILE_PATTERNS` — line 20
- `isSensitiveFile` — line 20
- `TOOL_TIMEOUTS` — line 37
- `MAX_FILE_SIZE` — line 37
- `MAX_DIR_ENTRIES` — line 37
- `MAX_READ_CHARS` — line 37
- `MAX_TOOL_CALLS_PER_RESPONSE` — line 37
- `MAX_TOTAL_TOOL_CALLS` — line 37
- `MAX_STAGED_FILES_PER_SESSION` — line 37
- `MAX_CONSECUTIVE_TOOL_ONLY` — line 37
- `MAX_ITERATIONS` — line 37
- `MAX_CONTEXT_CHARS` — line 37
- `getSessionPath` — line 51
- `loadSession` — line 51
- `saveSession` — line 51
- `saveSessionMessages` — line 51
- `stageFile` — line 51
- `applySession` — line 51
- `discardSession` — line 51
- `pruneOldSessions` — line 51
- `pruneOldWorktrees` — line 51
- `ensureSessionHydrated` — line 51
- `clearSessionCache` — line 51
- `getWorkspaceRoot` — line 51
- `isGitWorktreeActive` — line 51
- `ensureGitSession` — line 68
- `isGitSessionActive` — line 68
- `getGitStatus` — line 68
- `commitStagedSession` — line 68
- `mergeAgentBranch` — line 68
- `createPullRequest` — line 68
- `detectMergeConflicts` — line 68
- `cleanupGitSession` — line 68
- `discardGitSession` — line 68
- `isGitRepository` — line 80
- `hasGhCli` — line 80
- `isBinary` — line 83
- `AGENT_TOOLS` — line 84
- `AGENT_TOOLS_OPENAI` — line 84
- `executeToolWithTimeout` — line 85
- `listDirRecursive` — line 85
- `searchInDir` — line 85
- `SYSTEM_PROMPT` — line 88
- `findAvailableModel` — line 91
- `checkOllamaHealth` — line 91
- `pingOllama` — line 91
- `supportsToolCalling` — line 91
- `MODEL_META` — line 91
- `runAgentLoop` — line 95
- `runValidationPipeline` — line 98
- `getSessionValidation` — line 98
- `getValidationPolicy` — line 99
- `validationBlocksCommit` — line 99
- `isMongoPersistenceEnabled` — line 108
- `ensureMongoConnection` — line 108
- `syncSessionToMongo` — line 108
- `appendAuditEntry` — line 108
- `getTaskFromMongo` — line 108
- `sessionFromMongoDoc` — line 108
- `listTasksFromMongo` — line 108
- `getAuditLog` — line 108
- `updateTaskValidation` — line 108
- `isAuthRequired` — line 121
- `resolveAgentAuth` — line 121
- `bindSessionAuth` — line 121
- `bindSessionAuthAsync` — line 121
- `extractBearerToken` — line 121
- `enqueueHeadlessTask` — line 131
- `dequeueHeadlessTask` — line 131
- `getQueueDepth` — line 131
- `connectQueue` — line 131
- `disconnectQueue` — line 131
- `isQueueEnabled` — line 131
- `acquireTenantStreamSlot` — line 131
- `releaseTenantStreamSlot` — line 131
- `isAgentMessageRateLimited` — line 131
- `resetAgentRateLimitFallback` — line 131
- `listDeadLetterJobs` — line 131
- `handleJobFailure` — line 131
- `requeueHeadlessTask` — line 131
- `moveJobToDeadLetter` — line 131
- `MAX_CONCURRENT_STREAMS_PER_TENANT` — line 131
- `MAX_AGENT_MESSAGES_PER_MINUTE` — line 131
- `processHeadlessJob` — line 149
- `runWorkerLoop` — line 149
- `shutdownWorker` — line 149
- `emitAutomationEvent` — line 152
- `emitAgentAutomationEvent` — line 152
- `emitCommerceAutomationEvent` — line 152
- `AUTOMATION_EVENTS_CHANNEL` — line 154
- `AUTOMATION_SCHEMA_DOC` — line 154
- `AGENT_TRIGGER_TYPES` — line 154

---

## Junior Q&A

--------------------------------------------------------------------------------------------------------------------------------------------
**[0] What does this file do?**
--------------------------------------------------------------------------------------------------------------------------------------------

**ANS.** Application module. Main exports: `getAgentConfig`, `shouldUseGitWorktree`, `getMonorepoRoot`.

--------------------------------------------------------------------------------------------------------------------------------------------
**[1] What is `getAgentConfig`?**
--------------------------------------------------------------------------------------------------------------------------------------------

**ANS.** Exported symbol — open source at **packages/agent/src/index.ts:17** and read the function body.

--------------------------------------------------------------------------------------------------------------------------------------------
**[2] What breaks if we delete this file?**
--------------------------------------------------------------------------------------------------------------------------------------------

**ANS.** Search imports: `rg "index" apps packages --glob '*.{ts,tsx}'`.

--------------------------------------------------------------------------------------------------------------------------------------------
**[3] What is `shouldUseGitWorktree`?**
--------------------------------------------------------------------------------------------------------------------------------------------

**ANS.** Second export at **packages/agent/src/index.ts:17**.

**More:** [14-junior-qa-react.md](../interview-prep/14-junior-qa-react.md) · [15-junior-qa-mern.md](../interview-prep/15-junior-qa-mern.md)

---
_Auto-generated by `scripts/generate-interview-prep.mjs`. Hand-enriched ★ files are skipped._
