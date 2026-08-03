/**
 * Types for the Developer -> Reviewer -> PM Tester orchestration loop.
 *
 * The Developer role is the existing `runAgentLoop` (packages/agent/src/core/orchestrator.ts) —
 * no new type needed there. Reviewer and PM Tester reuse the same `runAgentLoop` engine with a
 * different system prompt and a read-only `toolFilter` (see core/roles.ts), so their "opinion"
 * comes back as free-text that must be parsed into a deterministic verdict. See
 * docs/AGENT_ORCHESTRATOR.md for the full state machine.
 */

export type OrchestrationRole = 'developer' | 'reviewer' | 'pm_tester';

export type ReviewVerdict = 'approved' | 'changes_requested';

export interface RoleReviewResult {
  role: 'reviewer' | 'pm_tester';
  verdict: ReviewVerdict;
  /** Full free-text response from the role's LLM pass (issues found, or approval rationale). */
  notes: string;
  /** True only when the model's response contained a parseable VERDICT: line. False means we
   * couldn't parse a verdict and conservatively treated it as changes_requested (fail-safe —
   * never auto-approve on an ambiguous response). */
  verdictParsed: boolean;
  iteration: number;
  ranAt: number;
}

export interface OrchestrationState {
  /** Which role is currently executing (or last executed) this iteration. */
  role: OrchestrationRole;
  /** 1-indexed loop count. Bounded by MAX_ORCHESTRATOR_ITERATIONS (config/limits.ts). */
  iteration: number;
  maxIterations: number;
  reviewer?: RoleReviewResult;
  pmTester?: RoleReviewResult;
  /** Set when the loop stopped because maxIterations was reached without both roles approving. */
  iterationLimitReached?: boolean;
}
