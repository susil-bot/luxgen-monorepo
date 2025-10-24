import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { SidebarSection, SidebarItem } from './Sidebar';

interface SidebarContextType {
  isCollapsed: boolean;
  toggleCollapsed: () => void;
  setCollapsed: (collapsed: boolean) => void;
  expandedSections: Set<string>;
  toggleSection: (sectionId: string) => void;
  activeItem: string;
  setActiveItem: (itemId: string) => void;
  onItemClick: (item: SidebarItem) => void;
  onUserAction: (action: 'profile' | 'settings' | 'logout') => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

interface SidebarProviderProps {
  children: ReactNode;
  defaultCollapsed?: boolean;
  onItemClick?: (item: SidebarItem) => void;
  onUserAction?: (action: 'profile' | 'settings' | 'logout') => void;
  onToggle?: (collapsed: boolean) => void;
}

export const SidebarProvider: React.FC<SidebarProviderProps> = ({
  children,
  defaultCollapsed = false,
  onItemClick,
  onUserAction,
  onToggle,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [activeItem, setActiveItem] = useState<string>('');

  const toggleCollapsed = useCallback(() => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    onToggle?.(newCollapsed);
  }, [isCollapsed, onToggle]);

  const setCollapsed = useCallback((collapsed: boolean) => {
    setIsCollapsed(collapsed);
    onToggle?.(collapsed);
  }, [onToggle]);

  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(sectionId)) {
        newExpanded.delete(sectionId);
      } else {
        newExpanded.add(sectionId);
      }
      return newExpanded;
    });
  }, []);

  const handleItemClick = useCallback((item: SidebarItem) => {
    setActiveItem(item.id);
    onItemClick?.(item);
  }, [onItemClick]);

  const handleUserAction = useCallback((action: 'profile' | 'settings' | 'logout') => {
    onUserAction?.(action);
  }, [onUserAction]);

  const contextValue: SidebarContextType = {
    isCollapsed,
    toggleCollapsed,
    setCollapsed,
    expandedSections,
    toggleSection,
    activeItem,
    setActiveItem,
    onItemClick: handleItemClick,
    onUserAction: handleUserAction,
  };

  return (
    <SidebarContext.Provider value={contextValue}>
      {children}
    </SidebarContext.Provider>
  );
};
