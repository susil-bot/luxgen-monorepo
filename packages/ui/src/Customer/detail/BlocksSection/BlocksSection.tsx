import type { ReactNode } from 'react';

export interface CustomerBlocksSectionProps {
  title?: string;
  changeCount?: number;
  children: ReactNode;
}

/** Shopify admin “Blocks” region — wraps app blocks like customer history timeline. */
export function CustomerBlocksSection({
  title = 'LuxGen: Customer history',
  changeCount,
  children,
}: CustomerBlocksSectionProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-primary">Blocks</h2>
      <div className="ios-card p-0 overflow-hidden">
        <div
          className="flex items-center gap-2 px-4 py-3 border-b"
          style={{ borderColor: 'var(--color-separator)' }}
        >
          <span
            className="flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-sm"
            style={{ background: 'var(--color-fill-quaternary)' }}
            aria-hidden
          >
            🕐
          </span>
          <span className="text-sm font-semibold text-primary flex-1 min-w-0 truncate">{title}</span>
          {changeCount != null && changeCount > 0 && (
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0"
              style={{ background: 'var(--color-fill-quaternary)', color: 'var(--color-label-secondary)' }}
            >
              {changeCount} {changeCount === 1 ? 'change' : 'changes'}
            </span>
          )}
        </div>
        <div className="p-4 sm:p-5">{children}</div>
      </div>
    </div>
  );
}
