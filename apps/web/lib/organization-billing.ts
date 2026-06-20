/** Organization billing — cycle helpers and past bill records */

export type BillPaymentStatus = 'paid' | 'open' | 'failed' | 'processing' | 'refunded' | 'canceled';

export type BillType = 'billing_cycle' | 'subscription';

export interface PastBill {
  id: string;
  dateIssued: string;
  billNumber: string;
  billType: BillType;
  paymentStatus: BillPaymentStatus;
  amount: number;
  currency: string;
}

export interface BillingCycleInfo {
  start: Date;
  end: Date;
  runningTotal: number;
  currency: string;
}

const STATUS_TABS: { id: string; label: string; statuses?: BillPaymentStatus[] }[] = [
  { id: 'all', label: 'All' },
  { id: 'paid', label: 'Paid', statuses: ['paid'] },
  { id: 'open', label: 'Open', statuses: ['open'] },
  { id: 'failed', label: 'Failed', statuses: ['failed'] },
  { id: 'processing', label: 'Processing', statuses: ['processing'] },
  { id: 'refunded', label: 'Refunded', statuses: ['refunded'] },
  { id: 'canceled', label: 'Canceled', statuses: ['canceled'] },
];

export function getBillStatusTabs(bills: PastBill[]) {
  return STATUS_TABS.map((tab) => ({
    id: tab.id,
    label: tab.label,
    count: tab.id === 'all' ? bills.length : bills.filter((b) => tab.statuses?.includes(b.paymentStatus)).length,
  }));
}

export function filterBillsByTab(bills: PastBill[], tabId: string): PastBill[] {
  const tab = STATUS_TABS.find((t) => t.id === tabId);
  if (!tab || tab.id === 'all' || !tab.statuses) return bills;
  return bills.filter((b) => tab.statuses!.includes(b.paymentStatus));
}

export function paymentStatusBadge(status: BillPaymentStatus): string {
  switch (status) {
    case 'paid':
      return 'badge-green';
    case 'open':
    case 'processing':
      return 'badge-orange';
    case 'failed':
    case 'canceled':
      return 'badge-red';
    case 'refunded':
      return 'badge-gray';
    default:
      return 'badge-gray';
  }
}

export function paymentStatusLabel(status: BillPaymentStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function billTypeLabel(type: BillType): string {
  return type === 'billing_cycle' ? 'Billing cycle' : 'Subscription';
}

export function formatBillDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatMoney(amount: number, currency = 'USD'): string {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
}

/** Monthly cycle anchored on period end from Stripe, or calendar month */
export function getCurrentBillingCycle(periodEndIso?: string | null): BillingCycleInfo {
  const end = periodEndIso ? new Date(periodEndIso) : new Date();
  if (!periodEndIso) {
    end.setMonth(end.getMonth() + 1);
    end.setDate(18);
  }
  const start = new Date(end);
  start.setMonth(start.getMonth() - 1);

  return {
    start,
    end,
    runningTotal: 0,
    currency: 'USD',
  };
}

/** Build past bills from subscription data (synthetic history until invoice API exists) */
export function buildPastBills(options: {
  priceMonthly: number;
  planName: string;
  subscriptionStatus: string;
  currency?: string;
}): PastBill[] {
  const { priceMonthly, subscriptionStatus, currency = 'USD' } = options;
  const amount = subscriptionStatus === 'active' || subscriptionStatus === 'trialing' ? priceMonthly : 0;
  const bills: PastBill[] = [];
  const now = new Date();

  for (let i = 0; i < 6; i++) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - i);
    d.setDate(18);
    const isPaid = i > 0 || subscriptionStatus === 'active';
    bills.push({
      id: `bill-${i}`,
      dateIssued: d.toISOString(),
      billNumber: `#${490565466 - i * 1111}`,
      billType: i % 3 === 0 ? 'subscription' : 'billing_cycle',
      paymentStatus: isPaid ? 'paid' : subscriptionStatus === 'past_due' ? 'failed' : 'paid',
      amount: i === 0 && subscriptionStatus === 'past_due' ? amount : amount,
      currency: i === 1 ? 'INR' : currency,
    });
  }
  return bills;
}

export function exportBillsCsv(bills: PastBill[]): string {
  const header = 'Date issued,Bill number,Bill type,Payment status,Amount,Currency';
  const rows = bills.map(
    (b) =>
      `"${formatBillDate(b.dateIssued)}","${b.billNumber}","${billTypeLabel(b.billType)}","${paymentStatusLabel(b.paymentStatus)}",${b.amount},${b.currency}`,
  );
  return [header, ...rows].join('\n');
}

export function getPaymentMethodLabel(stripeConfigured: boolean, plan: string): string {
  if (plan === 'FREE') return 'No payment method — free plan';
  if (stripeConfigured) return 'Billing via Stripe';
  return 'Billing manually — contact support';
}
