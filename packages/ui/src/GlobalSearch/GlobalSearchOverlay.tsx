import React, { useEffect, useId, useRef, useState } from 'react';

export type GlobalSearchFilterId =
  | 'all'
  | 'courses'
  | 'learners'
  | 'workflows'
  | 'orders'
  | 'products'
  | 'users'
  | 'content'
  | 'settings';

export interface GlobalSearchFilter {
  id: GlobalSearchFilterId;
  label: string;
}

export const DEFAULT_GLOBAL_SEARCH_FILTERS: GlobalSearchFilter[] = [
  { id: 'all', label: 'All Types' },
  { id: 'courses', label: 'Courses' },
  { id: 'learners', label: 'Learners' },
  { id: 'workflows', label: 'Workflows' },
  { id: 'orders', label: 'Orders' },
  { id: 'products', label: 'Products' },
  { id: 'users', label: 'Users' },
  { id: 'content', label: 'Content' },
  { id: 'settings', label: 'Settings' },
];

export interface GlobalSearchResultItem {
  id: string;
  kind: 'course' | 'learner' | string;
  title: string;
  typeLabel: string;
  status?: string;
  metadata?: string;
  href: string;
}

export interface GlobalSearchOverlayProps {
  open: boolean;
  onClose: () => void;
  /** Prefill when opened from header submit */
  initialQuery?: string;
  filters?: GlobalSearchFilter[];
  placeholder?: string;
  /** Live hits (courses + learners). Filtered by sidebar type. */
  results?: GlobalSearchResultItem[];
  loading?: boolean;
  error?: string | null;
  onQueryChange?: (query: string) => void;
  onSelectResult?: (item: GlobalSearchResultItem) => void;
}

const LIVE_FILTERS = new Set<GlobalSearchFilterId>(['all', 'courses', 'learners']);

function filterResults(
  results: GlobalSearchResultItem[],
  activeFilter: GlobalSearchFilterId,
): GlobalSearchResultItem[] {
  if (activeFilter === 'all') return results;
  if (activeFilter === 'courses') return results.filter((r) => r.kind === 'course');
  if (activeFilter === 'learners') return results.filter((r) => r.kind === 'learner');
  return [];
}

/**
 * Global search modal — filter sidebar + live course/learner result cards.
 */
