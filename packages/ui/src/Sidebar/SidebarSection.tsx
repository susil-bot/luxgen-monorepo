import React, { memo } from 'react';
import { SidebarSection as SidebarSectionType } from './Sidebar';
import { SidebarItem } from './SidebarItem';

export interface SidebarSectionProps {
  section: SidebarSectionType;
  isExpanded: boolean;
  isCollapsed: boolean;
  onToggle: () => void;
  onItemClick: (item: any) => void;
  variant: 'default' | 'compact' | 'minimal';
  className?: string;
}

const SidebarSectionComponent: React.FC<SidebarSectionProps> = ({
  section,
  isExpanded,
  isCollapsed,
  onToggle,
  onItemClick,
  variant,
  className = '',
}) => {
  const getSectionStyles = () => {
    const baseStyles = 'py-2';
    return `${baseStyles} ${className}`;
  };

  const getHeaderStyles = () => {
    const baseStyles = 'flex items-center justify-between px-4 py-2';
    return baseStyles;
  };

  const getTitleStyles = () => {
    const baseStyles = 'text-xs font-semibold text-gray-500 uppercase tracking-wider';
    return baseStyles;
  };

  const getToggleStyles = () => {
    const baseStyles = 'p-1 rounded text-gray-400 hover:text-gray-600 transition-colors duration-200';
    return baseStyles;
  };

  const getItemsStyles = () => {
    const baseStyles = 'space-y-1';
    return baseStyles;
  };

  return (
    <div className={getSectionStyles()}>
      {/* Section Header */}
      {section.title && !isCollapsed && (
        <div className={getHeaderStyles()}>
          <h3 className={getTitleStyles()}>
            {section.title}
          </h3>
          {section.collapsible !== false && (
            <button
              onClick={onToggle}
              className={getToggleStyles()}
              aria-label={`Toggle ${section.title} section`}
            >
              <svg
                className={`h-4 w-4 transition-transform duration-200 ${
                  isExpanded ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Section Items */}
      {(!section.collapsible || isExpanded || isCollapsed) && (
        <div className={getItemsStyles()}>
          {section.items.map((item) => (
            <SidebarItem
              key={item.id}
              item={item}
              isActive={false}
              isCollapsed={isCollapsed}
              onClick={() => onItemClick(item)}
              variant={variant}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const SidebarSection = memo(SidebarSectionComponent);
SidebarSection.displayName = 'SidebarSection';
