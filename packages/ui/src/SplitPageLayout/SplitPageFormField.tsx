import type { ReactNode } from 'react';

export interface SplitPageFormFieldProps {
  id: string;
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}

/** Stacked label + control — avoids ios-form-group overflow clipping in modals and cards */
export function SplitPageFormField({ id, label, hint, children, className = '' }: SplitPageFormFieldProps) {
  return (
    <div className={`split-page-field ${className}`}>
      <label htmlFor={id} className="split-page-field__label">
        {label}
      </label>
      {hint && <p className="split-page-field__hint">{hint}</p>}
      {children}
    </div>
  );
}
