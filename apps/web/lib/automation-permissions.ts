/**
 * T-AUTO-10 — role gate for the Tower workflow builder.
 *
 * Maps the TODO spec's permission matrix (Owner/Admin/Manager/Instructor/Learner/
 * Support/Enterprise) onto our actual `UserRole` enum (SUPER_ADMIN/ADMIN/INSTRUCTOR/
 * STUDENT/USER). Spec's "Learner: No access to workflow builder" is the only rule
 * enforced here — Manager vs. Instructor vs. Admin vs. Owner distinctions, and the
 * Enterprise "publish requires approval" flow, are out of scope for this pass and
 * are documented as deferred in docs/todo-orchestrator/queue.yaml (T-AUTO-10 notes).
 */
const NO_BUILDER_ACCESS_ROLES = new Set(['STUDENT', 'USER']);

export function canAccessAutomationBuilder(role: string | null | undefined): boolean {
  return !!role && !NO_BUILDER_ACCESS_ROLES.has(role);
}

/** Same gate as builder access today — publish/pause/archive/save all require it. */
export function canPublishAutomation(role: string | null | undefined): boolean {
  return canAccessAutomationBuilder(role);
}
