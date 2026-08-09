import { useState } from 'react';
import { SplitPageFormField } from './SplitPageLayout/SplitPageFormField';

export type TaskAutomationTriggerType =
  | 'task.created'
  | 'task.updated'
  | 'task.assigned'
  | 'task.status_changed'
  | 'task.completed'
  | 'task.due_soon'
  | 'task.overdue';

export interface TaskAutomationItem {
  id: string;
  name: string;
  enabled: boolean;
  trigger: { type: string; from?: string | null; to?: string | null; hours?: number | null };
  conditions?: unknown;
  actions?: Array<{ type: string; config?: Record<string, unknown> }>;
}

export interface TaskAutomationBuilderProps {
  automations?: TaskAutomationItem[];
  sampleTaskId?: string | null;
  busy?: boolean;
  onCreate: (input: {
    name: string;
    enabled: boolean;
    trigger: { type: TaskAutomationTriggerType };
    actions: Array<{ type: string; config?: Record<string, unknown> }>;
  }) => void;
  onToggle: (id: string, enabled: boolean) => void;
  onDelete: (id: string) => void;
  onTest?: (id: string) => void;
}

const TRIGGERS: { value: TaskAutomationTriggerType; label: string }[] = [
  { value: 'task.completed', label: 'Task completed' },
  { value: 'task.created', label: 'Task created' },
  { value: 'task.assigned', label: 'Task assigned' },
  { value: 'task.status_changed', label: 'Status changed' },
  { value: 'task.updated', label: 'Task updated' },
  { value: 'task.due_soon', label: 'Due soon' },
  { value: 'task.overdue', label: 'Overdue' },
];

const ACTIONS: { value: string; label: string }[] = [
  { value: 'notify_user', label: 'Notify assignee' },
  { value: 'create_task', label: 'Create follow-up task' },
  { value: 'add_comment', label: 'Add activity comment' },
  { value: 'set_priority', label: 'Set priority HIGH' },
];

function defaultActionConfig(type: string): Record<string, unknown> {
  switch (type) {
    case 'notify_user':
      return { title: 'Task update', body: '{{title}}' };
    case 'create_task':
      return { title: 'Review: {{title}}' };
    case 'add_comment':
      return { message: 'Automation: task event handled' };
    case 'set_priority':
      return { priority: 'HIGH' };
    default:
      return {};
  }
}

export function TaskAutomationBuilder({
  automations = [],
  sampleTaskId,
  busy,
  onCreate,
  onToggle,
  onDelete,
  onTest,
}: TaskAutomationBuilderProps) {
  const [name, setName] = useState('On complete → notify');
  const [trigger, setTrigger] = useState<TaskAutomationTriggerType>('task.completed');
  const [actionType, setActionType] = useState('notify_user');
  const [enabled, setEnabled] = useState(true);

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold" style={{ color: 'var(--color-label-secondary)' }}>
        Automations
      </h3>
      <p className="text-xs" style={{ color: 'var(--color-label-tertiary)' }}>
        WHEN / THEN rules run on the server with idempotent execution logs. AI drafting comes in a later phase.
      </p>

      {automations.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {automations.map((row) => (
            <li
              key={row.id}
              className="flex flex-col gap-1 rounded-lg px-3 py-2"
              style={{ background: 'var(--color-fill-quaternary)' }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium" style={{ color: 'var(--color-label-primary)' }}>
                  {row.name}
                </span>
                <label className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-label-secondary)' }}>
                  <input
                    type="checkbox"
                    checked={row.enabled}
                    disabled={busy}
                    onChange={(e) => onToggle(row.id, e.target.checked)}
                  />
                  On
                </label>
              </div>
              <div className="text-xs" style={{ color: 'var(--color-label-tertiary)' }}>
                WHEN {row.trigger?.type} → {(row.actions || []).map((a) => a.type).join(', ') || '—'}
              </div>
              <div className="flex gap-2">
                {onTest && sampleTaskId ? (
                  <button
                    type="button"
                    className="ios-btn-secondary text-xs"
                    disabled={busy}
                    onClick={() => onTest(row.id)}
                  >
                    Test
                  </button>
                ) : null}
                <button
                  type="button"
                  className="ios-btn-secondary text-xs"
                  disabled={busy}
                  onClick={() => onDelete(row.id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs" style={{ color: 'var(--color-label-tertiary)' }}>
          No automations yet for this list.
        </p>
      )}

      <SplitPageFormField id="auto-name" label="New rule name">
        <input
          id="auto-name"
          className="ios-input w-full"
          value={name}
          disabled={busy}
          onChange={(e) => setName(e.target.value)}
        />
      </SplitPageFormField>

      <SplitPageFormField id="auto-trigger" label="When">
        <select
          id="auto-trigger"
          className="ios-input w-full"
          value={trigger}
          disabled={busy}
          onChange={(e) => setTrigger(e.target.value as TaskAutomationTriggerType)}
        >
          {TRIGGERS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </SplitPageFormField>

      <SplitPageFormField id="auto-action" label="Then">
        <select
          id="auto-action"
          className="ios-input w-full"
          value={actionType}
          disabled={busy}
          onChange={(e) => setActionType(e.target.value)}
        >
          {ACTIONS.map((a) => (
            <option key={a.value} value={a.value}>
              {a.label}
            </option>
          ))}
        </select>
      </SplitPageFormField>

      <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-label-secondary)' }}>
        <input type="checkbox" checked={enabled} disabled={busy} onChange={(e) => setEnabled(e.target.checked)} />
        Enable immediately
      </label>

      <button
        type="button"
        className="ios-btn-secondary text-sm"
        disabled={busy || !name.trim()}
        onClick={() =>
          onCreate({
            name: name.trim(),
            enabled,
            trigger: { type: trigger },
            actions: [{ type: actionType, config: defaultActionConfig(actionType) }],
          })
        }
      >
        {busy ? 'Saving…' : 'Add automation'}
      </button>
    </div>
  );
}
