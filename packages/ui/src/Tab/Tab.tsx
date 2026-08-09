import React, { useState, ReactNode } from 'react';
import { BaseComponentProps, TenantTheme } from '../types';
import { withSSR } from '../ssr';
import { defaultTheme } from '../theme';

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
  icon?: ReactNode;
  badge?: string | number;
}

export interface TabProps extends BaseComponentProps {
  items: TabItem[];
  defaultActiveTab?: string;
  variant?: 'default' | 'pills' | 'underline' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  orientation?: 'horizontal' | 'vertical';
  fullWidth?: boolean;
  onTabChange?: (tabId: string) => void;
  tenantTheme?: TenantTheme;
  responsive?: boolean;
  mobileBreakpoint?: number;
}

const TabComponent: React.FC<TabProps> = ({
  items = [],
  defaultActiveTab,
  variant = 'default',
  size = 'md',
  orientation = 'horizontal',
  fullWidth = false,
  onTabChange,
  tenantTheme = defaultTheme,
  responsive = true,
  mobileBreakpoint = 768,
  className = '',
  style = {},
  ...props
}) => {
  const [activeTab, setActiveTab] = useState<string>(
    defaultActiveTab || (items.length > 0 ? items[0].id : '')
  );

  const handleTabClick = (tabId: string, disabled?: boolean) => {
    if (disabled) return;
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  const getTabStyles = () => {
    const colors = tenantTheme.colors;
    
    const baseStyles = {
      tabList: {
        display: 'flex',
        borderBottom: variant === 'underline' ? `2px solid ${colors.border || '#E5E7EB'}` : 'none',
        marginBottom: '1rem',
        gap: variant === 'pills' ? '0.5rem' : '0',
      },
      tabButton: {
        padding: size === 'sm' ? '0.5rem 1rem' : size === 'lg' ? '1rem 1.5rem' : '0.75rem 1.25rem',
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        fontSize: size === 'sm' ? '0.875rem' : size === 'lg' ? '1.125rem' : '1rem',
        fontWeight: '500',
        color: colors.text || '#374151',
        borderRadius: variant === 'pills' ? '9999px' : '0',
        position: 'relative' as const,
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        minWidth: fullWidth ? 'auto' : 'fit-content',
        flex: fullWidth ? 1 : 'none',
      },
      activeTab: {
        color: colors.primary || '#3B82F6',
        background: variant === 'pills' ? `${colors.primary || '#3B82F6'}20` : 'transparent',
        borderBottom: variant === 'underline' ? `2px solid ${colors.primary || '#3B82F6'}` : 'none',
      },
      disabledTab: {
        color: colors.textSecondary || '#9CA3AF',
        cursor: 'not-allowed',
        opacity: 0.6,
      },
      tabContent: {
        padding: '1rem 0',
        minHeight: '200px',
      },
    };

    return baseStyles;
  };

  const styles = getTabStyles();
  const activeTabItem = items.find(item => item.id === activeTab);

  // Responsive behavior
  const isVertical = orientation === 'vertical' || (responsive && typeof window !== 'undefined' && window.innerWidth < mobileBreakpoint);

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: isVertical ? 'column' : 'row',
    gap: isVertical ? '1rem' : '0',
    ...style,
  };

  const tabListStyle: React.CSSProperties = {
    ...styles.tabList,
    flexDirection: isVertical ? 'column' : 'row',
    borderBottom: isVertical ? 'none' : styles.tabList.borderBottom,
    borderRight: isVertical ? `2px solid ${tenantTheme.colors.border || '#E5E7EB'}` : 'none',
    marginBottom: isVertical ? '0' : styles.tabList.marginBottom,
    marginRight: isVertical ? '1rem' : '0',
    paddingRight: isVertical ? '1rem' : '0',
  };

  return (
    <div 
      className={`tab-container ${className}`}
      style={containerStyle}
      {...props}
    >
      {/* Tab Navigation */}
      <div className="tab-list" style={tabListStyle}>
        {items.map((item) => {
          const isActive = activeTab === item.id;
          const isDisabled = item.disabled;
          
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id, isDisabled)}
              style={{
                ...styles.tabButton,
                ...(isActive ? styles.activeTab : {}),
                ...(isDisabled ? styles.disabledTab : {}),
              }}
              disabled={isDisabled}
              className={`tab-button ${isActive ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tab-panel-${item.id}`}
            >
              {item.icon && <span className="tab-icon">{item.icon}</span>}
              <span className="tab-label">{item.label}</span>
              {item.badge && (
                <span 
                  className="tab-badge"
                  style={{
                    background: tenantTheme.colors.primary || '#3B82F6',
                    color: 'white',
                    borderRadius: '9999px',
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    minWidth: '1.25rem',
                    textAlign: 'center',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div 
        className="tab-content"
        style={styles.tabContent}
        role="tabpanel"
        id={`tab-panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
      >
        {activeTabItem?.content}
      </div>
    </div>
  );
};

export const Tab = withSSR(TabComponent);

