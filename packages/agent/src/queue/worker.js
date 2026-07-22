'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.processHeadlessJob = processHeadlessJob;
exports.runWorkerLoop = runWorkerLoop;
exports.shutdownWorker = shutdownWorker;
const service_1 = require('../git/service');
const orchestrator_1 = require('../core/orchestrator');
const session_store_1 = require('../changeset/session-store');
const mongo_1 = require('../persistence/mongo');
const pipeline_1 = require('../validation/pipeline');
const redis_queue_1 = require('./redis-queue');
async function processHeadlessJob(job) {
  const session = (0, session_store_1.loadSession)(job.sessionId);
  session.tenantId = job.tenantId;
  session.userId = job.userId;
  session.mode = 'headless';
  session.status = 'running';
  (0, session_store_1.saveSession)(session);
  await (0, mongo_1.syncSessionToMongo)(session);
  await (0, mongo_1.appendAuditEntry)({
    sessionId: job.sessionId,
    tenantId: job.tenantId,
    userId: job.userId,
    action: 'run_started',
    details: { jobId: job.id, mode: 'headless' },
  });
  await (0, service_1.ensureGitSession)(job.sessionId);
  await (0, orchestrator_1.runAgentLoop)({
    sessionId: job.sessionId,
    messages: job.messages,
    ollamaHost: job.ollamaHost,
    model: job.model,
    onEvent: () => {},
  });
  const updated = (0, session_store_1.loadSession)(job.sessionId);
  updated.status = Object.keys(updated.files).length > 0 ? 'staged' : 'pending_review';
  (0, session_store_1.saveSession)(updated);
  await (0, mongo_1.syncSessionToMongo)(updated);
  if (Object.keys(updated.files).length > 0) {
    await (0, mongo_1.appendAuditEntry)({
      sessionId: job.sessionId,
      tenantId: job.tenantId,
      userId: job.userId,
      action: 'staged',
      details: { fileCount: Object.keys(updated.files).length },
    });
    const validation = await (0, pipeline_1.runValidationPipeline)(job.sessionId);
    await (0, mongo_1.appendAuditEntry)({
      sessionId: job.sessionId,
      tenantId: job.tenantId,
      userId: job.userId,
      action: 'validated',
      details: { passed: validation.passed, checkCount: validation.checks.length },
    });
  }
}
async function runWorkerLoop(options = {}) {
  const pollIntervalMs = options.pollIntervalMs ?? 1000;
  const connected = await (0, redis_queue_1.connectQueue)();
  if (!connected) {
    throw new Error('Redis queue not available. Set REDIS_URL and AGENT_QUEUE_ENABLED.');
  }
  console.log('[agent-worker] Listening for headless tasks…');
  while (true) {
    try {
      const job = await (0, redis_queue_1.dequeueHeadlessTask)(5);
      if (!job) {
        await sleep(pollIntervalMs);
        continue;
      }
      console.log(`[agent-worker] Processing job ${job.id} session=${job.sessionId}`);
      await processHeadlessJob(job);
      console.log(`[agent-worker] Completed job ${job.id}`);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.error('[agent-worker] Error:', message);
      await sleep(pollIntervalMs);
    }
  }
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function shutdownWorker() {
  await (0, redis_queue_1.disconnectQueue)();
}
