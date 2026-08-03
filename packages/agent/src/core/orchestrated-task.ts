/**
 * Developer -> Reviewer -> PM Tester orchestration loop.
 *
 * This is the "orchestrator" in the product sense — it drives three role passes through the
 * *existing* single LLM engine (`runAgentLoop`) with different system prompts and tool
 * permissions, rather than standing up a separate agent runtime. See docs/AGENT_ORCHESTRATOR.md
 * for the full design and why it's built this way (reuse over reinvention: the Developer role IS
 * runAgentLoop, the deterministic half of code review IS the existing validation pipeline,
 * staging/commit/merge/PR are the existing git/service.ts functions).
 *
 * Cost control: deterministic checks (lint/typecheck/test via runValidationPipeline) always run
 * before either LLM review role, and a failure there skips both roles entirely — no LLM call
 * reviews code that doesn't even pass its linter. The loop is hard-bounded by
 * MAX_ORCHESTRATOR_ITERATIONS; a task that can't converge needs a human, not more retries.
 */
import { runAgentLoop } from './orchestrator';
import { runReviewerPass, runPMTesterPass } from './roles';
import { runValidationPipeline } from '../validation/pipeline';
import { loadSession, saveSession } from '../changeset/session-store';
import { appendAuditEntry, syncSessionToMongo } from '../persistence/mongo';
import { emitAgentAutomationEvent } from '../automation/bridge';
import { MAX_ORCHESTRATOR_ITERATIONS } from '../config/limits';
import type { TaskStatus, AuditAction } from '../types/task';
import type { ChatMessage, AgentEvent } from '../types/events';
import type { ValidationResult } from '../types/validation';
import type { RoleReviewResult } from '../types/review';

export interface RunOrchestratedTaskParams {
  sessionId: string;
  tenantId: string;
  userId: string;
  messages: ChatMessage[];
  ollamaHost: string;
  model?: string;
}

export interface RunOrchestratedTaskResult {
  finalStatus: TaskStatus;
  iterations: number;
  /** True only when both Reviewer and PM Tester approved before the file count went to zero. */
  converged: boolean;
}

async function setStatus(sessionId: string, status: TaskStatus): Promise<void> {
  const session = loadSession(sessionId);
  session.status = status;
  session.updatedAt = Date.now();
  saveSession(session);
  await syncSessionToMongo(session);
}

async function audit(
  sessionId: string,
  tenantId: string,
  userId: string,
  action: AuditAction,
  details: Record<string, unknown>,
): Promise<void> {
  await appendAuditEntry({ sessionId, tenantId, userId, action, details });
}

function recordRoleResult(sessionId: string, iteration: number, result: RoleReviewResult): void {
  const session = loadSession(sessionId);
  session.orchestration = {
    role: result.role,
    iteration,
    maxIterations: MAX_ORCHESTRATOR_ITERATIONS,
    reviewer: result.role === 'reviewer' ? result : session.orchestration?.reviewer,
    pmTester: result.role === 'pm_tester' ? result : session.orchestration?.pmTester,
  };
  session.updatedAt = Date.now();
  saveSession(session);
}

function markIterationLimitReached(sessionId: string): void {
  const session = loadSession(sessionId);
  session.orchestration = {
    role: session.orchestration?.role ?? 'developer',
    iteration: MAX_ORCHESTRATOR_ITERATIONS,
    maxIterations: MAX_ORCHESTRATOR_ITERATIONS,
    reviewer: session.orchestration?.reviewer,
    pmTester: session.orchestration?.pmTester,
    iterationLimitReached: true,
  };
  session.updatedAt = Date.now();
  saveSession(session);
}

function summarizeValidation(validation: ValidationResult): string {
  return validation.checks
    .filter((c) => !c.passed)
    .map((c) => `- [${c.scope}] ${c.name}:\n${c.output.slice(0, 1500)}`)
    .join('\n\n');
}

/** Runs the Developer role and captures its response text so it can be replayed as conversation
 * history on the next iteration (runAgentLoop itself is stateless across calls — the staged
 * files persist via the session store, but the chat transcript does not). */
async function runDeveloperPass(params: {
  sessionId: string;
  messages: ChatMessage[];
  ollamaHost: string;
  model?: string;
}): Promise<string> {
  let collected = '';
  const onEvent = (event: AgentEvent) => {
    if (event.type === 'text' && typeof event.content === 'string') collected += event.content;
  };

  await runAgentLoop({
    sessionId: params.sessionId,
    messages: params.messages,
    ollamaHost: params.ollamaHost,
    model: params.model,
    onEvent,
  });

  return collected;
}

