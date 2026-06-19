import type { CustomerDetail } from '../../fetcher';
import { CustomerDetailSection } from '../../CustomerDetailSection';

const CHANNELS = [
  { key: 'email' as const, label: 'Email' },
  { key: 'sms' as const, label: 'SMS' },
  { key: 'whatsapp' as const, label: 'WhatsApp' },
];

export function MarketingSection({ customer }: { customer: CustomerDetail }) {
  const subscribed = {
    email: customer.marketingEmail,
    sms: customer.marketingSms,
    whatsapp: false,
  };

  return (
    <CustomerDetailSection title="Marketing">
      <ul className="space-y-3 text-sm">
        {CHANNELS.map((channel) => {
          const on = subscribed[channel.key];
          return (
            <li key={channel.key} className="flex items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-secondary cursor-default">
                <input
                  type="checkbox"
                  className="rounded border-gray-300"
                  checked={on}
                  readOnly
                  aria-label={`${channel.label} marketing`}
                />
                {channel.label}
              </label>
              <span className={`text-xs ${on ? 'text-secondary' : 'text-tertiary'}`}>
                {on ? 'Subscribed' : 'Not subscribed'}
              </span>
            </li>
          );
        })}
      </ul>
    </CustomerDetailSection>
  );
}
