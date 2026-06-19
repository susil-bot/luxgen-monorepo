'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.checkOllamaHealth =
  exports.findAvailableModel =
  exports.SYSTEM_PROMPT =
  exports.searchInDir =
  exports.listDirRecursive =
  exports.executeToolWithTimeout =
  exports.AGENT_TOOLS_OPENAI =
  exports.AGENT_TOOLS =
  exports.isBinary =
  exports.hasGhCli =
  exports.isGitRepository =
  exports.discardGitSession =
  exports.cleanupGitSession =
  exports.detectMergeConflicts =
  exports.createPullRequest =
  exports.mergeAgentBranch =
  exports.commitStagedSession =
  exports.getGitStatus =
  exports.isGitSessionActive =
  exports.ensureGitSession =
  exports.isGitWorktreeActive =
  exports.getWorkspaceRoot =
  exports.discardSession =
  exports.applySession =
  exports.stageFile =
  exports.saveSession =
  exports.loadSession =
  exports.getSessionPath =
  exports.MAX_CONTEXT_CHARS =
  exports.MAX_ITERATIONS =
  exports.MAX_CONSECUTIVE_TOOL_ONLY =
  exports.MAX_STAGED_FILES_PER_SESSION =
  exports.MAX_TOTAL_TOOL_CALLS =
  exports.MAX_TOOL_CALLS_PER_RESPONSE =
  exports.MAX_READ_CHARS =
  exports.MAX_DIR_ENTRIES =
  exports.MAX_FILE_SIZE =
  exports.TOOL_TIMEOUTS =
  exports.isSensitiveFile =
  exports.SENSITIVE_FILE_PATTERNS =
  exports.isPathAllowed =
  exports.ALLOWED_PATHS =
  exports.sanitizeSessionId =
  exports.getAgentBranchName =
  exports.getWorktreePath =
  exports.getWorktreesDir =
  exports.getStagingDir =
  exports.getMonorepoRoot =
  exports.shouldUseGitWorktree =
  exports.getAgentConfig =
    void 0;
exports.shutdownWorker =
  exports.runWorkerLoop =
  exports.processHeadlessJob =
  exports.isQueueEnabled =
  exports.disconnectQueue =
  exports.connectQueue =
  exports.getQueueDepth =
  exports.dequeueHeadlessTask =
  exports.enqueueHeadlessTask =
  exports.extractBearerToken =
  exports.bindSessionAuth =
  exports.resolveAgentAuth =
  exports.isAuthRequired =
  exports.updateTaskValidation =
  exports.getAuditLog =
  exports.getTaskFromMongo =
  exports.appendAuditEntry =
  exports.syncSessionToMongo =
  exports.ensureMongoConnection =
  exports.isMongoPersistenceEnabled =
  exports.validationBlocksCommit =
  exports.getValidationPolicy =
  exports.getSessionValidation =
  exports.runValidationPipeline =
  exports.runAgentLoop =
  exports.MODEL_META =
  exports.supportsToolCalling =
  exports.pingOllama =
    void 0;
