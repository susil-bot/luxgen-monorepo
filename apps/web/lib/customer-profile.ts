import type { CustomerDetail } from '@luxgen/ui';

export type MarketingChannel = 'email' | 'sms' | 'whatsapp';

export interface CustomerProfileInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  marketingEmail?: boolean;
  marketingSms?: boolean;
  marketingWhatsapp?: boolean;
}

export function customerToProfileInput(customer: CustomerDetail): CustomerProfileInput {
  return {
    firstName: customer.name.split(' ')[0] ?? '',
    lastName: customer.name.split(' ').slice(1).join(' ') ?? '',
    email: customer.email,
    phone: customer.phone === '—' ? '' : customer.phone,
    marketingEmail: customer.marketingEmail,
    marketingSms: customer.marketingSms,
    marketingWhatsapp: customer.marketingWhatsapp,
  };
}

export function applyProfilePatch(
  customer: CustomerDetail,
  patch: CustomerProfileInput,
): CustomerDetail {
  const firstName = patch.firstName ?? customer.name.split(' ')[0] ?? '';
  const lastName = patch.lastName ?? customer.name.split(' ').slice(1).join(' ');
  return {
    ...customer,
    name: `${firstName} ${lastName}`.trim() || customer.email,
    email: patch.email ?? customer.email,
    phone: patch.phone?.trim() ? patch.phone.trim() : '—',
    marketingEmail: patch.marketingEmail ?? customer.marketingEmail,
    marketingSms: patch.marketingSms ?? customer.marketingSms,
    marketingWhatsapp: patch.marketingWhatsapp ?? customer.marketingWhatsapp,
  };
}

export function marketingPatch(
  channel: MarketingChannel,
  value: boolean,
  current: CustomerDetail,
): CustomerProfileInput {
  const base = customerToProfileInput(current);
  if (channel === 'email') return { ...base, marketingEmail: value };
  if (channel === 'sms') return { ...base, marketingSms: value };
  return { ...base, marketingWhatsapp: value };
}
