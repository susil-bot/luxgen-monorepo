import { OrganizationShell } from '../../../components/organization/OrganizationShell';
import { OrganizationSecurityNav } from '../../../components/organization/OrganizationSecurityNav';
import { getTenantPageProps } from '../../../lib/tenant-page-props';

interface Props {
  tenant: string;
}

export default function OrganizationSecuritySamlPage({ tenant }: Props) {
  return (
    <OrganizationShell
      tenant={tenant}
      activeSection="security"
      title="SAML configuration"
      subtitle="Manage single sign-on authentication through your identity provider"
      securityNav={<OrganizationSecurityNav activeId="saml" />}
    >
      <div className="ios-card p-6 space-y-4">
        <span className="badge badge-gray">Planned</span>
        <p className="text-secondary text-sm">
          Configure your IdP metadata URL, entity ID, and certificate to enable SAML SSO for this organization.
        </p>
        <div className="ios-form-group">
          <label htmlFor="idp-url">Identity provider metadata URL</label>
          <input id="idp-url" className="ios-input w-full" disabled placeholder="https://idp.example.com/metadata" />
        </div>
        <button type="button" className="ios-btn-primary" disabled>
          Save configuration
        </button>
      </div>
    </OrganizationShell>
  );
}

export const getServerSideProps = getTenantPageProps;
