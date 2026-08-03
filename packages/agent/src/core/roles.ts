import { runAgentLoop } from './orchestrator';
import { buildSessionDiffSummary } from './diff';
import { REVIEWER_SYSTEM_PROMPT, PM_TESTER_SYSTEM_PROMPT } from '../prompts/roles';
import type { RoleReviewResult } from '../types/review';
import type { AgentEvent } from '../types/events';

const VERDICT_PATTERN = /VERDICT:\s*(APPROVED|CHANGES_REQUESTED)/i;

/** Read-only — Reviewer and PM Tester report findings, they never stage files themselves. */
const READ_ONLY_TOOLS = ['read_file', 'list_files', 'search_code'];

function parseVerdict(text: string): { approved: boolean; parsed: boolean } {
  const match = text.match(VERDICT_PATTERN);
  if (!match) {
    // Fail-safe: an unparseable response is treated as changes_requested, never auto-approved.
    // See docs/AGENT_ORCHESTRATOR.md "Why a VERDICT line" and the security principle of treating
    // all agent output as untrusted until it proves otherwise.
    return { approved: false, parsed: false };
  }
  return { approved: match[1].toUpperCase() === 'APPROVED', parsed: true };
}

interface RunRolePassParams {
  sessionId: string;
  ollamaHost: string;
  model?: string;
  iteration: number;
}

async function runRolePass(
  role: 'reviewer' | 'pm_tester',
  systemPrompt: string,
  userPrompt: string,
  params: RunRolePassParams,
): Promise<RoleReviewResult> {
  let collected = '';

  const onEvent = (event: AgentEvent) => {
    if (event.type === 'text' && typeof event.content === 'string') {
      collected += event.content;
    }
  };

  await runAgentLoop({
    sessionId: params.sessionId,
    messages: [{ role: 'user', content: userPrompt }],
    ollamaHost: params.ollamaHost,
    model: params.model,
    systemPrompt,
    toolFilter: READ_ONLY_TOOLS,
    onEvent,
  });

  const { approved, parsed } = parseVerdict(collected);

  return {
    role,
    verdict: approved ? 'approved' : 'changes_requested',
    notes: collected.trim() || '(role returned no text — treated as changes_requested)',
    verdictParsed: parsed,
    iteration: params.iteration,
    ranAt: Date.now(),
  };
}

export async function runReviewerPass(
  params: RunRolePassParams & { originalPrompt?: string },
): Promise<RoleReviewResult> {
  const diff = buildSessionDiffSummary(params.sessionId);
  const userPrompt = [
    params.originalPrompt ? `## Original task\n${params.originalPrompt}` : '',
    `## Staged diff to review\n${diff}`,
    'Review the diff above per your instructions and end with a VERDICT line.',
  ]
    .filter(Boolean)
    .join('\n\n');

  return runRolePass('reviewer', REVIEWER_SYSTEM_PROMPT, userPrompt, params);
}

export async function runPMTesterPass(
  params: RunRolePassParams & { originalPrompt?: string },
): Promise<RoleReviewResult> {
  const diff = buildSessionDiffSummary(params.sessionId);
  const userPrompt = [
    `## Feature request / acceptance criteria\n${params.originalPrompt || '(no prompt recorded for this session)'}`,
    `## Staged diff to validate against the above\n${diff}`,
    'Check the diff against every criterion in the feature request per your instructions and end with a VERDICT line.',
  ].join('\n\n');

  return runRolePass('pm_tester', PM_TESTER_SYSTEM_PROMPT, userPrompt, params);
}
