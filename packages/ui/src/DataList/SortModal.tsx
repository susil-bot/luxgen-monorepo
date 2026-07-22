import React, { useEffect, useRef, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import type { SortDirection, SortOption } from './types';

export interface SortModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Ref to the button that triggered the modal — used for desktop anchor positioning */
  anchorRef?: React.RefObject<HTMLElement | null>;
  options: SortOption[];
  selectedOption: string;
  direction: SortDirection;
  onOptionChange: (optionId: string) => void;
  onDirectionChange: (direction: SortDirection) => void;
  /** Module label shown in the heading, e.g. "Users", "Orders" */
  moduleLabel?: string;
}

interface AnchorPos {
  top: number;
  right: number;
}

function useAnchorPos(anchorRef: React.RefObject<HTMLElement | null> | undefined, isOpen: boolean): AnchorPos | null {
  const [pos, setPos] = useState<AnchorPos | null>(null);

  useEffect(() => {
    if (!isOpen || !anchorRef?.current) {
      setPos(null);
      return;
    }
    const el = anchorRef.current;
    const rect = el.getBoundingClientRect();
    setPos({
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right,
    });
  }, [isOpen, anchorRef]);

  return pos;
}

const DIRECTIONS: { id: SortDirection; icon: string; label: string }[] = [
  { id: 'asc', icon: '↑', label: 'A–Z' },
  { id: 'desc', icon: '↓', label: 'Z–A' },
];

export const SortModal: React.FC<SortModalProps> = ({
  isOpen,
  onClose,
  anchorRef,
  options,
  selectedOption,
  direction,
  onOptionChange,
  onDirectionChange,
  moduleLabel,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const anchorPos = useAnchorPos(anchorRef, isOpen);

  // Portal mount guard (SSR safe)
  useEffect(() => setMounted(true), []);

  // Drive enter/exit animation
  useEffect(() => {
    if (isOpen) {
      // Next tick so CSS transition fires
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  // Focus trap: move focus into panel when it opens
  useEffect(() => {
    if (isOpen && panelRef.current) {
      const first = panelRef.current.querySelector<HTMLElement>('[tabindex], button, input');
      first?.focus();
    }
  }, [isOpen]);

  // Close on Escape
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );
  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, handleKey]);

  if (!mounted) return null;

  // ── Determine layout: desktop popover vs mobile bottom-sheet ─────────────
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 640;
  const usePopover = isDesktop && anchorPos != null;

  // Panel content (shared between both layouts)
  const panel = (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label={moduleLabel ? `Sort ${moduleLabel}` : 'Sort options'}
      tabIndex={-1}
      className="outline-none"
      style={
        usePopover
          ? {
              position: 'fixed',
              top: anchorPos!.top,
              right: anchorPos!.right,
              width: 220,
              borderRadius: 'var(--radius-xl)',
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-separator)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 9999,
              transformOrigin: 'top right',
              transform: visible ? 'scale(1) translateY(0)' : 'scale(0.92) translateY(-6px)',
              opacity: visible ? 1 : 0,
              transition: 'transform 180ms cubic-bezier(0.25,0.46,0.45,0.94), opacity 140ms ease',
              pointerEvents: isOpen ? 'auto' : 'none',
              overflow: 'hidden',
            }
          : {
              // Bottom-sheet panel
              position: 'relative',
              background: 'var(--color-bg-secondary)',
              borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
              width: '100%',
              paddingBottom: 'env(safe-area-inset-bottom, 8px)',
              transform: visible ? 'translateY(0)' : 'translateY(100%)',
              transition: 'transform 280ms cubic-bezier(0.25,0.46,0.45,0.94)',
            }
      }
    >
      {/* Drag handle (bottom-sheet only) */}
      {!usePopover && (
        <div className="flex justify-center pt-3 pb-1">
          <div className="rounded-full" style={{ width: 36, height: 4, background: 'var(--color-fill-secondary)' }} />
        </div>
      )}

      {/* Heading */}
      <div
        className="px-4 pt-3 pb-2 text-xs font-semibold tracking-widest uppercase"
        style={{ color: 'var(--color-label-secondary)' }}
      >
        Sort by{moduleLabel ? ` — ${moduleLabel}` : ''}
      </div>

      {/* Sort field options */}
      <div role="radiogroup" aria-label="Sort field" className="pb-1">
        {options.map((opt) => {
          const isSelected = selectedOption === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => {
                onOptionChange(opt.id);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors focus:outline-none"
              style={{ color: 'var(--color-label-primary)' }}
              onFocus={(e) => {
                e.currentTarget.style.background = 'var(--color-fill-quaternary)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-fill-quaternary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              {/* Radio circle */}
              <span
                aria-hidden="true"
                className="flex-shrink-0 rounded-full border-2 flex items-center justify-center transition-colors"
                style={{
                  width: 20,
                  height: 20,
                  borderColor: isSelected ? 'var(--color-blue)' : 'var(--color-separator-opaque)',
                  transition: 'border-color 120ms ease',
                }}
              >
                {isSelected && (
                  <span
                    className="rounded-full"
                    style={{
                      width: 10,
                      height: 10,
                      background: 'var(--color-blue)',
                    }}
                  />
                )}
              </span>
              <span className="flex-1 text-left font-medium">{opt.label}</span>
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--color-separator)', margin: '4px 0' }} />

      {/* Direction toggle */}
      <div role="radiogroup" aria-label="Sort direction" className="flex flex-col gap-1 p-2">
        {DIRECTIONS.map((d) => {
          const isSelected = direction === d.id;
          return (
            <button
              key={d.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onDirectionChange(d.id)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold rounded-xl transition-all focus:outline-none focus:ring-2"
              style={
                isSelected
                  ? {
                      background: 'var(--color-fill-secondary)',
                      color: 'var(--color-label-primary)',
                    }
                  : {
                      background: 'transparent',
                      color: 'var(--color-label-primary)',
                    }
              }
              onMouseEnter={(e) => {
                if (!isSelected) e.currentTarget.style.background = 'var(--color-fill-quaternary)';
              }}
              onMouseLeave={(e) => {
                if (!isSelected) e.currentTarget.style.background = 'transparent';
              }}
            >
              <span
                aria-hidden="true"
                className="text-base leading-none"
                style={{ color: isSelected ? 'var(--color-blue)' : 'var(--color-label-secondary)' }}
              >
                {d.icon}
              </span>
              {d.label}
            </button>
          );
        })}
      </div>
    </div>
  );

  // ── Desktop: popover with click-outside backdrop ──────────────────────────
  if (usePopover) {
    return createPortal(
      <>
        {/* Invisible backdrop to catch click-outside */}
        {isOpen && <div style={{ position: 'fixed', inset: 0, zIndex: 9998 }} aria-hidden="true" onClick={onClose} />}
        {panel}
      </>,
      document.body,
    );
  }

  // ── Mobile: bottom-sheet with dark scrim ─────────────────────────────────
  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-end',
        pointerEvents: isOpen ? 'auto' : 'none',
      }}
    >
      {/* Scrim */}
      <div
        aria-hidden="true"
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.45)',
          opacity: visible ? 1 : 0,
          transition: 'opacity 220ms ease',
        }}
      />
      {/* Sheet */}
      <div style={{ position: 'relative', width: '100%' }}>{panel}</div>
    </div>,
    document.body,
  );
};
