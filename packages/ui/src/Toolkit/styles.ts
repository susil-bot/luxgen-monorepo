import { css } from '@emotion/css';

/** Semantic class names for SSR HTML (plain CSS in `toolkitCssRules`). */
export const toolkitClasses = {
  root: 'toolkit',
  item: 'toolkit-item',
  itemSmall: 'toolkit-item-small',
  itemActive: 'toolkit-item-active',
  itemDestructive: 'toolkit-item-destructive',
  itemDisabled: 'toolkit-item-disabled',
  itemIcon: 'toolkit-item-icon',
} as const;

/** Client-side emotion classes — applied directly on the matching element. */
export const toolkitStyles = {
  root: css`
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
    padding: 4px;
    border-radius: 12px;
    background: var(--color-fill-quaternary);
    border: 1px solid var(--color-separator);
  `,
  item: css`
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

    &:hover:not(:disabled):not(.${toolkitClasses.itemActive}):not(.${toolkitClasses.itemDestructive}) {
      color: var(--color-text);
      background: var(--color-fill-tertiary);
    }

    &:focus {
      outline: none;
    }

    &:focus-visible {
      outline: 2px solid var(--color-blue, #007aff);
      outline-offset: 2px;
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
  `,
  itemSmall: css`
    padding: 6px 10px;
    font-size: 12px;
  `,
  itemActive: css`
    color: var(--color-text);
    background: var(--color-surface);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);

    &:hover:not(:disabled) {
      color: var(--color-text);
      background: var(--color-surface);
    }
  `,
  itemDestructive: css`
    color: var(--color-red, #dc2626);

    &:hover:not(:disabled) {
      background: #fef2f2;
    }
  `,
  itemDisabled: css`
    cursor: not-allowed;
    opacity: 0.5;
  `,
  itemIcon: css`
    display: inline-flex;
    flex-shrink: 0;
  `,
};

/**
 * Plain CSS for `fetchToolkitSSR` — mirrors `toolkitStyles` using semantic class names
 * so server-rendered HTML does not depend on emotion hash classes.
 */
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

/** Emotion class names for client-rendered toolkit buttons. */
export const getToolkitItemStyles = (
  item: { active?: boolean; destructive?: boolean; disabled?: boolean },
  size: 'small' | 'medium' = 'medium',
): string =>
  [
    toolkitStyles.item,
    size === 'small' ? toolkitStyles.itemSmall : '',
    item.active ? toolkitStyles.itemActive : '',
    item.destructive ? toolkitStyles.itemDestructive : '',
    item.disabled ? toolkitStyles.itemDisabled : '',
  ]
    .filter(Boolean)
    .join(' ');

/** Emotion + semantic class names for client-rendered toolkit buttons. */
export const getToolkitButtonClassName = (
  item: { active?: boolean; destructive?: boolean; disabled?: boolean },
  size: 'small' | 'medium' = 'medium',
): string => `${getToolkitItemStyles(item, size)} ${getToolkitItemClassName(item, size)}`.trim();
