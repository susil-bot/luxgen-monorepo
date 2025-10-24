import { TenantTheme } from '../theme';

export interface NavBarStyles {
  container: string;
  logo: string;
  navItem: string;
  navItemActive: string;
  navItemHover: string;
  dropdown: string;
  userMenu: string;
  userMenuButton: string;
  userMenuDropdown: string;
  mobileMenu: string;
  mobileMenuItem: string;
  searchBar: string;
  notificationButton: string;
  notificationBadge: string;
}

export const getNavBarStyles = (tenantTheme?: TenantTheme): NavBarStyles => {
  const colors = tenantTheme?.colors || {
    primary: '#10b981',
    secondary: '#6b7280',
    accent: '#059669',
  };

  return {
    container: `
      relative z-50 transition-all duration-300 ease-in-out
      bg-white border-b border-gray-200 shadow-sm
    `,
    
    logo: `
      flex items-center space-x-2 text-xl font-bold
      text-green-600 hover:text-green-700 transition-colors duration-200
    `,
    
    navItem: `
      flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium
      text-gray-700 hover:text-gray-900 hover:bg-gray-100
      transition-colors duration-200 cursor-pointer
    `,
    
    navItemActive: `
      bg-green-50 text-green-700 border-r-2 border-green-500
    `,
    
    navItemHover: `
      hover:bg-green-50 hover:text-green-700
    `,
    
    dropdown: `
      absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg
      border border-gray-200 opacity-0 invisible
      group-hover:opacity-100 group-hover:visible
      transition-all duration-200 z-50
    `,
    
    userMenu: `
      relative
    `,
    
    userMenuButton: `
      flex items-center space-x-3 p-2 rounded-lg
      hover:bg-gray-100 transition-colors duration-200
      focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
    `,
    
    userMenuDropdown: `
      absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg
      border border-gray-200 z-50
    `,
    
    mobileMenu: `
      md:hidden border-t border-gray-200
    `,
    
    mobileMenuItem: `
      block w-full text-left px-3 py-2 rounded-md text-base font-medium
      text-gray-700 hover:bg-gray-100 transition-colors duration-200
    `,
    
    searchBar: `
      w-64 px-4 py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-lg
      focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
      transition-all duration-200
    `,
    
    notificationButton: `
      relative p-2 text-gray-400 hover:text-gray-500
      transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500
    `,
    
    notificationBadge: `
      absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs
      rounded-full flex items-center justify-center
    `,
  };
};

export const getVariantStyles = (variant: 'default' | 'transparent' | 'solid', isScrolled: boolean = false) => {
  switch (variant) {
    case 'transparent':
      return {
        container: isScrolled 
          ? 'bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm'
          : 'bg-transparent border-b border-transparent shadow-none',
        text: 'text-gray-900',
      };
    
    case 'solid':
      return {
        container: 'bg-gray-900 border-b border-gray-800 shadow-lg',
        text: 'text-white',
      };
    
    case 'default':
    default:
      return {
        container: 'bg-white border-b border-gray-200 shadow-sm',
        text: 'text-gray-900',
      };
  }
};

export const getPositionStyles = (position: 'fixed' | 'sticky' | 'static') => {
  switch (position) {
    case 'fixed':
      return 'fixed top-0 left-0 right-0 z-50';
    case 'sticky':
      return 'sticky top-0 z-50';
    case 'static':
    default:
      return 'static';
  }
};
