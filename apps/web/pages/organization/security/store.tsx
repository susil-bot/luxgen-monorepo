import { OrganizationShell } from '../../../components/organization/OrganizationShell';
import { OrganizationSecurityNav } from '../../../components/organization/OrganizationSecurityNav';
import { getTenantPageProps } from '../../../lib/tenant-page-props';

interface Props {
  tenant: string;
}

export default function OrganizationSecurityStorePage({ tenant }: Props) {
  return (
    <OrganizationShell
      tenant={tenant}
      activeSection="security"
      securitySectionId="store"
      title="Store security"
      subtitle="Collaborators and store-level access"
      securityNav={<OrganizationSecurityNav activeId="store" />}
    >
      <div className="ios-card p-6 space-y-4">
        <h2 className="text-lg font-semibold text-primary">Collaborators</h2>
        <p className="text-secondary text-sm">
          Give designers, developers, and marketers access to this store. Collaborators don&apos;t count toward your
          staff limit.
        </p>
        <p className="text-sm">
          <a href="/developer" className="ios-btn-plain">
            Learn more about collaborators →
          </a>
        </p>
        <button type="button" className="ios-btn-primary" disabled>
          Add collaborator
        </button>
      </div>
    </OrganizationShell>
  );
}

export const getServerSideProps = getTenantPageProps;
