import React from 'react';
import { BaseComponentProps, TenantTheme } from '../types';
import { withSSR } from '../ssr';
import { defaultTheme } from '../theme';

export interface FormProps extends BaseComponentProps {
  tenantTheme?: TenantTheme;
  onSubmit?: (e: React.FormEvent) => void;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  action?: string;
  encType?: 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain';
  noValidate?: boolean;
}

const FormComponent: React.FC<FormProps> = ({
  tenantTheme = defaultTheme,
  className = '',
  style,
  children,
  onSubmit,
  method = 'POST',
  action,
  encType = 'application/x-www-form-urlencoded',
  noValidate = false,
  ...props
}) => {
  const styles = {
    ...style,
    fontFamily: tenantTheme.fonts.primary,
    color: tenantTheme.colors.text,
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <form
      className={`form ${className}`}
      style={styles}
      onSubmit={handleSubmit}
      method={method}
      action={action}
      encType={encType}
      noValidate={noValidate}
      {...props}
    >
      {children}
    </form>
  );
};

export const Form = withSSR(FormComponent);
