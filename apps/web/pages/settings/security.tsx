import { SettingsShell } from '../../components/settings/SettingsShell';
import { getTenantPageProps } from '../../lib/tenant-page-props';

interface Props {
  tenant: string;
}

const SECURITY_ITEMS = [
  { label: 'Two-factor authentication', status: 'Planned' },
  { label: 'Device management', status: 'Planned' },
  { label: 'Login history', status: 'Planned' },
  { label: 'API keys & webhooks', status: 'Partial — /developer' },
  { label: 'Session expiry', status: 'Live — Auth Phase 0' },
];

export default function SettingsSecurityPage({ tenant }: Props) {
  return (
    <SettingsShell tenant={tenant} activeSection="security" title="Security" subtitle="Authentication and API access">
      <div className="ios-card overflow-hidden">
        <ul className="divide-y" style={{ borderColor: 'var(--color-separator)' }}>
          {SECURITY_ITEMS.map((item) => (
            <li key={item.label} className="flex items-center justify-between p-4">
              <span className="text-primary">{item.label}</span>
              <span className="badge badge-gray text-xs">{item.status}</span>
            </li>
          ))}
        </ul>
      </div>
    </SettingsShell>
  );
}

export const getServerSideProps = getTenantPageProps;
