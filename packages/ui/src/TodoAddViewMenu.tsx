import React, { ReactNode } from 'react';

export interface TodoViewOption {
  id: string;
  label: string;
  icon: ReactNode;
  /** Built views select an existing tab; unbuilt ones (Feed, Map, ...) show a "soon" badge
   * and let the caller decide how to respond (e.g. a "coming soon" toast). */
  available: boolean;
}

export interface TodoAddViewMenuProps {
  options: TodoViewOption[];
  onSelect: (id: string) => void;
  onNewDataSource?: () => void;
}

/**
 * "Add a new view" icon-grid menu, matching the reference Todo List UI: a 4-column
 * grid of view types, a divider, then a "New data source" row. Purely presentational --
 * open/close state and positioning live in the parent (TodoViewTabs).
 */
export const TodoAddViewMenu: React.FC<TodoAddViewMenuProps> = ({ options, onSelect, onNewDataSource }) => {
  return (
    <div
      className="ios-card"
      role="menu"
      style={{
        position: 'absolute',
        top: 'calc(100% + 0.5rem)',
        left: 0,
        zIndex: 20,
        width: '19rem',
        padding: '0.75rem',
      }}
    >
      <p
        className="text-xs font-medium"
        style={{ color: 'var(--color-text-secondary, #6b7280)', padding: '0 0.25rem 0.5rem' }}
      >
        Add a new view
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.375rem' }}>
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            role="menuitem"
            onClick={() => onSelect(option.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.375rem',
              padding: '0.625rem 0.25rem',
              borderRadius: 'var(--radius-md, 10px)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-primary, #111827)',
              opacity: option.available ? 1 : 0.55,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-fill-tertiary)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            {option.icon}
            <span className="text-xs" style={{ lineHeight: 1.1, textAlign: 'center' }}>
              {option.label}
              {!option.available && (
                <>
                  <br />
                  <span style={{ color: 'var(--color-text-tertiary, #9ca3af)' }}>(soon)</span>
                </>
              )}
            </span>
          </button>
        ))}
      </div>
      {onNewDataSource && (
        <>
          <div style={{ borderTop: '1px solid var(--color-border, #e5e7eb)', margin: '0.625rem 0 0.375rem' }} />
          <button
            type="button"
            role="menuitem"
            onClick={onNewDataSource}
            className="text-sm"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              width: '100%',
              padding: '0.5rem 0.375rem',
              borderRadius: 'var(--radius-md, 10px)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-primary, #111827)',
              textAlign: 'left',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-fill-tertiary)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            New data source
          </button>
        </>
      )}
    </div>
  );
};
