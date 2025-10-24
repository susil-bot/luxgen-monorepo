import React, { useState, useEffect } from 'react';
import { withSSR } from '../ssr';
import { defaultTheme, TenantTheme } from '../theme';
import { Menu, MenuItem } from './Menu';
import { MenuProvider, useMenu } from './MenuProvider';

export interface MenuLayerProps {
  tenantTheme?: TenantTheme;
  items: MenuItem[];
  onItemClick?: (item: MenuItem) => void;
  className?: string;
  variant?: 'default' | 'compact' | 'minimal';
  position?: 'top' | 'bottom' | 'left' | 'right';
  showIcons?: boolean;
  showBadges?: boolean;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  onToggle?: (collapsed: boolean) => void;
  level?: number;
  maxLevel?: number;
  showLevel?: boolean;
  activeItem?: string;
  onActiveChange?: (itemId: string) => void;
  zIndex?: number;
  backgroundColor?: string;
  borderColor?: string;
  shadowColor?: string;
  opacity?: number;
  backdropBlur?: boolean;
  animationDuration?: number;
  responsive?: boolean;
  mobileBreakpoint?: number;
  tabletBreakpoint?: number;
  desktopBreakpoint?: number;
}

const MenuLayerComponent: React.FC<MenuLayerProps> = ({
  tenantTheme = defaultTheme,
  items,
  onItemClick,
  className = '',
  variant = 'default',
  position = 'top',
  showIcons = true,
  showBadges = true,
  collapsible = true,
  defaultCollapsed = false,
  onToggle,
  level = 0,
  maxLevel = 3,
  showLevel = false,
  activeItem,
  onActiveChange,
  zIndex = 50,
  backgroundColor = 'bg-white',
  borderColor = 'border-gray-200',
  shadowColor = 'shadow-lg',
  opacity = 1,
  backdropBlur = false,
  animationDuration = 300,
  responsive = true,
  mobileBreakpoint = 640,
  tabletBreakpoint = 768,
  desktopBreakpoint = 1024,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  const colors = tenantTheme?.colors || defaultTheme.colors;

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < mobileBreakpoint);
      setIsTablet(width >= mobileBreakpoint && width < tabletBreakpoint);
      setIsDesktop(width >= desktopBreakpoint);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileBreakpoint, tabletBreakpoint, desktopBreakpoint]);

  const getResponsiveStyles = () => {
    if (!responsive) return '';

    if (isMobile) {
      return 'fixed top-0 left-0 right-0 z-50';
    }
    
    if (isTablet) {
      return 'sticky top-0 z-40';
    }
    
    return 'sticky top-0 z-30';
  };

  const getPositionStyles = () => {
    switch (position) {
      case 'top':
        return 'top-0 left-0 right-0';
      case 'bottom':
        return 'bottom-0 left-0 right-0';
      case 'left':
        return 'top-0 left-0 bottom-0';
      case 'right':
        return 'top-0 right-0 bottom-0';
      default:
        return 'top-0 left-0 right-0';
    }
  };

  const getLayerStyles = () => {
    return `
      ${getResponsiveStyles()}
      ${getPositionStyles()}
      ${backgroundColor}
      ${borderColor}
      ${shadowColor}
      border
      transition-all
      duration-${animationDuration}
      ${backdropBlur ? 'backdrop-blur-sm' : ''}
      ${isVisible ? 'opacity-100' : 'opacity-0'}
      ${isVisible ? 'translate-y-0' : 'translate-y-[-100%]'}
    `;
  };

  return (
    <MenuProvider
      initialItems={items}
      defaultCollapsed={defaultCollapsed}
      onActiveChange={onActiveChange}
    >
      <div
        className={`
          ${getLayerStyles()}
          ${className}
        `}
        style={{
          zIndex,
          opacity,
        }}
        {...props}
      >
        <Menu
          items={items}
          onItemClick={onItemClick}
          variant={variant}
          position={position}
          showIcons={showIcons}
          showBadges={showBadges}
          collapsible={collapsible}
          onToggle={onToggle}
          level={level}
          maxLevel={maxLevel}
          showLevel={showLevel}
          activeItem={activeItem}
          onActiveChange={onActiveChange}
        />
      </div>
    </MenuProvider>
  );
};

export const MenuLayer = withSSR(MenuLayerComponent);
