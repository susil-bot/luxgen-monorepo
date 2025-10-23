import React, { useState } from 'react';
import { BaseComponentProps, TenantTheme } from '../types';
import { withSSR } from '../ssr';
import { defaultTheme } from '../theme';

export interface AccordionItem {
  id: string;
  title: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
  defaultOpen?: boolean;
}

export interface AccordionProps extends BaseComponentProps {
  tenantTheme?: TenantTheme;
  items: AccordionItem[];
  allowMultiple?: boolean;
  allowNone?: boolean;
  variant?: 'default' | 'bordered' | 'filled' | 'minimal';
  size?: 'small' | 'medium' | 'large';
  iconPosition?: 'left' | 'right';
  showIcon?: boolean;
  onToggle?: (itemId: string, isOpen: boolean) => void;
  onItemClick?: (item: AccordionItem, index: number) => void;
}

const AccordionComponent: React.FC<AccordionProps> = ({
  tenantTheme = defaultTheme,
  className = '',
  style,
  items,
  allowMultiple = false,
  allowNone = true,
  variant = 'default',
  size = 'medium',
  iconPosition = 'right',
  showIcon = true,
  onToggle,
  onItemClick,
  ...props
}) => {
  const [openItems, setOpenItems] = useState<Set<string>>(
    new Set(items.filter(item => item.defaultOpen).map(item => item.id))
  );

  const handleToggle = (itemId: string) => {
    const isCurrentlyOpen = openItems.has(itemId);
    const newOpenItems = new Set(openItems);

    if (isCurrentlyOpen) {
      if (allowNone) {
        newOpenItems.delete(itemId);
      }
    } else {
      if (!allowMultiple) {
        newOpenItems.clear();
      }
      newOpenItems.add(itemId);
    }

    setOpenItems(newOpenItems);
    onToggle?.(itemId, !isCurrentlyOpen);
  };

  const handleItemClick = (item: AccordionItem, index: number) => {
    if (!item.disabled) {
      onItemClick?.(item, index);
    }
  };

  const getVariantStyles = () => {
    const variantStyles = {
      default: {
        border: `1px solid ${tenantTheme.colors.border}`,
        borderRadius: '0.375rem',
        overflow: 'hidden',
      },
      bordered: {
        border: `2px solid ${tenantTheme.colors.border}`,
        borderRadius: '0.5rem',
        overflow: 'hidden',
      },
      filled: {
        backgroundColor: tenantTheme.colors.backgroundSecondary,
        borderRadius: '0.375rem',
        overflow: 'hidden',
      },
      minimal: {
        border: 'none',
        borderRadius: '0',
        overflow: 'visible',
      },
    };
    
    return variantStyles[variant];
  };

  const getSizeStyles = () => {
    const sizeStyles = {
      small: {
        fontSize: '0.875rem',
        padding: '0.75rem 1rem',
      },
      medium: {
        fontSize: '1rem',
        padding: '1rem 1.25rem',
      },
      large: {
        fontSize: '1.125rem',
        padding: '1.25rem 1.5rem',
      },
    };
    
    return sizeStyles[size];
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  const styles = {
    ...style,
    fontFamily: tenantTheme.fonts.primary,
    color: tenantTheme.colors.text,
    ...variantStyles,
  };

  return (
    <div
      className={`accordion accordion-${variant} accordion-${size} ${className}`}
      style={styles}
      {...props}
    >
      {items.map((item, index) => {
        const isOpen = openItems.has(item.id);
        const isDisabled = item.disabled;

        return (
          <div
            key={item.id}
            className={`accordion-item ${isOpen ? 'open' : ''} ${isDisabled ? 'disabled' : ''}`}
            style={{
              borderBottom: index < items.length - 1 ? `1px solid ${tenantTheme.colors.border}` : 'none',
            }}
          >
            <button
              className="accordion-trigger"
              onClick={() => handleToggle(item.id)}
              disabled={isDisabled}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'none',
                border: 'none',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                padding: sizeStyles.padding,
                textAlign: 'left',
                fontFamily: tenantTheme.fonts.primary,
                fontSize: sizeStyles.fontSize,
                color: isDisabled ? tenantTheme.colors.textSecondary : tenantTheme.colors.text,
                transition: 'all 0.2s ease',
                ...(isOpen && {
                  backgroundColor: tenantTheme.colors.backgroundSecondary,
                }),
              }}
            >
              <span className="accordion-title" style={{ flex: 1 }}>
                {item.title}
              </span>
              
              {showIcon && (
                <span
                  className="accordion-icon"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '1.5rem',
                    height: '1.5rem',
                    fontSize: '1rem',
                    color: tenantTheme.colors.textSecondary,
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                    order: iconPosition === 'left' ? -1 : 1,
                    marginLeft: iconPosition === 'left' ? 0 : '0.5rem',
                    marginRight: iconPosition === 'right' ? 0 : '0.5rem',
                  }}
                >
                  ▼
                </span>
              )}
            </button>

            <div
              className="accordion-content"
              style={{
                maxHeight: isOpen ? '1000px' : '0',
                overflow: 'hidden',
                transition: 'max-height 0.3s ease',
                backgroundColor: tenantTheme.colors.background,
              }}
            >
              <div
                className="accordion-content-inner"
                style={{
                  padding: sizeStyles.padding,
                  borderTop: isOpen ? `1px solid ${tenantTheme.colors.border}` : 'none',
                }}
                onClick={() => handleItemClick(item, index)}
              >
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const Accordion = withSSR(AccordionComponent);
