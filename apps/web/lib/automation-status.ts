/** Shared automation lifecycle helpers for web UI (mirrors `@luxgen/db` resolveAutomationStatus). */

export type AutomationLifecycleStatus = 'draft' | 'live' | 'paused' | 'archived';

export function normalizeAutomationStatus(
  raw: string | null | undefined,
  enabled?: boolean,
): AutomationLifecycleStatus {
  if (raw === 'live' || raw === 'paused' || raw === 'draft' || raw === 'archived') return raw;
  return enabled ? 'live' : 'draft';
}

export function automationStatusLabel(status: AutomationLifecycleStatus): string {
  if (status === 'live') return 'Live';
  if (status === 'paused') return 'Paused';
  if (status === 'archived') return 'Archived';
  return 'Draft';
}

export function isAutomationRunnable(status: AutomationLifecycleStatus): boolean {
  return status === 'live';
}
