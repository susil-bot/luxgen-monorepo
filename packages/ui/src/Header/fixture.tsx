import { HeaderProps } from './Header';
import { defaultTheme } from '../theme';

export const headerFixtures = {
  default: {
    tenantTheme: defaultTheme,
    logoUrl: '/logo.png',
    menuItems: [
      { id: 'home', label: 'Home', href: '/' },
      { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
      { id: 'courses', label: 'Courses', href: '/courses' },
    ],
  } as HeaderProps,
  
  withoutLogo: {
    tenantTheme: defaultTheme,
    menuItems: [
      { id: 'home', label: 'Home', href: '/' },
      { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    ],
  } as HeaderProps,
  
  withCustomTheme: {
    tenantTheme: {
      ...defaultTheme,
      colors: {
        ...defaultTheme.colors,
        primary: '#8B5CF6',
        surface: '#F3F4F6',
      },
    },
    logoUrl: '/logo.png',
    menuItems: [
      { id: 'home', label: 'Home', href: '/' },
      { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    ],
  } as HeaderProps,
  
  withManyMenuItems: {
    tenantTheme: defaultTheme,
    logoUrl: '/logo.png',
    menuItems: [
      { id: 'home', label: 'Home', href: '/' },
      { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
      { id: 'courses', label: 'Courses', href: '/courses' },
      { id: 'students', label: 'Students', href: '/students' },
      { id: 'instructors', label: 'Instructors', href: '/instructors' },
      { id: 'analytics', label: 'Analytics', href: '/analytics' },
      { id: 'settings', label: 'Settings', href: '/settings' },
    ],
  } as HeaderProps,
  
  withMenuClick: {
    tenantTheme: defaultTheme,
    logoUrl: '/logo.png',
    menuItems: [
      { id: 'home', label: 'Home', href: '/' },
      { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    ],
    onMenuClick: (item) => console.log('Menu clicked:', item),
  } as HeaderProps,
};
