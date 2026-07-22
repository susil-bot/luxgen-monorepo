/** Tenant-scoped Organization admin — Shopify-style org settings */

export type OrganizationSectionId = 'users' | 'roles' | 'groups' | 'security' | 'billing';

export type OrganizationSecuritySectionId = 'overview' | 'domains' | 'saml' | 'scim' | 'activity' | 'store';

export interface OrganizationSection {
  id: OrganizationSectionId;
  label: string;
  description: string;
  href: string;
  icon: string;
}

export interface OrganizationSecuritySection {
  id: OrganizationSecuritySectionId;
  label: string;
  description: string;
  href: string;
  status: 'live' | 'partial' | 'planned';
}

export interface OrganizationBreadcrumb {
  label: string;
  href?: string;
}

export const ORGANIZATION_SECTIONS: OrganizationSection[] = [
  {
    id: 'users',
    label: 'Users',
    description: 'Manage organization members and invitations',
    href: '/organization/users',
    icon: '👤',
  },
  {
    id: 'roles',
    label: 'Roles',
    description: 'System roles and permissions',
    href: '/organization/roles',
    icon: '🛡️',
  },
  {
    id: 'groups',
    label: 'Groups',
    description: 'Teams and member groups',
    href: '/organization/groups',
    icon: '👥',
  },
  {
    id: 'security',
    label: 'Security',
    description: 'Sign-in, SSO, and activity',
    href: '/organization/security',
    icon: '🔒',
  },
  {
    id: 'billing',
    label: 'Billing',
    description: 'Plans, invoices, and payment method',
    href: '/organization/billing',
    icon: '💳',
  },
];

export const ORGANIZATION_SECURITY_SECTIONS: OrganizationSecuritySection[] = [
  {
    id: 'overview',
    label: 'Organization security',
    description: 'Secure sign-in requirements for your organization',
    href: '/organization/security',
    status: 'partial',
  },
  {
    id: 'domains',
    label: 'Domain verification',
    description: 'Verify domains for SSO and email',
    href: '/organization/security/domains',
    status: 'planned',
  },
  {
    id: 'saml',
    label: 'SAML configuration',
    description: 'Single sign-on through your identity provider',
    href: '/organization/security/saml',
    status: 'planned',
  },
  {
    id: 'scim',
    label: 'SCIM integration',
    description: 'Provision users from your IdP after SAML is configured',
    href: '/organization/security/scim',
    status: 'planned',
  },
  {
    id: 'activity',
    label: 'User activity logs',
    description: 'Monitor and review user activities',
    href: '/organization/security/activity',
    status: 'partial',
  },
  {
    id: 'store',
    label: 'Store security',
    description: 'Collaborators and store-level access',
    href: '/organization/security/store',
    status: 'partial',
  },
];

/** Default breadcrumb trail for OrganizationShell (UI-20). */
export function buildOrganizationBreadcrumbs(
  activeSection: OrganizationSectionId,
  securitySectionId?: OrganizationSecuritySectionId,
): OrganizationBreadcrumb[] {
  const section = ORGANIZATION_SECTIONS.find((s) => s.id === activeSection);
  const crumbs: OrganizationBreadcrumb[] = [{ label: 'Organization', href: '/organization/users' }];

  if (!section) return crumbs;

  if (activeSection === 'security' && securitySectionId) {
    const securitySection = ORGANIZATION_SECURITY_SECTIONS.find((s) => s.id === securitySectionId);
    crumbs.push({ label: section.label, href: section.href });
    if (securitySection) {
      crumbs.push({ label: securitySection.label });
    }
    return crumbs;
  }

  crumbs.push({ label: section.label });
  return crumbs;
}
