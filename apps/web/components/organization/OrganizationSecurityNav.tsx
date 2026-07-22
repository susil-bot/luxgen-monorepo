import Link from 'next/link';
import { useRouter } from 'next/router';
import { ORGANIZATION_SECURITY_SECTIONS, type OrganizationSecuritySectionId } from '../../lib/organization-sections';

interface OrganizationSecurityNavProps {
  activeId: OrganizationSecuritySectionId;
}

export function OrganizationSecurityNav({ activeId }: OrganizationSecurityNavProps) {
  const router = useRouter();

  return (
    <div className="mt-6 pt-4" style={{ borderTop: '1px solid var(--color-separator)' }}>
      <p className="text-xs font-semibold uppercase tracking-wide text-tertiary px-2 mb-2">Security</p>

      <div className="md:hidden px-2 mb-2">
        <label htmlFor="organization-security-nav" className="sr-only">
          Security section
        </label>
        <select
          id="organization-security-nav"
          className="input-field w-full"
          value={activeId}
          onChange={(e) => {
            const section = ORGANIZATION_SECURITY_SECTIONS.find((s) => s.id === e.target.value);
            if (section) void router.push(section.href);
          }}
        >
          {ORGANIZATION_SECURITY_SECTIONS.map((section) => (
            <option key={section.id} value={section.id}>
              {section.label}
            </option>
          ))}
        </select>
      </div>

      <ul className="hidden md:block space-y-0.5">
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
