import React, { useEffect, useRef } from 'react';
import type { SortDropdownProps } from './types';

export const SortDropdown: React.FC<SortDropdownProps> = ({
  options,
  selectedOption,
  direction,
  onOptionChange,
  onDirectionChange,
  onClose,
  className = '',
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!onClose) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="Sort options"
      className={`absolute right-0 top-full mt-1 w-52 rounded-2xl shadow-lg border z-50 overflow-hidden ${className}`}
      style={{
        background: 'var(--color-bg-secondary)',
        borderColor: 'var(--color-separator)',
        boxShadow: 'var(--shadow-lg)',
      }}
    >
      {/* Sort by heading */}
      <div
        className="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-widest"
        style={{ color: 'var(--color-label-secondary)' }}
      >
        Sort by
      </div>

      {/* Radio options */}
      <div className="pb-2">
        {options.map((opt) => {
          const isSelected = selectedOption === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onOptionChange(opt.id)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
              style={{ color: 'var(--color-label-primary)' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-fill-quaternary)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              }}
            >
              {/* Radio indicator */}
              <span
                className="flex-shrink-0 w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center"
                style={{
                  width: 18,
                  height: 18,
                  borderColor: isSelected ? 'var(--color-blue)' : 'var(--color-separator-opaque)',
                }}
              >
                {isSelected && (
                  <span className="rounded-full" style={{ width: 9, height: 9, background: 'var(--color-blue)' }} />
                )}
              </span>
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--color-separator)', margin: '0 0 4px' }} />

      {/* Direction options */}
      <div className="p-2 flex flex-col gap-1">
        {(
          [
            { id: 'asc', icon: '↑', label: 'A–Z' },
            { id: 'desc', icon: '↓', label: 'Z–A' },
          ] as const
        ).map((d) => {
          const isSelected = direction === d.id;
          return (
            <button
              key={d.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onDirectionChange(d.id)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl transition-colors"
              style={
                isSelected
                  ? {
                      background: 'var(--color-fill-secondary)',
                      color: 'var(--color-label-primary)',
                    }
                  : {
                      color: 'var(--color-label-primary)',
                    }
              }
              onMouseEnter={(e) => {
                if (!isSelected) {
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-fill-quaternary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                }
              }}
            >
              <span aria-hidden="true">{d.icon}</span>
              {d.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
