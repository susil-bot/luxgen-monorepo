/** Settings hub navigation — Shopify Store Settings mapped to LuxGen LMS */

export type SettingsSectionId =
  | 'general'
  | 'storefront'
  | 'staff'
  | 'payments'
  | 'checkout'
  | 'shipping'
  | 'taxes'
  | 'domains'
  | 'notifications'
  | 'branding'
  | 'vocabulary'
  | 'customers'
  | 'policies'
  | 'languages'
  | 'apps'
  | 'security'
  | 'search'
  | 'billing';

export interface SettingsSection {
  id: SettingsSectionId;
  label: string;
  description: string;
  href: string;
  /** implemented | partial | planned */
  status: 'implemented' | 'partial' | 'planned';
  icon: string;
}

export const SETTINGS_SECTIONS: SettingsSection[] = [
  {
    id: 'general',
    label: 'General',
    description: 'Store name, contact, timezone, currency',
    href: '/settings/general',
    status: 'partial',
    icon: '🏪',
  },
  {
    id: 'storefront',
    label: 'Storefront',
    description: 'Trainer landing page and public routes',
    href: '/settings/storefront',
    status: 'implemented',
    icon: '🛍️',
  },
  {
    id: 'staff',
    label: 'Staff & permissions',
    description: 'Team accounts, roles, access',
    href: '/settings/staff',
    status: 'partial',
    icon: '👥',
  },
  {
    id: 'payments',
    label: 'Payments',
    description: 'Stripe, capture, refunds',
    href: '/organization/billing',
    status: 'partial',
    icon: '💳',
  },
  {
    id: 'billing',
    label: 'Plan & billing',
    description: 'Subscription, invoices, usage',
    href: '/organization/billing',
    status: 'implemented',
    icon: '📋',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    description: 'Email templates and alerts',
    href: '/settings/notifications',
    status: 'planned',
    icon: '✉️',
  },
  {
    id: 'branding',
    label: 'Branding',
    description: 'Logo, colors, social links',
    href: '/settings/branding',
    status: 'partial',
    icon: '🎨',
  },
  {
    id: 'vocabulary',
    label: 'Vocabulary',
    description: 'Rename Course, Student, and related terms to fit your business',
    href: '/settings/vocabulary',
    status: 'implemented',
    icon: '🏷️',
  },
  {
    id: 'security',
    label: 'Security',
    description: '2FA, API keys, webhooks',
    href: '/settings/security',
    status: 'planned',
    icon: '🔒',
  },
  {
    // T-SRCH-12: was an orphan page (route existed, nothing linked to it) — reachable from here now.
    id: 'search',
    label: 'Search',
    description: 'Results per page, search history tracking',
    href: '/settings/search',
    status: 'implemented',
    icon: '🔍',
  },
  {
    id: 'checkout',
    label: 'Checkout',
    description: 'Guest checkout, express pay',
    href: '/settings/checkout',
    status: 'planned',
    icon: '🛒',
  },
  {
    id: 'shipping',
    label: 'Shipping & delivery',
    description: 'Zones, rates, pickup',
    href: '/settings/shipping',
    status: 'planned',
    icon: '📦',
  },
  {
    id: 'taxes',
    label: 'Taxes',
    description: 'GST, VAT, tax-inclusive pricing',
    href: '/settings/taxes',
    status: 'planned',
    icon: '🧾',
  },
  {
    id: 'domains',
    label: 'Domains',
    description: 'Custom domain, SSL, redirects',
    href: '/settings/domains',
    status: 'planned',
    icon: '🌐',
  },
  {
    id: 'customers',
    label: 'Customer accounts',
    description: 'Registration, groups, tags',
    href: '/customers',
    status: 'partial',
    icon: '🎓',
  },
  {
    id: 'policies',
    label: 'Policies',
    description: 'Privacy, terms, refund policy',
    href: '/settings/policies',
    status: 'planned',
    icon: '📜',
  },
  {
    id: 'languages',
    label: 'Languages',
    description: 'Locales and translations',
    href: '/settings/languages',
    status: 'planned',
    icon: '🌍',
  },
  {
    id: 'apps',
    label: 'Apps & integrations',
    description: 'ERP, CRM, marketing tools',
    href: '/developer',
    status: 'partial',
    icon: '🔌',
  },
];

export const SETTINGS_GROUPS = [
  { title: 'Store', ids: ['general', 'storefront', 'branding', 'vocabulary', 'domains'] as SettingsSectionId[] },
  { title: 'Team & access', ids: ['staff', 'security', 'search'] as SettingsSectionId[] },
  { title: 'Commerce', ids: ['payments', 'billing', 'checkout', 'shipping', 'taxes'] as SettingsSectionId[] },
  { title: 'Customers & comms', ids: ['customers', 'notifications', 'policies', 'languages'] as SettingsSectionId[] },
  { title: 'Advanced', ids: ['apps'] as SettingsSectionId[] },
];