export const GlobalSearchOverlay: React.FC<GlobalSearchOverlayProps> = ({
  open,
  onClose,
  initialQuery = '',
  filters = DEFAULT_GLOBAL_SEARCH_FILTERS,
  placeholder = 'Search anything…',
  results = [],
  loading = false,
  error = null,
  onQueryChange,
  onSelectResult,
}) => {
  const titleId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState<GlobalSearchFilterId>('all');

  useEffect(() => {
    if (!open) return;
    setQuery(initialQuery);
    setActiveFilter('all');
    onQueryChange?.(initialQuery);
    const t = window.setTimeout(() => inputRef.current?.focus(), 0);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = prevOverflow;
    };
    // intentionally omit onQueryChange — stable enough via host
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialQuery]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [open, onClose]);

  if (!open) return null;

  const trimmed = query.trim();
  const visible = filterResults(results, activeFilter);
  const filterSupportsLive = LIVE_FILTERS.has(activeFilter);

  const handleQueryChange = (next: string) => {
    setQuery(next);
    onQueryChange?.(next);
  };

  const handleSelect = (item: GlobalSearchResultItem) => {
    if (onSelectResult) {
      onSelectResult(item);
      return;
    }
    window.location.assign(item.href);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center px-4 pt-[10vh] sm:pt-[12vh]"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close search"
        className="absolute inset-0 border-0 cursor-default"
        style={{ backgroundColor: 'var(--color-label-primary)', opacity: 0.45 }}
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-3xl overflow-hidden flex flex-col"
        style={{
          backgroundColor: 'var(--color-bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--color-separator)',
          maxHeight: 'min(560px, 80vh)',
        }}
      >
        <h2 id={titleId} className="sr-only">
          Global search
        </h2>

        <div
          className="flex items-center gap-3 px-4"
          style={{
            height: 56,
            borderBottom: '1px solid var(--color-separator)',
          }}
        >
          <svg
            className="w-4 h-4 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
            style={{ color: 'var(--color-label-tertiary)' }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder={placeholder}
            aria-label={placeholder}
            className="flex-1 min-w-0 bg-transparent outline-none text-base"
            style={{ color: 'var(--color-label-primary)' }}
            autoComplete="off"
            spellCheck={false}
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md flex-shrink-0"
            aria-label="Close"
            style={{ color: 'var(--color-label-secondary)' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-fill-quaternary)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-1 min-h-0 overflow-hidden">
          <aside
            className="hidden sm:flex flex-col flex-shrink-0 overflow-y-auto"
            style={{
              width: 200,
              backgroundColor: 'var(--color-bg-tertiary)',
              borderRight: '1px solid var(--color-separator)',
              padding: 16,
            }}
            aria-label="Search filters"
          >
            <p
              className="text-xs font-semibold uppercase tracking-wide mb-2"
              style={{ color: 'var(--color-label-tertiary)' }}
            >
              Filters
            </p>
            <ul className="flex flex-col gap-0.5 list-none m-0 p-0">
              {filters.map((f) => {
                const selected = f.id === activeFilter;
                return (
                  <li key={f.id}>
                    <button
                      type="button"
                      onClick={() => setActiveFilter(f.id)}
                      className="w-full text-left text-sm px-2.5 py-2 rounded-md transition-colors"
                      style={{
                        color: selected ? 'var(--color-blue)' : 'var(--color-label-primary)',
                        backgroundColor: selected ? 'var(--color-fill-tertiary)' : 'transparent',
                        fontWeight: selected ? 600 : 400,
                      }}
                      aria-pressed={selected}
                    >
                      {f.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          <div
            className="flex-1 overflow-y-auto p-4"
            style={{ backgroundColor: 'var(--color-bg-secondary)' }}
            aria-live="polite"
          >
            <div
              className="flex sm:hidden gap-2 overflow-x-auto pb-3 mb-2"
              style={{ borderBottom: '1px solid var(--color-separator)' }}
            >
              {filters.map((f) => {
                const selected = f.id === activeFilter;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setActiveFilter(f.id)}
                    className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full"
                    style={{
                      color: selected ? 'var(--color-bg-secondary)' : 'var(--color-label-secondary)',
                      backgroundColor: selected ? 'var(--color-blue)' : 'var(--color-fill-tertiary)',
                    }}
                    aria-pressed={selected}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>

            <ResultsPanel
              trimmed={trimmed}
              loading={loading}
              error={error}
              filterSupportsLive={filterSupportsLive}
              activeFilterLabel={filters.find((f) => f.id === activeFilter)?.label ?? 'All Types'}
              visible={visible}
              onSelect={handleSelect}
            />
          </div>
        </div>

        <div
          className="flex items-center px-4 text-[11px] gap-3 flex-wrap"
          style={{
            height: 32,
            backgroundColor: 'var(--color-bg-tertiary)',
            borderTop: '1px solid var(--color-separator)',
            color: 'var(--color-label-tertiary)',
          }}
        >
          <span>
            <kbd style={kbdStyle}>Tab</kbd> Navigate
          </span>
          <span>
            <kbd style={kbdStyle}>↵</kbd> Open
          </span>
          <span>
            <kbd style={kbdStyle}>Esc</kbd> Close
          </span>
        </div>
      </div>
    </div>
  );
};

function ResultsPanel({
  trimmed,
  loading,
  error,
  filterSupportsLive,
  activeFilterLabel,
  visible,
  onSelect,
}: {
  trimmed: string;
  loading: boolean;
  error: string | null;
  filterSupportsLive: boolean;
  activeFilterLabel: string;
  visible: GlobalSearchResultItem[];
  onSelect: (item: GlobalSearchResultItem) => void;
}) {
  if (!trimmed) {
    return (
      <div className="ios-empty-state py-10 px-4 text-center">
        <p className="text-sm font-medium" style={{ color: 'var(--color-label-primary)' }}>
          Start typing to search…
        </p>
        <p className="text-xs mt-2" style={{ color: 'var(--color-label-tertiary)' }}>
          Courses and learners in this tenant
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ios-empty-state py-10 px-4 text-center">
        <p className="text-sm font-medium" style={{ color: 'var(--color-red)' }}>
          Search temporarily unavailable
        </p>
        <p className="text-xs mt-2" style={{ color: 'var(--color-label-tertiary)' }}>
          {error}
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="ios-empty-state py-10 px-4 text-center">
        <div className="ios-spinner mx-auto mb-3" aria-hidden />
        <p className="text-sm" style={{ color: 'var(--color-label-secondary)' }}>
          Searching…
        </p>
      </div>
    );
  }

  if (!filterSupportsLive) {
    return (
      <div className="ios-empty-state py-10 px-4 text-center">
        <p className="text-sm font-medium" style={{ color: 'var(--color-label-primary)' }}>
          No {activeFilterLabel.toLowerCase()} results yet
        </p>
        <p className="text-xs mt-2" style={{ color: 'var(--color-label-tertiary)' }}>
          Try Courses or Learners — other types come later
        </p>
      </div>
    );
  }

  if (visible.length === 0) {
    return (
      <div className="ios-empty-state py-10 px-4 text-center">
        <p className="text-sm font-medium" style={{ color: 'var(--color-label-primary)' }}>
          No results found
        </p>
        <p className="text-xs mt-2" style={{ color: 'var(--color-label-tertiary)' }}>
          Nothing matched “{trimmed}” in {activeFilterLabel.toLowerCase()}
        </p>
      </div>
    );
  }

  return (
    <ul className="list-none m-0 p-0 flex flex-col">
      {visible.map((item) => (
        <li key={`${item.kind}-${item.id}`} style={{ borderBottom: '1px solid var(--color-separator)' }}>
          <button
            type="button"
            onClick={() => onSelect(item)}
            className="w-full text-left flex items-start gap-3 px-2 py-3 rounded-md transition-colors"
            style={{ color: 'var(--color-label-primary)' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-fill-quaternary)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <span
              className="flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center text-sm"
              style={{ backgroundColor: 'var(--color-fill-tertiary)' }}
              aria-hidden
            >
              {item.kind === 'course' ? '🎓' : '👤'}
            </span>
            <span className="flex-1 min-w-0">
              <span className="flex items-start justify-between gap-2">
                <span className="text-sm font-semibold truncate">{item.title}</span>
                <span className="text-xs flex-shrink-0" style={{ color: 'var(--color-blue)' }}>
                  Open
                </span>
              </span>
              <span className="block text-xs mt-0.5" style={{ color: 'var(--color-label-secondary)' }}>
                {item.typeLabel}
                {item.status ? ` · ${item.status}` : ''}
              </span>
              {item.metadata ? (
                <span className="block text-xs mt-0.5 truncate" style={{ color: 'var(--color-label-tertiary)' }}>
                  {item.metadata}
                </span>
              ) : null}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

const kbdStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '0 4px',
  marginRight: 4,
  borderRadius: 'var(--radius-sm)',
  backgroundColor: 'var(--color-fill-quaternary)',
  border: '1px solid var(--color-separator)',
  fontSize: 10,
  lineHeight: '16px',
  color: 'var(--color-label-secondary)',
};
