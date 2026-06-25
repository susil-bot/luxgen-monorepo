import { css } from '@emotion/css';

/** Semantic class names shared by the React component and SSR HTML. */
export const toolkitClasses = {
  root: 'toolkit',
  item: 'toolkit-item',
  itemSmall: 'toolkit-item-small',
  itemActive: 'toolkit-item-active',
  itemDestructive: 'toolkit-item-destructive',
  itemDisabled: 'toolkit-item-disabled',
  itemIcon: 'toolkit-item-icon',
} as const;

/** Plain CSS used by fetchToolkitSSR and scoped client injection via emotion. */
export const toolkitCssRules = `
  .toolkit {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
    padding: 4px;
    border-radius: 12px;
    background: var(--color-fill-quaternary);
    border: 1px solid var(--color-separator);
  }

  .toolkit-item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    color: var(--color-text-secondary);
    background: transparent;
    border: none;
    cursor: pointer;
    transition:
      color 0.15s ease,
      background 0.15s ease;
  }

  .toolkit-item-small {
    padding: 6px 10px;
    font-size: 12px;
  }

  .toolkit-item:hover:not(:disabled):not(.toolkit-item-active):not(.toolkit-item-destructive) {
    color: var(--color-text);
    background: var(--color-fill-tertiary);
  }

  .toolkit-item-active {
    color: var(--color-text);
    background: var(--color-surface);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  }

  .toolkit-item-destructive {
    color: var(--color-red, #dc2626);
  }

  .toolkit-item-destructive:hover:not(:disabled) {
    background: #fef2f2;
  }

  .toolkit-item:disabled,
  .toolkit-item.toolkit-item-disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .toolkit-item:focus {
    outline: none;
  }

  .toolkit-item:focus-visible {
    outline: 2px solid var(--color-blue, #007aff);
    outline-offset: 2px;
  }

  .toolkit-item-icon {
    display: inline-flex;
    flex-shrink: 0;
  }
`;

export const toolkitStyles = {
  root: css(toolkitCssRules),
};

export const getToolkitSSRStyles = (): string => toolkitCssRules;

export const getToolkitItemClassName = (
  item: { active?: boolean; destructive?: boolean; disabled?: boolean },
  size: 'small' | 'medium' = 'medium',
): string =>
  [
    toolkitClasses.item,
    size === 'small' ? toolkitClasses.itemSmall : '',
    item.active ? toolkitClasses.itemActive : '',
    item.destructive ? toolkitClasses.itemDestructive : '',
    item.disabled ? toolkitClasses.itemDisabled : '',
  ]
    .filter(Boolean)
    .join(' ');
