import type { ReactNode } from 'react';

export interface SplitPageSectionProps {
  title?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}

/** White ios-card block used inside SplitPageLayout main/aside columns */
export function SplitPageSection({ title, hint, children, className = '' }: SplitPageSectionProps) {
  return (
    <section className={`ios-card p-4 sm:p-5 space-y-4 ${className}`}>
      {title && (
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-sm font-semibold text-primary">{title}</h2>
          {hint && <p className="text-xs text-tertiary text-right max-w-[55%]">{hint}</p>}
        </div>
      )}
      {children}
    </section>
  );
}
