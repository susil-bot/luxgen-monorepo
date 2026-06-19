import { SettingsShell } from '../../components/settings/SettingsShell';
import { getTenantPageProps } from '../../lib/tenant-page-props';

interface Props {
  tenant: string;
}

const TEMPLATES = [
  { id: 'order', label: 'Order confirmation', status: 'planned' },
  { id: 'shipping', label: 'Enrollment / progress update', status: 'planned' },
  { id: 'refund', label: 'Refund processed', status: 'planned' },
  { id: 'account', label: 'Account welcome', status: 'partial' },
  { id: 'cart', label: 'Abandoned checkout', status: 'planned' },
];

export default function SettingsNotificationsPage({ tenant }: Props) {
  return (
    <SettingsShell tenant={tenant} activeSection="notifications" title="Notifications" subtitle="Email templates">
      <div className="ios-card overflow-hidden">
        <ul className="divide-y" style={{ borderColor: 'var(--color-separator)' }}>
          {TEMPLATES.map((t) => (
            <li key={t.id} className="flex items-center justify-between p-4">
              <span className="text-primary">{t.label}</span>
              <span className="badge badge-gray capitalize">{t.status}</span>
            </li>
          ))}
        </ul>
      </div>
    </SettingsShell>
  );
}

export const getServerSideProps = getTenantPageProps;
