import { OrganizationShell } from '../../../components/organization/OrganizationShell';
import { OrganizationSecurityNav } from '../../../components/organization/OrganizationSecurityNav';
import { getTenantPageProps } from '../../../lib/tenant-page-props';

interface Props {
  tenant: string;
}

function SecurityPlaceholder({
  tenant,
  activeId,
  title,
  description,
  status,
}: Props & {
  activeId: 'domains' | 'saml' | 'scim' | 'activity' | 'store';
  title: string;
  description: string;
  status: string;
}) {
  return (
    <OrganizationShell
      tenant={tenant}
      activeSection="security"
      securitySectionId={activeId}
      title={title}
      subtitle={description}
      securityNav={<OrganizationSecurityNav activeId={activeId} />}
    >
      <div className="ios-card p-6 space-y-3">
        <span className="badge badge-gray">{status}</span>
        <p className="text-secondary text-sm">{description}</p>
      </div>
    </OrganizationShell>
  );
}

export default function OrganizationSecurityDomainsPage({ tenant }: Props) {
  return (
    <SecurityPlaceholder
      tenant={tenant}
      activeId="domains"
      title="Domain verification"
      description="Verify domains for SSO and organizational email. Required before SAML configuration."
      status="Planned"
    />
  );
}

export const getServerSideProps = getTenantPageProps;
