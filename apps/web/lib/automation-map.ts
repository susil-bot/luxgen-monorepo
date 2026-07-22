import { FLOW_COMPOUND_CATALOG } from '@luxgen/automation-flow';

function gqlToSnake(gql: string): string {
  return gql.toLowerCase();
}

function collectLegacyTypes(kind: 'trigger' | 'action'): string[] {
  const key = kind === 'trigger' ? 'legacyTriggerType' : 'legacyActionType';
  const values = new Set<string>();
  for (const compound of FLOW_COMPOUND_CATALOG) {
    if (compound.kind !== kind) continue;
    const legacy = compound[key as keyof typeof compound];
    if (typeof legacy === 'string') values.add(gqlToSnake(legacy));
  }
  return [...values].sort();
}

const TRIGGER_TYPES = collectLegacyTypes('trigger') as readonly string[];
const ACTION_TYPES = collectLegacyTypes('action') as readonly string[];

/** Derived from @luxgen/automation-flow catalog (UI-95). */
export type UiTriggerType = (typeof TRIGGER_TYPES)[number];

/** Derived from @luxgen/automation-flow catalog (UI-95). */
export type UiActionType = (typeof ACTION_TYPES)[number];

const TRIGGER_TO_GQL = Object.fromEntries(TRIGGER_TYPES.map((ui) => [ui, ui.toUpperCase()])) as Record<
  UiTriggerType,
  string
>;

const TRIGGER_FROM_GQL = Object.fromEntries(Object.entries(TRIGGER_TO_GQL).map(([ui, gql]) => [gql, ui])) as Record<
  string,
  UiTriggerType
>;

const ACTION_TO_GQL = Object.fromEntries(ACTION_TYPES.map((ui) => [ui, ui.toUpperCase()])) as Record<
  UiActionType,
  string
>;

const ACTION_FROM_GQL = Object.fromEntries(Object.entries(ACTION_TO_GQL).map(([ui, gql]) => [gql, ui])) as Record<
  string,
  UiActionType
>;

export function triggerToGql(type: UiTriggerType): string {
  return TRIGGER_TO_GQL[type] ?? type.toUpperCase();
}

export function triggerFromGql(type: string): UiTriggerType {
  return TRIGGER_FROM_GQL[type] ?? 'webhook';
}

export function actionToGql(type: UiActionType): string {
  return ACTION_TO_GQL[type] ?? type.toUpperCase();
}

export function actionFromGql(type: string): UiActionType {
  return ACTION_FROM_GQL[type] ?? 'call_webhook';
}

export function formatRelativeTime(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatRunTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toISOString().slice(0, 16).replace('T', ' ');
}
