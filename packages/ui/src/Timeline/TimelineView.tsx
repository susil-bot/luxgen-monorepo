import { useCallback, useRef, useState, type ReactNode } from 'react';
import type { TimelineCommentAttachment, TimelineEvent } from './fetcher';
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
  mentionOptions?: string[];
  commentMentions?: string[];
  onMentionsChange?: (mentions: string[]) => void;
  commentAttachments?: TimelineCommentAttachment[];
  onAddAttachment?: (attachment: TimelineCommentAttachment) => void;
  onRemoveAttachment?: (url: string) => void;
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
}

export interface TimelineViewProps extends TimelineActivityProps {
  title?: string;
  hint?: string;
  emptyMessage?: string;
  className?: string;
  /** When true, omit outer ios-card (use inside SplitPageSection) */
  embedded?: boolean;
}

function EventIcon({ kind, critical }: { kind: TimelineEvent['kind']; critical?: boolean }) {
  const icon =
    kind === 'STAFF_COMMENT' ? '💬' : kind === 'APP' ? '▦' : kind === 'FIELD_CHANGE' ? '↔' : '●';
  return (
    <span
      className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs"
      style={{
        background: critical ? 'var(--color-red, #fee2e2)' : 'var(--color-fill-quaternary)',
        color: critical ? 'var(--color-red-text, #b91c1c)' : 'var(--color-label-secondary)',
      }}
      aria-hidden
    >
      {critical ? '!' : icon}
    </span>
  );
}

function renderMessageWithMentions(message: string, mentions?: string[]): ReactNode {
  if (!mentions?.length) return message;
  const pattern = new RegExp(`@(${mentions.map((m) => m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  const parts = message.split(pattern);
  return parts.map((part, i) =>
    mentions.some((m) => m.toLowerCase() === part.toLowerCase()) ? (
      <span key={i} className="font-medium" style={{ color: 'var(--color-purple, #7c3aed)' }}>
        @{part}
      </span>
    ) : (
      part
    ),
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
  mentionOptions = [],
  commentMentions = [],
  onMentionsChange,
  commentAttachments = [],
  onAddAttachment,
  onRemoveAttachment,
  hasMore = false,
  loadingMore = false,
  onLoadMore,
  emptyMessage,
  className = '',
  embedded = false,
}: TimelineViewProps) {
  const t = TimelineTranslations.en;
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const insertMention = useCallback(
    (handle: string) => {
      const token = `@${handle} `;
      onCommentDraftChange?.(`${commentDraft}${commentDraft.endsWith(' ') || !commentDraft ? '' : ' '}${token}`);
      if (!commentMentions.includes(handle)) {
        onMentionsChange?.([...commentMentions, handle]);
      }
      setShowMentionMenu(false);
    },
    [commentDraft, commentMentions, onCommentDraftChange, onMentionsChange],
  );

  const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onAddAttachment?.({ url, name: file.name, mimeType: file.type || undefined });
    e.target.value = '';
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
            <div className="flex-1 space-y-2">
              <textarea
                className="ios-input min-h-[72px] w-full resize-y text-sm"
                placeholder={t.leaveComment}
                value={commentDraft}
                onChange={(e) => {
                  onCommentDraftChange?.(e.target.value);
                  if (e.target.value.endsWith('@')) setShowMentionMenu(true);
                }}
              />
              {showMentionMenu && mentionOptions.length > 0 && (
                <div
                  className="rounded-lg border text-sm overflow-hidden"
                  style={{ borderColor: 'var(--color-separator)', background: 'var(--color-fill-quaternary)' }}
                >
                  {mentionOptions.slice(0, 8).map((handle) => (
                    <button
                      key={handle}
                      type="button"
                      className="block w-full text-left px-3 py-2 hover:opacity-80"
                      onClick={() => insertMention(handle)}
                    >
                      @{handle}
                    </button>
                  ))}
                </div>
              )}
              {commentAttachments.length > 0 && (
                <ul className="flex flex-wrap gap-2">
                  {commentAttachments.map((file) => (
                    <li
                      key={file.url}
                      className="text-xs px-2 py-1 rounded-md flex items-center gap-2"
                      style={{ background: 'var(--color-fill-quaternary)' }}
                    >
                      <span className="truncate max-w-[140px]">{file.name}</span>
                      <button
                        type="button"
                        className="text-tertiary hover:text-primary"
                        onClick={() => onRemoveAttachment?.(file.url)}
                        aria-label={`Remove ${file.name}`}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between pl-11">
            <div className="flex items-center gap-3">
              <p className="text-xs text-tertiary">{t.staffOnly}</p>
              <button
                type="button"
                className="text-xs text-secondary hover:text-primary"
                onClick={() => setShowMentionMenu((v) => !v)}
                disabled={mentionOptions.length === 0}
              >
                @ Mention
              </button>
              <button
                type="button"
                className="text-xs text-secondary hover:text-primary"
                onClick={() => fileInputRef.current?.click()}
              >
                Attach
              </button>
              <input ref={fileInputRef} type="file" className="hidden" onChange={onFileSelected} />
            </div>
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
                      <EventIcon kind={event.kind} critical={event.criticalAlert} />
                      <div className="flex-1 min-w-0 pb-1">
                        {event.criticalAlert && (
                          <span
                            className="inline-block text-[10px] font-semibold uppercase tracking-wide mb-1 px-1.5 py-0.5 rounded"
                            style={{ background: 'var(--color-red, #fee2e2)', color: 'var(--color-red-text, #b91c1c)' }}
                          >
                            Critical
                          </span>
                        )}
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
                          <div
                            className="text-sm mt-2 p-3 rounded-lg space-y-2"
                            style={{ background: 'var(--color-fill-quaternary)' }}
                          >
                            <p>{renderMessageWithMentions(event.message, event.mentions)}</p>
                            {event.attachments && event.attachments.length > 0 && (
                              <ul className="space-y-1">
                                {event.attachments.map((file) => (
                                  <li key={file.url}>
                                    <a
                                      href={file.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs underline"
                                    >
                                      {file.name}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
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

      {hasMore && onLoadMore && (
        <div className="pt-2 text-center">
          <button
            type="button"
            className="text-sm text-secondary hover:text-primary"
            disabled={loadingMore}
            onClick={onLoadMore}
          >
            {loadingMore ? 'Loading…' : 'Load older events'}
          </button>
        </div>
      )}
    </section>
  );
}
