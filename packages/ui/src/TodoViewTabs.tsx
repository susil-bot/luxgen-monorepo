import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { TodoAddViewMenu, TodoViewOption } from './TodoAddViewMenu';
import {
  TodoPlusIcon,
  TodoFilterIcon,
  TodoSortIcon,
  TodoBoltIcon,
  TodoSparkleIcon,
  TodoSearchIcon,
  TodoSlidersIcon,
  TodoChevronDownIcon,
} from './TodoIcons';

export interface TodoViewTab {
  id: string;
  label: string;
  icon: ReactNode;
}

export type TodoToolbarAction = 'filter' | 'sort' | 'automate' | 'ai' | 'search' | 'settings';

export interface TodoViewTabsProps {
  tabs: TodoViewTab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  addViewOptions: TodoViewOption[];
  onAddView: (id: string) => void;
  onNewDataSource?: () => void;
  onToolbarAction?: (action: TodoToolbarAction) => void;
  onNew?: () => void;
}

const toolbarButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '2rem',
  height: '2rem',
  borderRadius: 'var(--radius-md, 10px)',
  border: 'none',
  background: 'transparent',
  color: 'var(--color-text-secondary, #6b7280)',
  cursor: 'pointer',
};

/**
 * View-switcher tab bar for the Todo List page: icon+label tabs on the left, a "+"
 * button that opens the add-view menu, and a right-aligned toolbar (filter / sort /
 * automate / AI / search / view settings) plus a primary "New" button -- matching
 * the reference Todo List UI's chrome, styled with the app's existing iOS-style tokens.
 */
export const TodoViewTabs: React.FC<TodoViewTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  addViewOptions,
  onAddView,
  onNewDataSource,
  onToolbarAction,
  onNew,
}) => {
  const [showAddView, setShowAddView] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showAddView) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowAddView(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showAddView]);

  const handleSelect = (id: string) => {
    setShowAddView(false);
    onAddView(id);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        borderBottom: '1px solid var(--color-border, #e5e7eb)',
        paddingBottom: '0.625rem',
        marginBottom: '1rem',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexWrap: 'wrap' }}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              role="tab"
              aria-selected={isActive}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.375rem 0.625rem',
                borderRadius: 'var(--radius-md, 10px)',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 600,
                background: isActive ? 'var(--color-fill-tertiary)' : 'transparent',
                color: isActive ? 'var(--color-text-primary, #111827)' : 'var(--color-text-secondary, #6b7280)',
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
        <div style={{ position: 'relative' }} ref={menuRef}>
          <button
            type="button"
            aria-label="Add a new view"
            onClick={() => setShowAddView((v) => !v)}
            style={{ ...toolbarButtonStyle, color: 'var(--color-text-tertiary, #9ca3af)' }}
          >
            <TodoPlusIcon size={15} />
          </button>
          {showAddView && (
            <TodoAddViewMenu options={addViewOptions} onSelect={handleSelect} onNewDataSource={onNewDataSource} />
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.125rem' }}>
        <button type="button" aria-label="Filter" style={toolbarButtonStyle} onClick={() => onToolbarAction?.('filter')}>
          <TodoFilterIcon />
        </button>
        <button type="button" aria-label="Sort" style={toolbarButtonStyle} onClick={() => onToolbarAction?.('sort')}>
          <TodoSortIcon />
        </button>
        <button
          type="button"
          aria-label="Automations"
          style={toolbarButtonStyle}
          onClick={() => onToolbarAction?.('automate')}
        >
          <TodoBoltIcon />
        </button>
        <button type="button" aria-label="Ask AI" style={toolbarButtonStyle} onClick={() => onToolbarAction?.('ai')}>
          <TodoSparkleIcon />
        </button>
        <button type="button" aria-label="Search" style={toolbarButtonStyle} onClick={() => onToolbarAction?.('search')}>
          <TodoSearchIcon />
        </button>
        <button
          type="button"
          aria-label="View settings"
          style={toolbarButtonStyle}
          onClick={() => onToolbarAction?.('settings')}
        >
          <TodoSlidersIcon />
        </button>
        <button
          type="button"
          onClick={onNew}
          className="ios-btn-primary"
          style={{ padding: '0.4rem 0.875rem', fontSize: '0.8125rem', marginLeft: '0.375rem' }}
        >
          New
          <TodoChevronDownIcon size={13} />
        </button>
      </div>
    </div>
  );
};
