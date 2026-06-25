import { OrganizationShell } from '../../../components/organization/OrganizationShell';
import { OrganizationSecurityNav } from '../../../components/organization/OrganizationSecurityNav';
import { getTenantPageProps } from '../../../lib/tenant-page-props';

interface Props {
  tenant: string;
}

export default function OrganizationSecurityScimPage({ tenant }: Props) {
  return (
    <OrganizationShell
      tenant={tenant}
      activeSection="security"
      securitySectionId="scim"
      title="SCIM integration"
      subtitle="Provision users automatically from your identity provider"
      securityNav={<OrganizationSecurityNav activeId="scim" />}
    >
      <div className="auth-notice auth-notice--info mb-4">
        <p className="text-sm">You can generate your SCIM API token after your SAML configuration is complete.</p>
      </div>
      <div className="ios-card p-6 space-y-3">
        <span className="badge badge-gray">Requires SAML</span>
        <p className="text-secondary text-sm">
          SCIM endpoints and token rotation will be available once SAML SSO is enabled for this tenant.
        </p>
      </div>
    </OrganizationShell>
  );
}

export const getServerSideProps = getTenantPageProps;
