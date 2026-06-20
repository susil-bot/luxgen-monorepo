import { useEffect, useState } from 'react';

import type { FlowConfigField } from '../../../lib/automation-flow';
import styles from './TowerFlow.module.css';

function formatJsonConfigValue(value: unknown): string {
  if (value === undefined || value === null || value === '') return '';
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return '';
  }
}

export interface FlowConfigFieldInputProps {
  field: FlowConfigField;
  value: unknown;
  inputId: string;
  onChange: (value: unknown) => void;
}

export function FlowConfigFieldInput({ field, value, inputId, onChange }: FlowConfigFieldInputProps) {
  const [jsonDraft, setJsonDraft] = useState(() => formatJsonConfigValue(value ?? field.defaultValue));
  const [jsonError, setJsonError] = useState<string | null>(null);

  useEffect(() => {
    if (field.type !== 'json') return;
    setJsonDraft(formatJsonConfigValue(value ?? field.defaultValue));
    setJsonError(null);
  }, [field.type, field.defaultValue, field.key, value]);

  if (field.type === 'select' && field.options) {
    return (
      <select
        id={inputId}
        className={styles.configInput}
        value={String(value ?? field.defaultValue ?? '')}
        onChange={(e) => onChange(e.target.value)}
      >
        {field.options.map((opt: { value: string; label: string }) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === 'json') {
    return (
      <>
        <textarea
          id={inputId}
          className={`${styles.configInput} ${styles.configInputMultiline}`}
          rows={5}
          placeholder={field.placeholder}
          spellCheck={false}
          value={jsonDraft}
          onChange={(e) => {
            const text = e.target.value;
            setJsonDraft(text);
            const trimmed = text.trim();
            if (!trimmed) {
              setJsonError(null);
              onChange(undefined);
              return;
            }
            try {
              onChange(JSON.parse(trimmed));
              setJsonError(null);
            } catch {
              setJsonError('Enter valid JSON');
            }
          }}
          aria-invalid={jsonError ? true : undefined}
        />
        {jsonError ? <span className={styles.configFieldError}>{jsonError}</span> : null}
      </>
    );
  }

  return (
    <input
      id={inputId}
      className={styles.configInput}
      type={field.type === 'number' || field.type === 'duration' ? 'number' : 'text'}
      placeholder={field.placeholder}
      value={String(value ?? field.defaultValue ?? '')}
      onChange={(e) => {
        const raw = e.target.value;
        const nextValue = field.type === 'number' || field.type === 'duration' ? Number(raw) : raw;
        onChange(nextValue);
      }}
    />
  );
}
