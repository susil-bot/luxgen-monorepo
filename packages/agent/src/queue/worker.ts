import { ensureGitSession } from '../git/service';
import { runAgentLoop } from '../core/orchestrator';
import { loadSession, saveSession, pruneOldSessions } from '../changeset/session-store';
import { appendAuditEntry, syncSessionToMongo } from '../persistence/mongo';
import { runValidationPipeline } from '../validation/pipeline';
import { emitAgentAutomationEvent } from '../automation/bridge';
import { dequeueHeadlessTask, disconnectQueue, connectQueue } from './redis-queue';
import type { HeadlessTaskJob } from '../types/task';

export async function processHeadlessJob(job: HeadlessTaskJob): Promise<void> {
  const session = loadSession(job.sessionId);
  session.tenantId = job.tenantId;
  session.userId = job.userId;
  session.mode = 'headless';
  session.status = 'running';
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

  if (Object.keys(updated.files).length > 0) {
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

    // Mark as validating before running checks so task status is accurate.
    updated.status = 'validating';
    saveSession(updated);
    await syncSessionToMongo(updated);

    const validation = await runValidationPipeline(job.sessionId);

    // Update final status based on validation outcome.
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
  }
}

export async function runWorkerLoop(options: { pollIntervalMs?: number } = {}): Promise<void> {
  const pollIntervalMs = options.pollIntervalMs ?? 1000;
  const connected = await connectQueue();
  if (!connected) {
    throw new Error('Redis queue not available. Set REDIS_URL and AGENT_QUEUE_ENABLED.');
  }

  console.log('[agent-worker] Listening for headless tasks…');
  const pruned = pruneOldSessions();
  if (pruned > 0) console.log(`[agent-worker] Pruned ${pruned} expired session file(s)`);

  while (true) {
    try {
      const job = await dequeueHeadlessTask(5);
      if (!job) {
        await sleep(pollIntervalMs);
        continue;
      }

      console.log(`[agent-worker] Processing job ${job.id} session=${job.sessionId}`);
      await processHeadlessJob(job);
      console.log(`[agent-worker] Completed job ${job.id}`);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      console.error('[agent-worker] Error:', message);
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
