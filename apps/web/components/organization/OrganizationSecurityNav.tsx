import Link from 'next/link';
import { ORGANIZATION_SECURITY_SECTIONS, type OrganizationSecuritySectionId } from '../../lib/organization-sections';

interface OrganizationSecurityNavProps {
  activeId: OrganizationSecuritySectionId;
}

export function OrganizationSecurityNav({ activeId }: OrganizationSecurityNavProps) {
  return (
    <div className="mt-6 pt-4" style={{ borderTop: '1px solid var(--color-separator)' }}>
      <p className="text-xs font-semibold uppercase tracking-wide text-tertiary px-2 mb-2">Security</p>
      <ul className="space-y-0.5">
        {ORGANIZATION_SECURITY_SECTIONS.map((section) => {
          const active = activeId === section.id;
          return (
            <li key={section.id}>
              <Link href={section.href} className={`nav-item block rounded-lg text-sm ${active ? 'active' : ''}`}>
                <span className="truncate">{section.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
