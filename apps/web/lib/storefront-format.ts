/** Format cents as currency display string */
export function formatStorefrontPrice(cents: number, currency = 'usd'): string {
  if (cents === 0) return 'Free';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export function formatBillingInterval(interval: string): string {
  switch (interval) {
    case 'month':
      return '/ month';
    case 'year':
      return '/ year';
    case 'one_time':
      return 'one-time';
    default:
      return interval;
  }
}
