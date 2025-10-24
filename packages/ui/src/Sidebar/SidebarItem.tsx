import React, { useState, memo } from 'react';
import { SidebarItem as SidebarItemType } from './Sidebar';

export interface SidebarItemProps {
  item: SidebarItemType;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
  variant: 'default' | 'compact' | 'minimal';
  depth?: number;
  className?: string;
}

const SidebarItemComponent: React.FC<SidebarItemProps> = ({
  item,
  isActive,
  isCollapsed,
  onClick,
  variant,
  depth = 0,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClick = () => {
    if (item.children && item.children.length > 0) {
      setIsExpanded(!isExpanded);
    }
    onClick();
  };

  const getItemStyles = () => {
    const baseStyles = 'w-full flex items-center py-2 text-sm font-medium rounded-md transition-colors duration-200';
    const activeStyles = isActive 
      ? 'bg-green-50 text-green-700 border-r-2 border-green-500' 
      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900';
    const disabledStyles = item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
    
    const paddingStyles = depth > 0 ? 'pl-8' : 'px-4';
    const variantStyles = variant === 'compact' ? 'justify-center px-3' : variant === 'minimal' ? 'justify-center px-2' : 'justify-start px-4';
    
    return `${baseStyles} ${activeStyles} ${disabledStyles} ${paddingStyles} ${variantStyles}`;
  };

  const getTextStyles = () => {
    if (isCollapsed || variant === 'compact' || variant === 'minimal') {
      return 'hidden';
    }
    return 'flex-1 text-left';
  };

  return (
    <div className={className}>
      <button
        onClick={handleClick}
        disabled={item.disabled}
        className={getItemStyles()}
        title={isCollapsed ? item.label : undefined}
      >
        {item.icon && (
          <span className="flex-shrink-0 mr-3">
            {item.icon}
          </span>
        )}
        
        {!isCollapsed && (
          <>
            <span className={getTextStyles()}>
              {item.label}
            </span>
            
            {item.badge && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                {item.badge}
              </span>
            )}
            
            {item.children && item.children.length > 0 && (
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
            )}
          </>
        )}
      </button>

      {/* Sub-menu items */}
      {item.children && item.children.length > 0 && isExpanded && !isCollapsed && (
        <div className="ml-4 mt-1 space-y-1">
          {item.children.map((child) => (
            <SidebarItem
              key={child.id}
              item={child}
              isActive={false}
              isCollapsed={isCollapsed}
              onClick={() => {}}
              variant={variant}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const SidebarItem = memo(SidebarItemComponent);
SidebarItem.displayName = 'SidebarItem';