// Config
var agent_mode_1 = require('./config/agent-mode');
Object.defineProperty(exports, 'getAgentConfig', {
  enumerable: true,
  get: function () {
    return agent_mode_1.getAgentConfig;
  },
});
Object.defineProperty(exports, 'shouldUseGitWorktree', {
  enumerable: true,
  get: function () {
    return agent_mode_1.shouldUseGitWorktree;
  },
});
var paths_1 = require('./config/paths');
Object.defineProperty(exports, 'getMonorepoRoot', {
  enumerable: true,
  get: function () {
    return paths_1.getMonorepoRoot;
  },
});
Object.defineProperty(exports, 'getStagingDir', {
  enumerable: true,
  get: function () {
    return paths_1.getStagingDir;
  },
});
Object.defineProperty(exports, 'getWorktreesDir', {
  enumerable: true,
  get: function () {
    return paths_1.getWorktreesDir;
  },
});
Object.defineProperty(exports, 'getWorktreePath', {
  enumerable: true,
  get: function () {
    return paths_1.getWorktreePath;
  },
});
Object.defineProperty(exports, 'getAgentBranchName', {
  enumerable: true,
  get: function () {
    return paths_1.getAgentBranchName;
  },
});
Object.defineProperty(exports, 'sanitizeSessionId', {
  enumerable: true,
  get: function () {
    return paths_1.sanitizeSessionId;
  },
});
Object.defineProperty(exports, 'ALLOWED_PATHS', {
  enumerable: true,
  get: function () {
    return paths_1.ALLOWED_PATHS;
  },
});
Object.defineProperty(exports, 'isPathAllowed', {
  enumerable: true,
  get: function () {
    return paths_1.isPathAllowed;
  },
});
Object.defineProperty(exports, 'SENSITIVE_FILE_PATTERNS', {
  enumerable: true,
  get: function () {
    return paths_1.SENSITIVE_FILE_PATTERNS;
  },
});
Object.defineProperty(exports, 'isSensitiveFile', {
  enumerable: true,
  get: function () {
    return paths_1.isSensitiveFile;
  },
});
var limits_1 = require('./config/limits');
Object.defineProperty(exports, 'TOOL_TIMEOUTS', {
  enumerable: true,
  get: function () {
    return limits_1.TOOL_TIMEOUTS;
  },
});
Object.defineProperty(exports, 'MAX_FILE_SIZE', {
  enumerable: true,
  get: function () {
    return limits_1.MAX_FILE_SIZE;
  },
});
Object.defineProperty(exports, 'MAX_DIR_ENTRIES', {
  enumerable: true,
  get: function () {
    return limits_1.MAX_DIR_ENTRIES;
  },
});
Object.defineProperty(exports, 'MAX_READ_CHARS', {
  enumerable: true,
  get: function () {
    return limits_1.MAX_READ_CHARS;
  },
});
Object.defineProperty(exports, 'MAX_TOOL_CALLS_PER_RESPONSE', {
  enumerable: true,
  get: function () {
    return limits_1.MAX_TOOL_CALLS_PER_RESPONSE;
  },
});
Object.defineProperty(exports, 'MAX_TOTAL_TOOL_CALLS', {
  enumerable: true,
  get: function () {
    return limits_1.MAX_TOTAL_TOOL_CALLS;
  },
});
Object.defineProperty(exports, 'MAX_STAGED_FILES_PER_SESSION', {
  enumerable: true,
  get: function () {
    return limits_1.MAX_STAGED_FILES_PER_SESSION;
  },
});
Object.defineProperty(exports, 'MAX_CONSECUTIVE_TOOL_ONLY', {
  enumerable: true,
  get: function () {
    return limits_1.MAX_CONSECUTIVE_TOOL_ONLY;
  },
});
Object.defineProperty(exports, 'MAX_ITERATIONS', {
  enumerable: true,
  get: function () {
    return limits_1.MAX_ITERATIONS;
  },
});
Object.defineProperty(exports, 'MAX_CONTEXT_CHARS', {
  enumerable: true,
  get: function () {
    return limits_1.MAX_CONTEXT_CHARS;
  },
});
// Changeset
var session_store_1 = require('./changeset/session-store');
Object.defineProperty(exports, 'getSessionPath', {
  enumerable: true,
  get: function () {
    return session_store_1.getSessionPath;
  },
});
Object.defineProperty(exports, 'loadSession', {
  enumerable: true,
  get: function () {
    return session_store_1.loadSession;
  },
});
Object.defineProperty(exports, 'saveSession', {
  enumerable: true,
  get: function () {
    return session_store_1.saveSession;
  },
});
Object.defineProperty(exports, 'stageFile', {
  enumerable: true,
  get: function () {
    return session_store_1.stageFile;
  },
});
Object.defineProperty(exports, 'applySession', {
  enumerable: true,
  get: function () {
    return session_store_1.applySession;
  },
});
Object.defineProperty(exports, 'discardSession', {
  enumerable: true,
  get: function () {
    return session_store_1.discardSession;
  },
});
Object.defineProperty(exports, 'getWorkspaceRoot', {
  enumerable: true,
  get: function () {
    return session_store_1.getWorkspaceRoot;
  },
});
Object.defineProperty(exports, 'isGitWorktreeActive', {
  enumerable: true,
  get: function () {
    return session_store_1.isGitWorktreeActive;
  },
});
// Git
var service_1 = require('./git/service');
Object.defineProperty(exports, 'ensureGitSession', {
  enumerable: true,
  get: function () {
    return service_1.ensureGitSession;
  },
});
Object.defineProperty(exports, 'isGitSessionActive', {
  enumerable: true,
  get: function () {
    return service_1.isGitSessionActive;
  },
});
Object.defineProperty(exports, 'getGitStatus', {
  enumerable: true,
  get: function () {
    return service_1.getGitStatus;
  },
});
Object.defineProperty(exports, 'commitStagedSession', {
  enumerable: true,
  get: function () {
    return service_1.commitStagedSession;
  },
});
Object.defineProperty(exports, 'mergeAgentBranch', {
  enumerable: true,
  get: function () {
    return service_1.mergeAgentBranch;
  },
});
Object.defineProperty(exports, 'createPullRequest', {
  enumerable: true,
  get: function () {
    return service_1.createPullRequest;
  },
});
Object.defineProperty(exports, 'detectMergeConflicts', {
  enumerable: true,
  get: function () {
    return service_1.detectMergeConflicts;
  },
});
Object.defineProperty(exports, 'cleanupGitSession', {
  enumerable: true,
  get: function () {
    return service_1.cleanupGitSession;
  },
});
Object.defineProperty(exports, 'discardGitSession', {
  enumerable: true,
  get: function () {
    return service_1.discardGitSession;
  },
});
var exec_1 = require('./git/exec');
Object.defineProperty(exports, 'isGitRepository', {
  enumerable: true,
  get: function () {
    return exec_1.isGitRepository;
  },
});
Object.defineProperty(exports, 'hasGhCli', {
  enumerable: true,
  get: function () {
    return exec_1.hasGhCli;
  },
});
// Tools
var binary_1 = require('./tools/binary');
Object.defineProperty(exports, 'isBinary', {
  enumerable: true,
  get: function () {
    return binary_1.isBinary;
  },
});
var definitions_1 = require('./tools/definitions');
Object.defineProperty(exports, 'AGENT_TOOLS', {
  enumerable: true,
  get: function () {
    return definitions_1.AGENT_TOOLS;
  },
});
Object.defineProperty(exports, 'AGENT_TOOLS_OPENAI', {
  enumerable: true,
  get: function () {
    return definitions_1.AGENT_TOOLS_OPENAI;
  },
});
var execute_1 = require('./tools/execute');
Object.defineProperty(exports, 'executeToolWithTimeout', {
  enumerable: true,
  get: function () {
    return execute_1.executeToolWithTimeout;
  },
});
Object.defineProperty(exports, 'listDirRecursive', {
  enumerable: true,
  get: function () {
    return execute_1.listDirRecursive;
  },
});
Object.defineProperty(exports, 'searchInDir', {
  enumerable: true,
  get: function () {
    return execute_1.searchInDir;
  },
});
// Prompts
var system_1 = require('./prompts/system');
Object.defineProperty(exports, 'SYSTEM_PROMPT', {
  enumerable: true,
  get: function () {
    return system_1.SYSTEM_PROMPT;
  },
});
// Providers
var ollama_1 = require('./providers/ollama');
Object.defineProperty(exports, 'findAvailableModel', {
  enumerable: true,
  get: function () {
    return ollama_1.findAvailableModel;
  },
});
Object.defineProperty(exports, 'checkOllamaHealth', {
  enumerable: true,
  get: function () {
    return ollama_1.checkOllamaHealth;
  },
});
Object.defineProperty(exports, 'pingOllama', {
  enumerable: true,
  get: function () {
    return ollama_1.pingOllama;
  },
});
Object.defineProperty(exports, 'supportsToolCalling', {
  enumerable: true,
  get: function () {
    return ollama_1.supportsToolCalling;
  },
});
Object.defineProperty(exports, 'MODEL_META', {
  enumerable: true,
  get: function () {
    return ollama_1.MODEL_META;
  },
});
// Core
var orchestrator_1 = require('./core/orchestrator');
Object.defineProperty(exports, 'runAgentLoop', {
  enumerable: true,
  get: function () {
    return orchestrator_1.runAgentLoop;
  },
});
// Validation
var pipeline_1 = require('./validation/pipeline');
Object.defineProperty(exports, 'runValidationPipeline', {
  enumerable: true,
  get: function () {
    return pipeline_1.runValidationPipeline;
  },
});
Object.defineProperty(exports, 'getSessionValidation', {
  enumerable: true,
  get: function () {
    return pipeline_1.getSessionValidation;
  },
});
var policy_1 = require('./validation/policy');
Object.defineProperty(exports, 'getValidationPolicy', {
  enumerable: true,
  get: function () {
    return policy_1.getValidationPolicy;
  },
});
Object.defineProperty(exports, 'validationBlocksCommit', {
  enumerable: true,
  get: function () {
    return policy_1.validationBlocksCommit;
  },
});
// Persistence
var mongo_1 = require('./persistence/mongo');
Object.defineProperty(exports, 'isMongoPersistenceEnabled', {
  enumerable: true,
  get: function () {
    return mongo_1.isMongoPersistenceEnabled;
  },
});
Object.defineProperty(exports, 'ensureMongoConnection', {
  enumerable: true,
  get: function () {
    return mongo_1.ensureMongoConnection;
  },
});
Object.defineProperty(exports, 'syncSessionToMongo', {
  enumerable: true,
  get: function () {
    return mongo_1.syncSessionToMongo;
  },
});
Object.defineProperty(exports, 'appendAuditEntry', {
  enumerable: true,
  get: function () {
    return mongo_1.appendAuditEntry;
  },
});
Object.defineProperty(exports, 'getTaskFromMongo', {
  enumerable: true,
  get: function () {
    return mongo_1.getTaskFromMongo;
  },
});
Object.defineProperty(exports, 'getAuditLog', {
  enumerable: true,
  get: function () {
    return mongo_1.getAuditLog;
  },
});
Object.defineProperty(exports, 'updateTaskValidation', {
  enumerable: true,
  get: function () {
    return mongo_1.updateTaskValidation;
  },
});
// Auth
var context_1 = require('./auth/context');
Object.defineProperty(exports, 'isAuthRequired', {
  enumerable: true,
  get: function () {
    return context_1.isAuthRequired;
  },
});
Object.defineProperty(exports, 'resolveAgentAuth', {
  enumerable: true,
  get: function () {
    return context_1.resolveAgentAuth;
  },
});
Object.defineProperty(exports, 'bindSessionAuth', {
  enumerable: true,
  get: function () {
    return context_1.bindSessionAuth;
  },
});
Object.defineProperty(exports, 'extractBearerToken', {
  enumerable: true,
  get: function () {
    return context_1.extractBearerToken;
  },
});
// Queue
var redis_queue_1 = require('./queue/redis-queue');
Object.defineProperty(exports, 'enqueueHeadlessTask', {
  enumerable: true,
  get: function () {
    return redis_queue_1.enqueueHeadlessTask;
  },
});
Object.defineProperty(exports, 'dequeueHeadlessTask', {
  enumerable: true,
  get: function () {
    return redis_queue_1.dequeueHeadlessTask;
  },
});
Object.defineProperty(exports, 'getQueueDepth', {
  enumerable: true,
  get: function () {
    return redis_queue_1.getQueueDepth;
  },
});
Object.defineProperty(exports, 'connectQueue', {
  enumerable: true,
  get: function () {
    return redis_queue_1.connectQueue;
  },
});
Object.defineProperty(exports, 'disconnectQueue', {
  enumerable: true,
  get: function () {
    return redis_queue_1.disconnectQueue;
  },
});
Object.defineProperty(exports, 'isQueueEnabled', {
  enumerable: true,
  get: function () {
    return redis_queue_1.isQueueEnabled;
  },
});
var worker_1 = require('./queue/worker');
Object.defineProperty(exports, 'processHeadlessJob', {
  enumerable: true,
  get: function () {
    return worker_1.processHeadlessJob;
  },
});
Object.defineProperty(exports, 'runWorkerLoop', {
  enumerable: true,
  get: function () {
    return worker_1.runWorkerLoop;
  },
});
Object.defineProperty(exports, 'shutdownWorker', {
  enumerable: true,
  get: function () {
    return worker_1.shutdownWorker;
  },
});
