import { useEffect, useId, useRef, useState } from 'react';
import { PaletteCommand } from '../../lib/command-palette-commands';

export interface CommandPaletteOverlayProps {
  open: boolean;
  query: string;
  commands: PaletteCommand[];
  onQueryChange: (query: string) => void;
  onClose: () => void;
  onExecute: (command: PaletteCommand) => void;
}

/**
 * Keyboard-driven command palette (T-SRCH-03) — entered by typing `>` in global search.
 * Deliberately separate from `GlobalSearchOverlay` (packages/ui) rather than extending it:
 * this task's scope is apps/web only, and the shared overlay's result list has no roving
 * keyboard selection today (that's tracked separately as search a11y, T-SRCH-09).
 */
export function CommandPaletteOverlay({
  open,
  query,
  commands,
  onQueryChange,
  onClose,
  onExecute,
}: CommandPaletteOverlayProps) {
  const titleId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!open) return;
    setActiveIndex(0);
    const t = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    setActiveIndex((i) => Math.min(i, Math.max(commands.length - 1, 0)));
  }, [commands.length]);

  if (!open) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (commands.length ? (i + 1) % commands.length : 0));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (commands.length ? (i - 1 + commands.length) % commands.length : 0));
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      const command = commands[activeIndex];
      if (command) onExecute(command);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center px-4 pt-[10vh] sm:pt-[12vh]" role="presentation">
      <button
        type="button"
        aria-label="Close command palette"
        className="absolute inset-0 border-0 cursor-default"
        style={{ backgroundColor: 'var(--color-label-primary)', opacity: 0.45 }}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-lg overflow-hidden flex flex-col"
        style={{
          backgroundColor: 'var(--color-bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--color-separator)',
          maxHeight: 'min(420px, 70vh)',
        }}
        onKeyDown={handleKeyDown}
      >
        <h2 id={titleId} className="sr-only">
          Command palette
        </h2>
        <div className="flex items-center gap-2 px-4" style={{ height: 52, borderBottom: '1px solid var(--color-separator)' }}>
          <span aria-hidden style={{ color: 'var(--color-label-tertiary)' }}>
            &gt;
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Type a command…"
            aria-label="Type a command"
            aria-activedescendant={commands[activeIndex] ? `cmd-${commands[activeIndex].id}` : undefined}
            className="flex-1 min-w-0 bg-transparent outline-none text-base"
            style={{ color: 'var(--color-label-primary)' }}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <ul
          role="listbox"
          aria-label="Commands"
          className="list-none m-0 p-2 overflow-y-auto flex-1"
        >
          {commands.length === 0 ? (
            <li className="ios-empty-state py-8 px-4 text-center">
              <p className="text-sm font-medium" style={{ color: 'var(--color-label-primary)' }}>
                No commands found
              </p>
            </li>
          ) : (
            commands.map((command, index) => {
              const active = index === activeIndex;
              return (
                <li key={command.id} id={`cmd-${command.id}`} role="option" aria-selected={active}>
                  <button
                    type="button"
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => onExecute(command)}
                    className="w-full text-left flex items-center gap-3 px-2.5 py-2 rounded-md transition-colors"
                    style={{
                      color: 'var(--color-label-primary)',
                      backgroundColor: active ? 'var(--color-fill-tertiary)' : 'transparent',
                    }}
                  >
                    <span aria-hidden>{command.icon}</span>
                    <span className="flex-1 min-w-0 text-sm font-medium truncate">{command.label}</span>
                    <span className="text-xs" style={{ color: 'var(--color-label-tertiary)' }}>
                      {command.group}
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
        <div
          className="flex items-center px-4 text-[11px] gap-3"
          style={{ height: 30, backgroundColor: 'var(--color-bg-tertiary)', borderTop: '1px solid var(--color-separator)', color: 'var(--color-label-tertiary)' }}
        >
          <span>↑↓ Navigate</span>
          <span>↵ Run</span>
          <span>Esc Close</span>
        </div>
      </div>
    </div>
  );
}
