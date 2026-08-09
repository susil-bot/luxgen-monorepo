import { useEffect, useState } from 'react';
import { SplitPageFormField } from './SplitPageLayout/SplitPageFormField';

export interface TaskFieldDefinitionItem {
  id: string;
  name: string;
  type: string;
  required: boolean;
  options: string[];
  helpText?: string | null;
}

export interface TaskTemplateItem {
  id: string;
  name: string;
  fields: TaskFieldDefinitionItem[];
}

export interface TaskFieldValueItem {
  fieldDefinitionId: string;
  value: unknown;
}

export interface RequiredFieldsEditorProps {
  templates: TaskTemplateItem[];
  templateId?: string | null;
  fields: TaskFieldDefinitionItem[];
  values: TaskFieldValueItem[];
  missingRequired?: string[];
  busy?: boolean;
  onApplyTemplate: (templateId: string) => void;
  onCreateQuickTemplate: (name: string, fieldName: string) => void;
  onChangeValue: (fieldId: string, value: unknown) => void;
}

function valueFor(values: TaskFieldValueItem[], fieldId: string): unknown {
  return values.find((v) => v.fieldDefinitionId === fieldId)?.value ?? '';
}

export function RequiredFieldsEditor({
  templates,
  templateId,
  fields,
  values,
  missingRequired = [],
  busy,
  onApplyTemplate,
  onCreateQuickTemplate,
  onChangeValue,
}: RequiredFieldsEditorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState(templateId ?? '');
  const [quickName, setQuickName] = useState('Default checklist');
  const [quickField, setQuickField] = useState('Outcome notes');

  useEffect(() => {
    setSelectedTemplate(templateId ?? '');
  }, [templateId]);

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold" style={{ color: 'var(--color-label-secondary)' }}>
        Required information
      </h3>

      {missingRequired.length > 0 ? (
        <p className="text-xs" style={{ color: 'var(--color-red)' }}>
          Complete before marking done: {missingRequired.join(', ')}
        </p>
      ) : null}

      <SplitPageFormField id="task-template" label="Template">
        <select
          id="task-template"
          className="ios-input w-full"
          value={selectedTemplate}
          disabled={busy}
          onChange={(e) => {
            setSelectedTemplate(e.target.value);
            if (e.target.value) onApplyTemplate(e.target.value);
          }}
        >
          <option value="">None</option>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </SplitPageFormField>

      {templates.length === 0 ? (
        <div className="flex flex-col gap-2">
          <p className="text-xs" style={{ color: 'var(--color-label-tertiary)' }}>
            No templates yet — create a quick one with a required text field.
          </p>
          <input
            className="ios-input w-full"
            value={quickName}
            onChange={(e) => setQuickName(e.target.value)}
            placeholder="Template name"
          />
          <input
            className="ios-input w-full"
            value={quickField}
            onChange={(e) => setQuickField(e.target.value)}
            placeholder="Required field name"
          />
          <button
            type="button"
            className="ios-btn-secondary text-sm"
            disabled={busy || !quickName.trim() || !quickField.trim()}
            onClick={() => onCreateQuickTemplate(quickName.trim(), quickField.trim())}
          >
            Create template
          </button>
        </div>
      ) : null}

      {fields.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--color-label-tertiary)' }}>
          Apply a template to collect required fields before completion.
        </p>
      ) : (
        fields.map((field) => {
          const current = valueFor(values, field.id);
          const label = `${field.name}${field.required ? ' *' : ''}`;
          if (field.type === 'checkbox') {
            return (
              <label key={field.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={current === true}
                  disabled={busy}
                  onChange={(e) => onChangeValue(field.id, e.target.checked)}
                />
                <span style={{ color: 'var(--color-label-primary)' }}>{label}</span>
              </label>
            );
          }
          if (field.type === 'select' && field.options.length > 0) {
            return (
              <SplitPageFormField key={field.id} id={`field-${field.id}`} label={label}>
                <select
                  id={`field-${field.id}`}
                  className="ios-input w-full"
                  value={typeof current === 'string' ? current : ''}
                  disabled={busy}
                  onChange={(e) => onChangeValue(field.id, e.target.value)}
                >
                  <option value="">Select…</option>
                  {field.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </SplitPageFormField>
            );
          }
          if (field.type === 'number' || field.type === 'currency') {
            return (
              <SplitPageFormField key={field.id} id={`field-${field.id}`} label={label}>
                <input
                  id={`field-${field.id}`}
                  type="number"
                  className="ios-input w-full"
                  value={current === '' || current == null ? '' : String(current)}
                  disabled={busy}
                  onChange={(e) => onChangeValue(field.id, e.target.value === '' ? null : Number(e.target.value))}
                />
              </SplitPageFormField>
            );
          }
          return (
            <SplitPageFormField key={field.id} id={`field-${field.id}`} label={label}>
              <input
                id={`field-${field.id}`}
                className="ios-input w-full"
                value={typeof current === 'string' || typeof current === 'number' ? String(current) : ''}
                disabled={busy}
                onChange={(e) => onChangeValue(field.id, e.target.value)}
                placeholder={field.helpText ?? undefined}
              />
            </SplitPageFormField>
          );
        })
      )}
    </div>
  );
}
