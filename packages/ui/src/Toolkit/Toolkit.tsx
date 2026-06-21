import type { ReactNode } from 'react';

export interface ToolkitItem {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  destructive?: boolean;
}

export interface ToolkitProps {
  items: ToolkitItem[];
  /** Accessible name when no visible title */
  ariaLabel?: string;
  size?: 'small' | 'medium';
  className?: string;
}

/** Horizontal row of tool actions for headers, editors, and panels */
export function Toolkit({ items, ariaLabel = 'Toolkit', size = 'medium', className = '' }: ToolkitProps) {
  const buttonPad = size === 'small' ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-sm';

  return (
    <div
      role="toolbar"
      aria-label={ariaLabel}
      className={`inline-flex flex-wrap items-center gap-1 rounded-xl p-1 ${className}`}
      style={{ background: 'var(--color-fill-quaternary)', border: '1px solid var(--color-separator)' }}
    >
      {items.map((item) => {
        const isDisabled = item.disabled;
        const tone = item.destructive
          ? 'text-red-600 hover:bg-red-50'
          : item.active
            ? 'text-primary bg-white shadow-sm'
            : 'text-secondary hover:text-primary hover:bg-[var(--color-fill-tertiary)]';

        return (
          <button
            key={item.id}
            type="button"
            role="button"
            disabled={isDisabled}
            aria-pressed={item.active ?? false}
            aria-label={item.label}
            title={item.label}
            className={`inline-flex items-center gap-1.5 rounded-lg font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-blue)] ${buttonPad} ${
              isDisabled ? 'cursor-not-allowed opacity-50' : tone
            }`}
            onClick={() => {
              if (isDisabled) return;
              item.onClick?.();
            }}
          >
            {item.icon ? (
              <span className="inline-flex shrink-0" aria-hidden>
                {item.icon}
              </span>
            ) : null}
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
