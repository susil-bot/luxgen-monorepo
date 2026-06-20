import React from 'react';
import type { SidebarItem } from './Sidebar';
import { LuxSidebarSubItems } from './LuxSidebarSubItems';

function NavChevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`lux-nav-item__chevron ${open ? 'lux-nav-item__chevron--open' : ''}`}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function NavBadge({ badge }: { badge: string | number }) {
  return <span className="lux-nav-item__badge lux-nav-item__badge--gray">{badge}</span>;
}

export interface LuxSidebarNavItemProps {
  item: SidebarItem;
  isActive: boolean;
  isAncestorActive: boolean;
  isExpanded: boolean;
  isCollapsed: boolean;
  onToggle: (itemId: string) => void;
  onItemClick: (item: SidebarItem) => void;
  isItemActive: (id: string) => boolean;
}

export function LuxSidebarNavItem({
  item,
  isActive,
  isAncestorActive,
  isExpanded: isExpandedProp,
  isCollapsed,
  onToggle,
  onItemClick,
  isItemActive,
}: LuxSidebarNavItemProps) {
  const hasChildren = Boolean(item.children?.length);
  const isExpanded = isExpandedProp;

  const handleClick = () => {
    if (item.disabled) return;
    if (hasChildren) {
      onToggle(item.id);
    }
    if (item.onClick) {
      item.onClick();
    } else if (item.href) {
      onItemClick(item);
    }
  };

  const rowClass = [
    'lux-nav-item',
    isActive ? 'lux-nav-item--active' : '',
    !isActive && isAncestorActive ? 'lux-nav-item--ancestor-active' : '',
    item.disabled ? 'lux-nav-item--disabled' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="lux-nav-item-wrap">
      <div className={isCollapsed ? 'lux-tooltip-wrap' : undefined}>
        <button
          type="button"
          className={rowClass}
          onClick={handleClick}
          disabled={item.disabled}
          aria-current={isActive ? 'page' : undefined}
          aria-expanded={hasChildren ? isExpanded : undefined}
        >
          {item.icon ? <span className="lux-nav-item__icon">{item.icon}</span> : null}
          {!isCollapsed && (
            <>
              <span className="lux-nav-item__label">{item.label}</span>
              {item.badge != null && item.badge !== '' ? <NavBadge badge={item.badge} /> : null}
              {hasChildren ? <NavChevron open={isExpanded} /> : null}
            </>
          )}
        </button>
        {isCollapsed && <span className="lux-tooltip">{item.label}</span>}
      </div>

      {hasChildren && item.children && !isCollapsed ? (
        <LuxSidebarSubItems
          items={item.children}
          isOpen={isExpanded}
          isItemActive={isItemActive}
          onItemClick={onItemClick}
        />
      ) : null}
    </div>
  );
}
