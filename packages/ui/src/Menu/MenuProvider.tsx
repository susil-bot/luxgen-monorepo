import React, { createContext, useContext, useState, useCallback } from 'react';
import { MenuItem } from './Menu';

interface MenuContextType {
  activeItem: string | null;
  setActiveItem: (itemId: string | null) => void;
  expandedItems: Set<string>;
  setExpandedItems: (items: Set<string>) => void;
  toggleExpanded: (itemId: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
  hoveredItem: string | null;
  setHoveredItem: (itemId: string | null) => void;
  menuItems: MenuItem[];
  setMenuItems: (items: MenuItem[]) => void;
  addMenuItem: (item: MenuItem, parentId?: string) => void;
  removeMenuItem: (itemId: string) => void;
  updateMenuItem: (itemId: string, updates: Partial<MenuItem>) => void;
  getMenuItem: (itemId: string) => MenuItem | null;
  getMenuPath: (itemId: string) => string[];
  resetMenu: () => void;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
};

interface MenuProviderProps {
  children: React.ReactNode;
  initialItems?: MenuItem[];
  defaultCollapsed?: boolean;
  onActiveChange?: (itemId: string | null) => void;
  onExpandedChange?: (items: Set<string>) => void;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export const MenuProvider: React.FC<MenuProviderProps> = ({
  children,
  initialItems = [],
  defaultCollapsed = false,
  onActiveChange,
  onExpandedChange,
  onCollapsedChange,
}) => {
  const [activeItem, setActiveItemState] = useState<string | null>(null);
  const [expandedItems, setExpandedItemsState] = useState<Set<string>>(new Set());
  const [collapsed, setCollapsedState] = useState(defaultCollapsed);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialItems);

  const setActiveItem = useCallback((itemId: string | null) => {
    setActiveItemState(itemId);
    if (onActiveChange) {
      onActiveChange(itemId);
    }
  }, [onActiveChange]);

  const setExpandedItems = useCallback((items: Set<string>) => {
    setExpandedItemsState(items);
    if (onExpandedChange) {
      onExpandedChange(items);
    }
  }, [onExpandedChange]);

  const toggleExpanded = useCallback((itemId: string) => {
    setExpandedItemsState(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, []);

  const setCollapsed = useCallback((newCollapsed: boolean) => {
    setCollapsedState(newCollapsed);
    if (onCollapsedChange) {
      onCollapsedChange(newCollapsed);
    }
  }, [onCollapsedChange]);

  const toggleCollapsed = useCallback(() => {
    setCollapsedState(prev => {
      const newCollapsed = !prev;
      if (onCollapsedChange) {
        onCollapsedChange(newCollapsed);
      }
      return newCollapsed;
    });
  }, [onCollapsedChange]);

  const addMenuItem = useCallback((item: MenuItem, parentId?: string) => {
    if (parentId) {
      setMenuItems(prev => {
        const addToParent = (items: MenuItem[]): MenuItem[] => {
          return items.map(parentItem => {
            if (parentItem.id === parentId) {
              return {
                ...parentItem,
                children: [...(parentItem.children || []), item]
              };
            }
            if (parentItem.children) {
              return {
                ...parentItem,
                children: addToParent(parentItem.children)
              };
            }
            return parentItem;
          });
        };
        return addToParent(prev);
      });
    } else {
      setMenuItems(prev => [...prev, item]);
    }
  }, []);

  const removeMenuItem = useCallback((itemId: string) => {
    setMenuItems(prev => {
      const removeFromItems = (items: MenuItem[]): MenuItem[] => {
        return items.filter(item => {
          if (item.id === itemId) {
            return false;
          }
          if (item.children) {
            return {
              ...item,
              children: removeFromItems(item.children)
            };
          }
          return true;
        });
      };
      return removeFromItems(prev);
    });
  }, []);

  const updateMenuItem = useCallback((itemId: string, updates: Partial<MenuItem>) => {
    setMenuItems(prev => {
      const updateInItems = (items: MenuItem[]): MenuItem[] => {
        return items.map(item => {
          if (item.id === itemId) {
            return { ...item, ...updates };
          }
          if (item.children) {
            return {
              ...item,
              children: updateInItems(item.children)
            };
          }
          return item;
        });
      };
      return updateInItems(prev);
    });
  }, []);

  const getMenuItem = useCallback((itemId: string): MenuItem | null => {
    const findInItems = (items: MenuItem[]): MenuItem | null => {
      for (const item of items) {
        if (item.id === itemId) {
          return item;
        }
        if (item.children) {
          const found = findInItems(item.children);
          if (found) return found;
        }
      }
      return null;
    };
    return findInItems(menuItems);
  }, [menuItems]);

  const getMenuPath = useCallback((itemId: string): string[] => {
    const findPath = (items: MenuItem[], path: string[] = []): string[] | null => {
      for (const item of items) {
        const currentPath = [...path, item.id];
        if (item.id === itemId) {
          return currentPath;
        }
        if (item.children) {
          const found = findPath(item.children, currentPath);
          if (found) return found;
        }
      }
      return null;
    };
    return findPath(menuItems) || [];
  }, [menuItems]);

  const resetMenu = useCallback(() => {
    setActiveItemState(null);
    setExpandedItemsState(new Set());
    setCollapsedState(defaultCollapsed);
    setHoveredItem(null);
    setMenuItems(initialItems);
  }, [defaultCollapsed, initialItems]);

  const contextValue: MenuContextType = {
    activeItem,
    setActiveItem,
    expandedItems,
    setExpandedItems,
    toggleExpanded,
    collapsed,
    setCollapsed,
    toggleCollapsed,
    hoveredItem,
    setHoveredItem,
    menuItems,
    setMenuItems,
    addMenuItem,
    removeMenuItem,
    updateMenuItem,
    getMenuItem,
    getMenuPath,
    resetMenu,
  };

  return (
    <MenuContext.Provider value={contextValue}>
      {children}
    </MenuContext.Provider>
  );
};
