import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';

export interface ActionMenuItem {
  id: string;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  destructive?: boolean;
}

export interface ActionMenuProps {
  items: ActionMenuItem[];
  triggerLabel?: string;
  trigger?: ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

/** Compact overflow menu (⋯) for card headers and toolbars */
export function ActionMenu({
  items,
  triggerLabel = 'More actions',
  trigger,
  align = 'right',
  className = '',
}: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const [resolvedAlign, setResolvedAlign] = useState<'left' | 'right'>(align);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const menuId = useId();

  useLayoutEffect(() => {
    setResolvedAlign(align);
  }, [align]);

  useLayoutEffect(() => {
    if (!open || !rootRef.current) return;

    const margin = 16;
    const triggerRect = rootRef.current.getBoundingClientRect();
    const menuWidth = menuRef.current?.offsetWidth ?? 220;
    const viewportWidth = window.innerWidth;

    let next = align;
    if (align === 'right') {
      if (triggerRect.right - menuWidth < margin) next = 'left';
    } else if (triggerRect.left + menuWidth > viewportWidth - margin) {
      next = 'right';
    }
    setResolvedAlign(next);
  }, [open, align]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`relative inline-flex ${className}`}>
      <button
        type="button"
        className="w-8 h-8 rounded-lg flex items-center justify-center text-secondary hover:text-primary transition-colors"
        style={{ background: 'var(--color-fill-quaternary)' }}
        aria-label={triggerLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
      >
        {trigger ?? (
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden
            className="opacity-70"
          >
            <circle cx="3.5" cy="8" r="1.25" />
            <circle cx="8" cy="8" r="1.25" />
            <circle cx="12.5" cy="8" r="1.25" />
          </svg>
        )}
      </button>

      {open && (
        <ul
          ref={menuRef}
          id={menuId}
          role="menu"
          className={`absolute z-50 mt-1 min-w-[220px] max-w-[calc(100vw-2rem)] py-1 rounded-xl shadow-lg ios-card ${
            resolvedAlign === 'right' ? 'right-0' : 'left-0'
          }`}
          style={{ border: '1px solid var(--color-separator)' }}
        >
          {items.map((item) => (
            <li key={item.id} role="none">
              <button
                type="button"
                role="menuitem"
                disabled={item.disabled}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                  item.disabled
                    ? 'text-tertiary cursor-not-allowed'
                    : item.destructive
                      ? 'text-red-600 hover:bg-red-50'
                      : 'text-primary hover:bg-[var(--color-fill-quaternary)]'
                }`}
                onClick={() => {
                  if (item.disabled) return;
                  setOpen(false);
                  item.onClick?.();
                }}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
