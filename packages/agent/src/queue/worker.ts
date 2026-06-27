import { getAgentConfig } from '../config/agent-mode';
import { ensureGitSession, commitStagedSession, mergeAgentBranch } from '../git/service';
import { runAgentLoop } from '../core/orchestrator';
import {
  loadSession,
  saveSession,
  pruneOldSessions,
  pruneOldWorktrees,
  ensureSessionHydrated,
} from '../changeset/session-store';
import { appendAuditEntry, syncSessionToMongo } from '../persistence/mongo';
import { runValidationPipeline } from '../validation/pipeline';
import { emitAgentAutomationEvent } from '../automation/bridge';
import {
  dequeueHeadlessTask,
  disconnectQueue,
  connectQueue,
  acknowledgeHeadlessTask,
  startStalledJobRecovery,
  handleJobFailure,
} from './redis-queue';
import type { HeadlessTaskJob } from '../types/task';

export async function processHeadlessJob(job: HeadlessTaskJob): Promise<void> {
  await ensureSessionHydrated(job.sessionId);
  const session = loadSession(job.sessionId);
  session.tenantId = job.tenantId;
  session.userId = job.userId;
  session.mode = 'headless';
  session.status = 'running';
  if (job.model) {
    session.metadata = { ...session.metadata, model: job.model };
  }
  saveSession(session);

  await syncSessionToMongo(session);
  await appendAuditEntry({
    sessionId: job.sessionId,
    tenantId: job.tenantId,
    userId: job.userId,
    action: 'run_started',
    details: { jobId: job.id, mode: 'headless' },
  });

  await ensureGitSession(job.sessionId);

  await runAgentLoop({
    sessionId: job.sessionId,
    messages: job.messages,
    ollamaHost: job.ollamaHost,
    model: job.model,
    onEvent: () => {},
  });

  const updated = loadSession(job.sessionId);
  updated.status = Object.keys(updated.files).length > 0 ? 'staged' : 'pending_review';
  saveSession(updated);
  await syncSessionToMongo(updated);

  if (Object.keys(updated.files).length === 0) return;

  await appendAuditEntry({
    sessionId: job.sessionId,
    tenantId: job.tenantId,
    userId: job.userId,
    action: 'staged',
    details: { fileCount: Object.keys(updated.files).length },
  });

  await emitAgentAutomationEvent(job.tenantId, 'staged', {
    sessionId: job.sessionId,
    fileCount: Object.keys(updated.files).length,
    userId: job.userId,
  }).catch(() => {});

  updated.status = 'validating';
  saveSession(updated);
  await syncSessionToMongo(updated);

  const validation = await runValidationPipeline(job.sessionId);

  const afterValidation = loadSession(job.sessionId);
  afterValidation.status = validation.passed ? 'pending_review' : 'staged';
  saveSession(afterValidation);
  await syncSessionToMongo(afterValidation);

  await appendAuditEntry({
    sessionId: job.sessionId,
    tenantId: job.tenantId,
    userId: job.userId,
    action: 'validated',
    details: { passed: validation.passed, checkCount: validation.checks.length },
  });

  if (!validation.passed) return;

  const commitResult = await commitStagedSession(job.sessionId);
  if (!commitResult.commitSha) return;

  const committed = loadSession(job.sessionId);
  committed.status = 'committed';
  saveSession(committed);
  await syncSessionToMongo(committed);

  await appendAuditEntry({
    sessionId: job.sessionId,
    tenantId: job.tenantId,
    userId: job.userId,
    action: 'committed',
    details: { branch: commitResult.branch, commitSha: commitResult.commitSha, files: commitResult.applied },
  });

  await emitAgentAutomationEvent(job.tenantId, 'committed', {
    sessionId: job.sessionId,
    branch: commitResult.branch,
    commitSha: commitResult.commitSha,
    files: commitResult.applied,
  }).catch(() => {});

  if (!getAgentConfig().autoMerge) return;

  const mergeResult = await mergeAgentBranch(job.sessionId);
  if (!mergeResult.merged) {
    const failed = loadSession(job.sessionId);
    failed.status = 'failed';
    saveSession(failed);
    await syncSessionToMongo(failed);
    await appendAuditEntry({
      sessionId: job.sessionId,
      tenantId: job.tenantId,
      userId: job.userId,
      action: 'failed',
      details: { reason: 'merge_failed', errors: mergeResult.errors },
    });
    return;
  }

  const merged = loadSession(job.sessionId);
  merged.status = 'merged';
  saveSession(merged);
  await syncSessionToMongo(merged);

  await appendAuditEntry({
    sessionId: job.sessionId,
    tenantId: job.tenantId,
    userId: job.userId,
    action: 'merged',
    details: {
      baseBranch: mergeResult.baseBranch,
      branch: mergeResult.branch,
      commitSha: mergeResult.commitSha,
    },
  });

  await emitAgentAutomationEvent(job.tenantId, 'merged', {
    sessionId: job.sessionId,
    baseBranch: mergeResult.baseBranch,
    branch: mergeResult.branch,
    commitSha: mergeResult.commitSha,
  }).catch(() => {});
}

export async function runWorkerLoop(options: { pollIntervalMs?: number } = {}): Promise<void> {
  const pollIntervalMs = options.pollIntervalMs ?? 1000;
  const connected = await connectQueue();
  if (!connected) {
    throw new Error('Redis queue not available. Set REDIS_URL and AGENT_QUEUE_ENABLED.');
  }

  console.log('[agent-worker] Listening for headless tasks…');
  startStalledJobRecovery();
  const pruned = pruneOldSessions();
  if (pruned > 0) console.log(`[agent-worker] Pruned ${pruned} expired session file(s)`);
  const prunedWorktrees = await pruneOldWorktrees();
  if (prunedWorktrees > 0) console.log(`[agent-worker] Pruned ${prunedWorktrees} old git worktree(s)`);

  while (true) {
    let currentJob: HeadlessTaskJob | null = null;
    try {
      const job = await dequeueHeadlessTask(5);
      if (!job) {
        await sleep(pollIntervalMs);
        continue;
      }

      currentJob = job;
      console.log(`[agent-worker] Processing job ${job.id} session=${job.sessionId}`);
      await processHeadlessJob(job);
      await acknowledgeHeadlessTask(job.id);
      console.log(`[agent-worker] Completed job ${job.id}`);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      console.error('[agent-worker] Error:', message);
      if (currentJob) {
        await handleJobFailure(currentJob, message);
      }
      await sleep(pollIntervalMs);
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function shutdownWorker(): Promise<void> {
  await disconnectQueue();
}