export async function runOrchestratedTask(params: RunOrchestratedTaskParams): Promise<RunOrchestratedTaskResult> {
  const { sessionId, tenantId, userId, ollamaHost, model } = params;
  const originalPrompt = params.messages.find((m) => m.role === 'user')?.content;
  let conversation: ChatMessage[] = [...params.messages];

  for (let iteration = 1; iteration <= MAX_ORCHESTRATOR_ITERATIONS; iteration++) {
    await setStatus(sessionId, 'running');
    await audit(sessionId, tenantId, userId, 'run_started', { iteration });

    const developerText = await runDeveloperPass({ sessionId, messages: conversation, ollamaHost, model });
    if (developerText.trim()) {
      conversation = [...conversation, { role: 'assistant', content: developerText }];
    }

    const afterDev = loadSession(sessionId);
    const fileCount = Object.keys(afterDev.files).length;

    if (fileCount === 0) {
      // Developer made no changes (e.g. decided the request needs clarification, or errored).
      // Nothing to review — hand back to a human rather than looping on empty output.
      await setStatus(sessionId, 'pending_review');
      return { finalStatus: 'pending_review', iterations: iteration, converged: false };
    }

    await setStatus(sessionId, 'staged');
    await audit(sessionId, tenantId, userId, 'staged', { fileCount, iteration });
    await emitAgentAutomationEvent(tenantId, 'staged', { sessionId, fileCount, userId }).catch(() => {});

    await setStatus(sessionId, 'validating');
    const validation = await runValidationPipeline(sessionId);
    await audit(sessionId, tenantId, userId, 'validated', {
      passed: validation.passed,
      checkCount: validation.checks.length,
      iteration,
    });

    if (!validation.passed) {
      if (iteration === MAX_ORCHESTRATOR_ITERATIONS) {
        await setStatus(sessionId, 'staged');
        markIterationLimitReached(sessionId);
        await audit(sessionId, tenantId, userId, 'iteration_limit_reached', { stoppedAt: 'validation', iteration });
        return { finalStatus: 'staged', iterations: iteration, converged: false };
      }
      // Deterministic failure — feed it back without spending an LLM call on Reviewer/PM Tester
      // for code that doesn't even pass lint/typecheck/test yet.
      conversation = [
        ...conversation,
        {
          role: 'user',
          content: `Automated checks failed (lint/typecheck/test):\n\n${summarizeValidation(validation)}\n\nFix these issues in the staged files.`,
        },
      ];
      continue;
    }

    await setStatus(sessionId, 'reviewing');
    await audit(sessionId, tenantId, userId, 'review_started', { iteration });
    const reviewResult = await runReviewerPass({ sessionId, ollamaHost, model, iteration, originalPrompt });
    recordRoleResult(sessionId, iteration, reviewResult);
    await audit(
      sessionId,
      tenantId,
      userId,
      reviewResult.verdict === 'approved' ? 'review_passed' : 'review_changes_requested',
      { iteration, verdictParsed: reviewResult.verdictParsed },
    );

    if (reviewResult.verdict !== 'approved') {
      if (iteration === MAX_ORCHESTRATOR_ITERATIONS) {
        await setStatus(sessionId, 'review_changes_requested');
        markIterationLimitReached(sessionId);
        await audit(sessionId, tenantId, userId, 'iteration_limit_reached', { stoppedAt: 'review', iteration });
        return { finalStatus: 'review_changes_requested', iterations: iteration, converged: false };
      }
      conversation = [
        ...conversation,
        { role: 'user', content: `The Reviewer requested changes:\n\n${reviewResult.notes}\n\nAddress these issues in the staged files.` },
      ];
      continue;
    }

    await setStatus(sessionId, 'pm_testing');
    await audit(sessionId, tenantId, userId, 'pm_test_started', { iteration });
    const pmResult = await runPMTesterPass({ sessionId, ollamaHost, model, iteration, originalPrompt });
    recordRoleResult(sessionId, iteration, pmResult);
    await audit(
      sessionId,
      tenantId,
      userId,
      pmResult.verdict === 'approved' ? 'pm_test_passed' : 'pm_test_changes_requested',
      { iteration, verdictParsed: pmResult.verdictParsed },
    );

    if (pmResult.verdict !== 'approved') {
      if (iteration === MAX_ORCHESTRATOR_ITERATIONS) {
        await setStatus(sessionId, 'pm_test_changes_requested');
        markIterationLimitReached(sessionId);
        await audit(sessionId, tenantId, userId, 'iteration_limit_reached', { stoppedAt: 'pm_test', iteration });
        return { finalStatus: 'pm_test_changes_requested', iterations: iteration, converged: false };
      }
      conversation = [
        ...conversation,
        { role: 'user', content: `The PM Tester found unmet acceptance criteria:\n\n${pmResult.notes}\n\nAddress these gaps in the staged files.` },
      ];
      continue;
    }

    // Both roles approved — hand off to the existing human-approval checkpoint (commit/merge
    // remain explicit actions the caller decides on, same as the pre-orchestrator pipeline).
    await setStatus(sessionId, 'pending_review');
    await audit(sessionId, tenantId, userId, 'approved', { iteration });
    return { finalStatus: 'pending_review', iterations: iteration, converged: true };
  }

  // Unreachable — the loop always returns by MAX_ORCHESTRATOR_ITERATIONS. Kept for type safety.
  const finalSession = loadSession(sessionId);
  return { finalStatus: finalSession.status || 'failed', iterations: MAX_ORCHESTRATOR_ITERATIONS, converged: false };
}
