/** Settings hub navigation — Shopify Store Settings mapped to LuxGen LMS */

export type SettingsSectionId =
  | 'general'
  | 'staff'
  | 'payments'
  | 'checkout'
  | 'shipping'
  | 'taxes'
  | 'domains'
  | 'notifications'
  | 'branding'
  | 'customers'
  | 'policies'
  | 'languages'
  | 'apps'
  | 'security'
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
    href: '/billing',
    status: 'partial',
    icon: '💳',
  },
  {
    id: 'billing',
    label: 'Plan & billing',
    description: 'Subscription, invoices, usage',
    href: '/billing',
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
    id: 'security',
    label: 'Security',
    description: '2FA, API keys, webhooks',
    href: '/settings/security',
    status: 'planned',
    icon: '🔒',
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
  { title: 'Store', ids: ['general', 'branding', 'domains'] as SettingsSectionId[] },
  { title: 'Team & access', ids: ['staff', 'security'] as SettingsSectionId[] },
  { title: 'Commerce', ids: ['payments', 'billing', 'checkout', 'shipping', 'taxes'] as SettingsSectionId[] },
  { title: 'Customers & comms', ids: ['customers', 'notifications', 'policies', 'languages'] as SettingsSectionId[] },
  { title: 'Advanced', ids: ['apps'] as SettingsSectionId[] },
];
