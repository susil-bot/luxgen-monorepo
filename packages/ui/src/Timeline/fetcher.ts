/** Global timeline event model — mirrors Shopify Event objects */

export type TimelineSubjectType = 'PRODUCT' | 'ORDER' | 'CUSTOMER';

export type TimelineEventKind = 'SYSTEM' | 'STAFF_COMMENT' | 'APP' | 'FIELD_CHANGE';

export type TimelineActorType = 'SYSTEM' | 'STAFF' | 'APP';

export interface TimelineEvent {
  id: string;
  message: string;
  createdAt: string;
  kind: TimelineEventKind;
  eventType?: string;
  actorType?: TimelineActorType;
  actorName?: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  metadata?: Record<string, unknown>;
  criticalAlert?: boolean;
  mentions?: string[];
  attachments?: TimelineCommentAttachment[];
}

export interface TimelineCommentAttachment {
  url: string;
  name: string;
  mimeType?: string;
}

export interface TimelineDateGroup {
  dateLabel: string;
  events: TimelineEvent[];
}

export function formatTimelineTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

export function formatTimelineDateHeader(iso: string): string {
  try {
    const d = new Date(iso);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';

    return d.toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
  } catch {
    return '—';
  }
}

export function groupTimelineByDate(events: TimelineEvent[]): TimelineDateGroup[] {
  const sorted = [...events].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const groups = new Map<string, TimelineEvent[]>();
  for (const event of sorted) {
    const label = formatTimelineDateHeader(event.createdAt);
    const list = groups.get(label) ?? [];
    list.push(event);
    groups.set(label, list);
  }

  return Array.from(groups.entries()).map(([dateLabel, groupEvents]) => ({
    dateLabel,
    events: groupEvents,
  }));
}

export function timelineActorLabel(event: TimelineEvent): string | null {
  if (event.kind === 'STAFF_COMMENT' && event.actorName) {
    return event.actorName;
  }
  if (event.actorType === 'APP' && event.actorName) {
    return event.actorName;
  }
  if (event.actorType === 'STAFF' && event.actorName) {
    return event.actorName;
  }
  return null;
}
