import { useState } from 'react';
import type { TimelineEvent } from './fetcher';
import {
  formatTimelineTime,
  groupTimelineByDate,
  timelineActorLabel,
} from './fetcher';
import { TimelineTranslations } from './translations';

export interface TimelineActivityProps {
  events: TimelineEvent[];
  allowComments?: boolean;
  commentDraft?: string;
  onCommentDraftChange?: (value: string) => void;
  onPostComment?: () => void;
  posting?: boolean;
  staffInitials?: string;
}

export interface TimelineViewProps extends TimelineActivityProps {
  title?: string;
  hint?: string;
  emptyMessage?: string;
  className?: string;
  /** When true, omit outer ios-card (use inside SplitPageSection) */
  embedded?: boolean;
}

function EventIcon({ kind }: { kind: TimelineEvent['kind'] }) {
  const icon =
    kind === 'STAFF_COMMENT' ? '💬' : kind === 'APP' ? '▦' : kind === 'FIELD_CHANGE' ? '↔' : '●';
  return (
    <span
      className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs"
      style={{ background: 'var(--color-fill-quaternary)', color: 'var(--color-label-secondary)' }}
      aria-hidden
    >
      {icon}
    </span>
  );
}

export function TimelineView({
  events,
  title,
  hint,
  allowComments = false,
  commentDraft = '',
  onCommentDraftChange,
  onPostComment,
  posting = false,
  staffInitials = 'ST',
  emptyMessage,
  className = '',
  embedded = false,
}: TimelineViewProps) {
  const t = TimelineTranslations.en;
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const groups = groupTimelineByDate(events);
  const canPost = allowComments && commentDraft.trim().length > 0 && !posting;

  const toggleComment = (id: string) => {
    setExpandedComments((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <section
      className={
        embedded
          ? `space-y-4 ${className}`
          : `ios-card p-4 sm:p-5 space-y-4 ${className}`
      }
    >
      {(title || hint) && (
        <div className="flex items-start justify-between gap-2">
          {title && <h2 className="text-sm font-semibold text-primary">{title}</h2>}
          {hint && <p className="text-xs text-tertiary text-right max-w-[55%]">{hint}</p>}
        </div>
      )}

      {allowComments && (
        <div className="space-y-2">
          <div className="flex gap-3">
            <div
              className="flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center text-xs font-semibold text-white"
              style={{ background: 'var(--color-purple, #7c3aed)' }}
            >
              {staffInitials.slice(0, 2).toUpperCase()}
            </div>
            <textarea
              className="ios-input min-h-[72px] flex-1 resize-y text-sm"
              placeholder={t.leaveComment}
              value={commentDraft}
              onChange={(e) => onCommentDraftChange?.(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between pl-11">
            <p className="text-xs text-tertiary">{t.staffOnly}</p>
            <button
              type="button"
              className="ios-btn-primary text-sm py-1.5 px-3"
              disabled={!canPost}
              onClick={onPostComment}
            >
              {posting ? t.posting : t.post}
            </button>
          </div>
        </div>
      )}

      {groups.length === 0 ? (
        <p className="text-sm text-secondary">{emptyMessage ?? t.noEvents}</p>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.dateLabel}>
              <h3 className="text-xs font-semibold text-secondary mb-3">{group.dateLabel}</h3>
              <ul className="space-y-4 relative pl-1">
                <div
                  className="absolute left-[13px] top-2 bottom-2 w-px"
                  style={{ background: 'var(--color-separator)' }}
                  aria-hidden
                />
                {group.events.map((event) => {
                  const actor = timelineActorLabel(event);
                  const isComment = event.kind === 'STAFF_COMMENT';
                  const expanded = expandedComments.has(event.id);

                  return (
                    <li key={event.id} className="flex gap-3 relative">
                      <EventIcon kind={event.kind} />
                      <div className="flex-1 min-w-0 pb-1">
                        <p className="text-sm text-primary">
                          {isComment ? (
                            <>
                              <span className="font-medium">{actor ?? 'Staff'}</span> left a comment
                            </>
                          ) : (
                            event.message
                          )}
                        </p>

                        {event.field && event.newValue && (
                          <p className="text-xs mt-1 flex flex-wrap items-center gap-1">
                            <span className="badge badge-gray">{event.oldValue ?? '—'}</span>
                            <span className="text-tertiary">→</span>
                            <span className="badge badge-green">{event.newValue}</span>
                          </p>
                        )}

                        {isComment && (
                          <button
                            type="button"
                            className="text-xs mt-1 flex items-center gap-1 text-secondary hover:text-primary"
                            onClick={() => toggleComment(event.id)}
                          >
                            <span>{expanded ? '▾' : '▸'}</span>
                            Comment
                          </button>
                        )}

                        {isComment && expanded && (
                          <p
                            className="text-sm mt-2 p-3 rounded-lg"
                            style={{ background: 'var(--color-fill-quaternary)' }}
                          >
                            {event.message}
                          </p>
                        )}

                        <p className="text-xs text-tertiary mt-1">
                          {formatTimelineTime(event.createdAt)}
                          {actor && !isComment ? ` · ${actor}` : ''}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
