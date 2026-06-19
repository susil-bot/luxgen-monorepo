import type { CustomerDetail } from '../../fetcher';
import { CustomerDetailSection } from '../../CustomerDetailSection';

export type MarketingChannel = 'email' | 'sms' | 'whatsapp';

export interface MarketingSectionProps {
  customer: CustomerDetail;
  /** When set, checkboxes persist to backend via parent handler */
  onMarketingChange?: (channel: MarketingChannel, subscribed: boolean) => void;
  saving?: boolean;
}

const CHANNELS: { key: MarketingChannel; label: string }[] = [
  { key: 'email', label: 'Email' },
  { key: 'sms', label: 'SMS' },
  { key: 'whatsapp', label: 'WhatsApp' },
];

export function MarketingSection({ customer, onMarketingChange, saving }: MarketingSectionProps) {
  const subscribed: Record<MarketingChannel, boolean> = {
    email: customer.marketingEmail,
    sms: customer.marketingSms,
    whatsapp: customer.marketingWhatsapp,
  };

  const editable = Boolean(onMarketingChange);

  return (
    <CustomerDetailSection title="Marketing">
      <ul className="space-y-3 text-sm">
        {CHANNELS.map((channel) => {
          const on = subscribed[channel.key];
          return (
            <li key={channel.key} className="flex items-center justify-between gap-3">
              <label
                className={`flex items-center gap-2 text-secondary ${editable ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <input
                  type="checkbox"
                  className="rounded"
                  checked={on}
                  readOnly={!editable}
                  disabled={!editable || saving}
                  onChange={
                    editable
                      ? (e) => onMarketingChange?.(channel.key, e.target.checked)
                      : undefined
                  }
                  aria-label={`${channel.label} marketing`}
                />
                {channel.label}
              </label>
              <span className={`text-xs ${on ? 'text-secondary' : 'text-tertiary'}`}>
                {saving ? 'Saving…' : on ? 'Subscribed' : 'Not subscribed'}
              </span>
            </li>
          );
        })}
      </ul>
    </CustomerDetailSection>
  );
}
