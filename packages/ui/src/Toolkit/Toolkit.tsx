import React, { type ReactNode } from 'react';
import { type BaseComponentProps } from '../types';
import { withSSR } from '../ssr';
import { getToolkitItemClassName, toolkitClasses, toolkitStyles } from './styles';
import { ToolkitTranslations } from './translations';

export interface ToolkitItem {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  destructive?: boolean;
}

export interface ToolkitProps extends BaseComponentProps {
  items: ToolkitItem[];
  /** Accessible name when no visible title */
  ariaLabel?: string;
  size?: 'small' | 'medium';
}

const ToolkitComponent: React.FC<ToolkitProps> = ({
  items,
  ariaLabel = ToolkitTranslations.en.defaultAriaLabel,
  size = 'medium',
  className = '',
  style,
  id,
  dataTestId,
}) => {
  return (
    <div className={toolkitStyles.root}>
      <div
        role="toolbar"
        aria-label={ariaLabel}
        id={id}
        data-testid={dataTestId}
        className={`${toolkitClasses.root} ${className}`.trim()}
        style={style}
      >
        {items.map((item) => {
          const isDisabled = Boolean(item.disabled);

          return (
            <button
              key={item.id}
              type="button"
              disabled={isDisabled}
              aria-pressed={item.active ?? false}
              aria-label={item.label}
              title={item.label}
              className={getToolkitItemClassName(item, size)}
              onClick={() => {
                if (isDisabled) return;
                item.onClick?.();
              }}
            >
              {item.icon ? (
                <span className={toolkitClasses.itemIcon} aria-hidden="true">
                  {item.icon}
                </span>
              ) : null}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const Toolkit = withSSR(ToolkitComponent);
