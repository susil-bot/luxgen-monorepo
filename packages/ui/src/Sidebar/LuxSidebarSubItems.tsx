import React from 'react';
import type { SidebarItem } from './Sidebar';

export interface LuxSidebarSubItemsProps {
  items: SidebarItem[];
  isOpen: boolean;
  isItemActive: (id: string) => boolean;
  onItemClick: (item: SidebarItem) => void;
}

export function LuxSidebarSubItems({ items, isOpen, isItemActive, onItemClick }: LuxSidebarSubItemsProps) {
  return (
    <div className={`lux-subnav ${isOpen ? 'lux-subnav--open' : ''}`} aria-hidden={!isOpen}>
      <div className="lux-subnav__inner">
        {items.map((child) => {
          const active = isItemActive(child.id);
          return (
            <button
              key={child.id}
              type="button"
              className={`lux-subnav__item ${active ? 'lux-subnav__item--active' : ''}`}
              onClick={() => onItemClick(child)}
              disabled={child.disabled}
              aria-current={active ? 'page' : undefined}
            >
              {child.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
