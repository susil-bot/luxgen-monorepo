import React from 'react';
import { TodoLinkIcon, TodoStarIcon, TodoMoreIcon, TodoLockIcon } from './TodoIcons';

export interface TodoBreadcrumbItem {
  label: string;
  /** If provided, this crumb renders as a clickable link-styled button (e.g. to navigate back
   * to a parent list). Deliberately a callback rather than an href -- packages/ui doesn't
   * depend on Next.js routing, so the consumer decides how to navigate. */
  onClick?: () => void;
}

export interface TodoPageHeaderProps {
  /** e.g. [{ label: 'Todo List', onClick: goToHub }, 'My Tasks'] -- rendered as a
   * "/"-separated breadcrumb. Plain strings render as static (non-clickable) text. */
  breadcrumb: (string | TodoBreadcrumbItem)[];
  title: string;
  subtitle?: string;
  editedLabel?: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onShare?: () => void;
  onCopyLink?: () => void;
  onMore?: () => void;
}

const iconButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '1.75rem',
  height: '1.75rem',
  borderRadius: 'var(--radius-sm, 6px)',
  border: 'none',
  background: 'transparent',
  color: 'var(--color-text-secondary, #6b7280)',
  cursor: 'pointer',
};

/**
 * Breadcrumb bar + title/subtitle for the Todo List page, matching the reference
 * Todo List UI's chrome (breadcrumb, "Edited Xm ago", Share/Link/Favorite/More) --
 * styled with the app's existing iOS-style tokens rather than the reference's dark theme.
 */
export const TodoPageHeader: React.FC<TodoPageHeaderProps> = ({
  breadcrumb,
  title,
  subtitle,
  editedLabel,
  isFavorite,
  onToggleFavorite,
  onShare,
  onCopyLink,
  onMore,
}) => {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
        }}
      >
        <nav aria-label="Breadcrumb" className="text-sm" style={{ color: 'var(--color-text-secondary, #6b7280)' }}>
          {breadcrumb.map((crumb, i) => {
            const item: TodoBreadcrumbItem = typeof crumb === 'string' ? { label: crumb } : crumb;
            const isLast = i === breadcrumb.length - 1;
            const lastStyle = isLast ? { color: 'var(--color-text-primary, #111827)', fontWeight: 600 } : undefined;
            return (
              <span key={item.label}>
                {i > 0 && <span style={{ margin: '0 0.375rem', color: 'var(--color-text-tertiary, #9ca3af)' }}>/</span>}
                {item.onClick ? (
                  <button
                    type="button"
                    onClick={item.onClick}
                    className="text-sm"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, ...lastStyle, color: lastStyle?.color ?? 'var(--color-accent, #0A84FF)' }}
                  >
                    {item.label}
                  </button>
                ) : (
                  <span style={lastStyle}>{item.label}</span>
                )}
              </span>
            );
          })}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {editedLabel && (
            <span className="text-xs" style={{ color: 'var(--color-text-tertiary, #9ca3af)' }}>
              {editedLabel}
            </span>
          )}
          {onShare && (
            <button
              type="button"
              onClick={onShare}
              className="ios-btn-secondary"
              style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem', gap: '0.3rem' }}
            >
              <TodoLockIcon size={13} />
              Share
            </button>
          )}
          {onCopyLink && (
            <button type="button" aria-label="Copy link" onClick={onCopyLink} style={iconButtonStyle}>
              <TodoLinkIcon size={15} />
            </button>
          )}
          {onToggleFavorite && (
            <button type="button" aria-label="Favorite" onClick={onToggleFavorite} style={iconButtonStyle}>
              <TodoStarIcon size={15} filled={isFavorite} />
            </button>
          )}
          {onMore && (
            <button type="button" aria-label="More" onClick={onMore} style={iconButtonStyle}>
              <TodoMoreIcon size={15} />
            </button>
          )}
        </div>
      </div>

      <div style={{ marginBottom: '1.25rem' }}>
        <h1 className="ios-large-title">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-secondary text-sm" style={{ color: 'var(--color-text-secondary, #6b7280)' }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};
