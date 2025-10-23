import { FooterProps } from './Footer';
import { defaultTheme } from '../theme';

export const footerFixtures = {
  default: {
    tenantTheme: defaultTheme,
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Contact', href: '/contact' },
    ],
    copyright: '© 2024 LuxGen. All rights reserved.',
  } as FooterProps,
  
  withoutLinks: {
    tenantTheme: defaultTheme,
    links: [],
    copyright: '© 2024 LuxGen. All rights reserved.',
  } as FooterProps,
  
  withCustomTheme: {
    tenantTheme: {
      ...defaultTheme,
      colors: {
        ...defaultTheme.colors,
        surface: '#F3F4F6',
        textSecondary: '#6B7280',
      },
    },
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
    copyright: '© 2024 Custom Company. All rights reserved.',
  } as FooterProps,
  
  withManyLinks: {
    tenantTheme: defaultTheme,
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Contact', href: '/contact' },
      { label: 'Help', href: '/help' },
      { label: 'About', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Careers', href: '/careers' },
      { label: 'Support', href: '/support' },
    ],
    copyright: '© 2024 LuxGen. All rights reserved.',
  } as FooterProps,
  
  withCustomCopyright: {
    tenantTheme: defaultTheme,
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
    copyright: '© 2024 My Company. Made with ❤️',
  } as FooterProps,
};
