import Link from 'next/link';
import { OrganizationShell } from '../../../components/organization/OrganizationShell';
import { OrganizationSecurityNav } from '../../../components/organization/OrganizationSecurityNav';
import { ORGANIZATION_SECURITY_SECTIONS } from '../../../lib/organization-sections';
import { getTenantPageProps } from '../../../lib/tenant-page-props';

interface Props {
  tenant: string;
}

export default function OrganizationSecurityPage({ tenant }: Props) {
  return (
    <OrganizationShell
      tenant={tenant}
      activeSection="security"
      title="Organization security"
      subtitle="Secure sign-in and identity for this tenant"
      securitySectionId="overview"
      securityNav={<OrganizationSecurityNav activeId="overview" />}
    >
      <div className="auth-notice auth-notice--warning">
        <p className="font-medium text-primary">Secure sign-in method is not required</p>
        <p className="text-sm text-secondary mt-1">
          Manage secure sign-in method requirements for each user from their user page. Users who are not required to
          use passkeys or two-step authentication could put your organization at risk.
        </p>
        <Link href="/organization/users" className="ios-btn-plain text-sm mt-2 inline-block">
          Manage users →
        </Link>
      </div>

      <div className="ios-card overflow-hidden divide-y" style={{ borderColor: 'var(--color-separator)' }}>
        {ORGANIZATION_SECURITY_SECTIONS.filter((s) => s.id !== 'overview').map((section) => (
          <Link
            key={section.id}
            href={section.href}
            className="flex items-center justify-between p-4 hover:bg-[var(--color-fill-quaternary)] transition-colors"
          >
            <div>
              <p className="font-medium text-primary">{section.label}</p>
              <p className="text-sm text-secondary mt-0.5">{section.description}</p>
            </div>
            <span
              className={`badge ${section.status === 'live' ? 'badge-green' : section.status === 'partial' ? 'badge-orange' : 'badge-gray'}`}
            >
              {section.status}
            </span>
          </Link>
        ))}
      </div>
    </OrganizationShell>
  );
}

export const getServerSideProps = getTenantPageProps;
