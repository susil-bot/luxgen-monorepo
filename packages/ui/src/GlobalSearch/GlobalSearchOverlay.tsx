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

export interface GlobalSearchOverlayProps {
  open: boolean;
  onClose: () => void;
  /** Prefill when opened from header submit */
  initialQuery?: string;
  filters?: GlobalSearchFilter[];
  placeholder?: string;
}

/**
 * Global search modal shell — filter sidebar + results panel.
 * Live result cards land in a follow-up task; this ships structure + keyboard chrome only.
 */
export const GlobalSearchOverlay: React.FC<GlobalSearchOverlayProps> = ({
  open,
  onClose,
  initialQuery = '',
  filters = DEFAULT_GLOBAL_SEARCH_FILTERS,
  placeholder = 'Search anything…',
}) => {
  const titleId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState<GlobalSearchFilterId>('all');

  useEffect(() => {
    if (!open) return;
    setQuery(initialQuery);
    setActiveFilter('all');
    const t = window.setTimeout(() => inputRef.current?.focus(), 0);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = prevOverflow;
    };
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

        {/* Search input */}
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
            onChange={(e) => setQuery(e.target.value)}
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

        {/* Filter sidebar + results */}
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
            {/* Mobile filter chips */}
            <div className="flex sm:hidden gap-2 overflow-x-auto pb-3 mb-2" style={{ borderBottom: '1px solid var(--color-separator)' }}>
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

            <div className="ios-empty-state py-10 px-4 text-center">
              <p className="text-sm font-medium" style={{ color: 'var(--color-label-primary)' }}>
                {query.trim() ? 'Results will appear here' : 'Start typing to search…'}
              </p>
              <p className="text-xs mt-2" style={{ color: 'var(--color-label-tertiary)' }}>
                Filter: {filters.find((f) => f.id === activeFilter)?.label ?? 'All Types'}
              </p>
            </div>
          </div>
        </div>

        {/* Keyboard footer */}
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
