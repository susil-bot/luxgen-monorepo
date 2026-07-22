import Link from 'next/link';
import { SettingsShell } from '../../components/settings/SettingsShell';
import { getTenantPageProps } from '../../lib/tenant-page-props';

interface Props {
  tenant: string;
}

const ROLES = [
  { id: 'owner', label: 'Owner', desc: 'Full access including billing' },
  { id: 'admin', label: 'Admin', desc: 'Products, orders, settings' },
  { id: 'manager', label: 'Manager', desc: 'Courses, groups, reports' },
  { id: 'support', label: 'Customer support', desc: 'Customers and orders' },
  { id: 'inventory', label: 'Inventory manager', desc: 'Courses and enrollments' },
];

export default function SettingsStaffPage({ tenant }: Props) {
  return (
    <SettingsShell tenant={tenant} activeSection="staff" title="Staff" subtitle="Team accounts and permissions">
      <div className="ios-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-primary">Roles</h2>
          <Link href="/users" className="ios-btn-secondary text-sm">
            Manage users →
          </Link>
        </div>
        <ul className="space-y-3">
          {ROLES.map((role) => (
            <li
              key={role.id}
              className="flex items-start gap-3 p-3 rounded-lg"
              style={{ background: 'var(--color-bg-tertiary)' }}
            >
              <span className="badge badge-blue capitalize">{role.label}</span>
              <p className="text-sm text-secondary">{role.desc}</p>
            </li>
          ))}
        </ul>
        <p className="text-xs text-tertiary">
          LuxGen maps Shopify staff roles to GraphQL UserRole (ADMIN, USER) + tenant permissions metadata.
        </p>
      </div>
    </SettingsShell>
  );
}

export const getServerSideProps = getTenantPageProps;
