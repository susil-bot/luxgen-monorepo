import { SidebarProps } from './Sidebar';
import { defaultTheme } from '../theme';

export const sidebarFixtures = {
  default: {
    tenantTheme: defaultTheme,
    menuItems: [
      { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
      { id: 'courses', label: 'Courses', href: '/courses' },
      { id: 'students', label: 'Students', href: '/students' },
    ],
    collapsed: false,
  } as SidebarProps,
  
  collapsed: {
    tenantTheme: defaultTheme,
    menuItems: [
      { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
      { id: 'courses', label: 'Courses', href: '/courses' },
    ],
    collapsed: true,
  } as SidebarProps,
  
  withCustomTheme: {
    tenantTheme: {
      ...defaultTheme,
      colors: {
        ...defaultTheme.colors,
        primary: '#8B5CF6',
        surface: '#F3F4F6',
      },
    },
    menuItems: [
      { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
      { id: 'courses', label: 'Courses', href: '/courses' },
    ],
    collapsed: false,
  } as SidebarProps,
  
  withManyItems: {
    tenantTheme: defaultTheme,
    menuItems: [
      { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
      { id: 'courses', label: 'Courses', href: '/courses' },
      { id: 'students', label: 'Students', href: '/students' },
      { id: 'instructors', label: 'Instructors', href: '/instructors' },
      { id: 'analytics', label: 'Analytics', href: '/analytics' },
      { id: 'settings', label: 'Settings', href: '/settings' },
      { id: 'reports', label: 'Reports', href: '/reports' },
      { id: 'help', label: 'Help', href: '/help' },
    ],
    collapsed: false,
  } as SidebarProps,
  
  withToggle: {
    tenantTheme: defaultTheme,
    menuItems: [
      { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
      { id: 'courses', label: 'Courses', href: '/courses' },
    ],
    collapsed: false,
    onToggle: (collapsed) => console.log('Sidebar toggled:', collapsed),
  } as SidebarProps,
};
