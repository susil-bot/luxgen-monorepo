import { OrganizationShell } from '../../../components/organization/OrganizationShell';
import { OrganizationSecurityNav } from '../../../components/organization/OrganizationSecurityNav';
import { getTenantPageProps } from '../../../lib/tenant-page-props';

interface Props {
  tenant: string;
}

const SAMPLE_LOGS = [
  { id: '1', user: 'admin@demo.com', action: 'Signed in', at: '2026-06-20T09:12:00Z' },
  { id: '2', user: 'instructor@demo.com', action: 'Updated course', at: '2026-06-20T08:45:00Z' },
  { id: '3', user: 'admin@demo.com', action: 'Invited user', at: '2026-06-19T16:30:00Z' },
];

export default function OrganizationSecurityActivityPage({ tenant }: Props) {
  return (
    <OrganizationShell
      tenant={tenant}
      activeSection="security"
      title="User activity logs"
      subtitle="Monitor and review user activities"
      securityNav={<OrganizationSecurityNav activeId="activity" />}
    >
      <div className="ios-card overflow-hidden">
        <div className="ios-table-wrap">
          <table className="ios-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Action</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE_LOGS.map((log) => (
                <tr key={log.id}>
                  <td>{log.user}</td>
                  <td>{log.action}</td>
                  <td className="text-secondary text-sm">{new Date(log.at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="p-4 text-xs text-tertiary" style={{ borderTop: '1px solid var(--color-separator)' }}>
          Sample activity — wire to audit API in a follow-up.
        </p>
      </div>
    </OrganizationShell>
  );
}

export const getServerSideProps = getTenantPageProps;
