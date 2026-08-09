/**
 * Static command list for the Cmd/Ctrl+K command palette (T-SRCH-03).
 *
 * Scoped MVP per docs/TODO-search.md §3 "Command Categories" — a fixed subset of
 * create + navigation commands rather than the full dynamic/AI command set the spec
 * describes. Every `href` below must point at a real, shipped page (verified against
 * apps/web/pages/**) — do not add a command here without a matching page.
 */
export interface PaletteCommand {
  id: string;
  label: string;
  group: 'Create' | 'Go to';
  icon: string;
  href: string;
  keywords?: string[];
}

export const PALETTE_COMMANDS: PaletteCommand[] = [
  { id: 'create-course', label: 'Create new course', group: 'Create', icon: '🎓', href: '/courses/create' },
  { id: 'create-product', label: 'Create new product', group: 'Create', icon: '🛍️', href: '/products/create' },
  { id: 'create-coupon', label: 'Create new coupon', group: 'Create', icon: '🏷️', href: '/coupons/create' },
  { id: 'goto-dashboard', label: 'Go to Dashboard', group: 'Go to', icon: '🏠', href: '/dashboard' },
  { id: 'goto-orders', label: 'Go to Orders', group: 'Go to', icon: '🛒', href: '/orders', keywords: ['commerce'] },
  { id: 'goto-analytics', label: 'Go to Analytics', group: 'Go to', icon: '📊', href: '/analytics' },
  { id: 'goto-automations', label: 'Go to Automations', group: 'Go to', icon: '⚡', href: '/automations', keywords: ['workflow'] },
  { id: 'goto-settings', label: 'Go to Settings', group: 'Go to', icon: '⚙️', href: '/settings' },
];

/** Case-insensitive substring match over label + keywords. Empty query returns all commands. */
export function filterPaletteCommands(query: string): PaletteCommand[] {
  const q = query.trim().toLowerCase();
  if (!q) return PALETTE_COMMANDS;
  return PALETTE_COMMANDS.filter(
    (c) => c.label.toLowerCase().includes(q) || c.keywords?.some((k) => k.toLowerCase().includes(q)),
  );
}
