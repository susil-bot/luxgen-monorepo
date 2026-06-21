import { css } from '@emotion/css';

export const toolkitStyles = {
  root: css`
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

    .toolkit-item:hover:not(:disabled) {
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
  `,
};
