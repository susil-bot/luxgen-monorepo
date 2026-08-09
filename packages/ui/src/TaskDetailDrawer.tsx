import { useEffect, useState } from 'react';
import type { TodoItem, TodoTaskPriority, TodoTaskStatus } from './Todo';
import { SplitPageFormField } from './SplitPageLayout/SplitPageFormField';
import { ReminderEditor, type ReminderOffsetPreset, type TaskReminderItem } from './ReminderEditor';
import {
  RequiredFieldsEditor,
  type TaskFieldDefinitionItem,
  type TaskFieldValueItem,
  type TaskTemplateItem,
} from './RequiredFieldsEditor';

export interface TaskActivityItem {
  id: string;
  message: string;
  actorName?: string | null;
  createdAt: string;
  source: string;
}

export interface TaskDetailDrawerProps {
  open: boolean;
  task: TodoItem | null;
  activity?: TaskActivityItem[];
  reminders?: TaskReminderItem[];
  templates?: TaskTemplateItem[];
  fieldDefinitions?: TaskFieldDefinitionItem[];
  fieldValues?: TaskFieldValueItem[];
  missingRequired?: string[];
  saving?: boolean;
  reminderBusy?: boolean;
  fieldsBusy?: boolean;
  onClose: () => void;
  onSave: (input: {
    title: string;
    notes?: string | null;
    status: TodoTaskStatus;
    priority: TodoTaskPriority;
    teamId?: string | null;
    assigneeId?: string | null;
    startDate?: string | null;
    dueDate?: string | null;
  }) => void;
  onCreateReminder?: (input: { offsetPreset: ReminderOffsetPreset; fireAt?: string | null }) => void;
  onSnoozeReminder?: (id: string, untilIso: string) => void;
  onCancelReminder?: (id: string) => void;
  onApplyTemplate?: (templateId: string) => void;
  onCreateQuickTemplate?: (name: string, fieldName: string) => void;
  onChangeFieldValue?: (fieldId: string, value: unknown) => void;
}

function toDateInput(value?: string | null): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

export function TaskDetailDrawer({
  open,
  task,
  activity = [],
  reminders = [],
  templates = [],
  fieldDefinitions = [],
  fieldValues = [],
  missingRequired = [],
  saving,
  reminderBusy,
  fieldsBusy,
  onClose,
  onSave,
  onCreateReminder,
  onSnoozeReminder,
  onCancelReminder,
  onApplyTemplate,
  onCreateQuickTemplate,
  onChangeFieldValue,
}: TaskDetailDrawerProps) {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<TodoTaskStatus>('OPEN');
  const [priority, setPriority] = useState<TodoTaskPriority>('MEDIUM');
  const [teamId, setTeamId] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (!task) return;
    setTitle(task.title);
    setNotes(task.notes ?? '');
    setStatus(task.status === 'TODO' ? 'OPEN' : task.status === 'DONE' ? 'COMPLETED' : task.status);
    setPriority(task.priority ?? 'MEDIUM');
    setTeamId(task.teamId ?? '');
    setAssigneeId(task.assigneeId ?? '');
    setStartDate(toDateInput(task.startDate));
    setDueDate(toDateInput(task.dueDate));
  }, [task]);

  if (!open || !task) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={task.title}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        display: 'flex',
        justifyContent: 'flex-end',
        background: 'color-mix(in srgb, var(--color-label-primary) 35%, transparent)',
      }}
      onClick={onClose}
    >
      <aside
        className="ios-card"
        style={{
          width: 'min(420px, 100%)',
          height: '100%',
          borderRadius: 0,
          overflow: 'auto',
          padding: '1.25rem',
          background: 'var(--color-bg-secondary)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <h2 className="ios-large-title" style={{ fontSize: '1.5rem' }}>
            {title || 'Task'}
          </h2>
          <button type="button" className="ios-btn-plain text-sm" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <SplitPageFormField id="task-title" label="Title">
            <input
              id="task-title"
              className="ios-input w-full"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </SplitPageFormField>

          <SplitPageFormField id="task-status" label="Status">
            <select
              id="task-status"
              className="ios-input w-full"
              value={status}
              onChange={(e) => setStatus(e.target.value as TodoTaskStatus)}
            >
              <option value="DRAFT">Draft</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="BLOCKED">Blocked</option>
              <option value="READY_FOR_REVIEW">Ready for review</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </SplitPageFormField>

          <SplitPageFormField id="task-notes" label="Description">
            <textarea
              id="task-notes"
              className="ios-input w-full"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </SplitPageFormField>

          <h3 className="text-sm font-semibold" style={{ color: 'var(--color-label-secondary)' }}>
            Assignment
          </h3>
          <SplitPageFormField id="task-team" label="Team ID">
            <input
              id="task-team"
              className="ios-input w-full"
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              placeholder="Optional"
            />
          </SplitPageFormField>
          <SplitPageFormField id="task-assignee" label="Assignee ID">
            <input
              id="task-assignee"
              className="ios-input w-full"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              placeholder="Optional"
            />
          </SplitPageFormField>
          <SplitPageFormField id="task-priority" label="Priority">
            <select
              id="task-priority"
              className="ios-input w-full"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TodoTaskPriority)}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </SplitPageFormField>

          <h3 className="text-sm font-semibold" style={{ color: 'var(--color-label-secondary)' }}>
            Schedule
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <SplitPageFormField id="task-start" label="Start">
              <input
                id="task-start"
                type="date"
                className="ios-input w-full"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </SplitPageFormField>
            <SplitPageFormField id="task-due" label="Due">
              <input
                id="task-due"
                type="date"
                className="ios-input w-full"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </SplitPageFormField>
          </div>

          {onApplyTemplate && onCreateQuickTemplate && onChangeFieldValue ? (
            <RequiredFieldsEditor
              templates={templates}
              templateId={task.templateId}
              fields={fieldDefinitions}
              values={fieldValues}
              missingRequired={missingRequired}
              busy={fieldsBusy}
              onApplyTemplate={onApplyTemplate}
              onCreateQuickTemplate={onCreateQuickTemplate}
              onChangeValue={onChangeFieldValue}
            />
          ) : null}

          {onCreateReminder && onSnoozeReminder && onCancelReminder ? (
            <ReminderEditor
              reminders={reminders}
              hasDueDate={Boolean(dueDate || task.dueDate)}
              busy={reminderBusy}
              onCreate={onCreateReminder}
              onSnooze={onSnoozeReminder}
              onCancel={onCancelReminder}
            />
          ) : null}

          <button
            type="button"
            className="ios-btn-primary text-sm"
            disabled={saving || !title.trim()}
            onClick={() =>
              onSave({
                title: title.trim(),
                notes: notes.trim() || null,
                status,
                priority,
                teamId: teamId.trim() || null,
                assigneeId: assigneeId.trim() || null,
                startDate: startDate || null,
                dueDate: dueDate || null,
              })
            }
          >
            {saving ? 'Saving…' : 'Save task'}
          </button>

          <h3 className="text-sm font-semibold mt-2" style={{ color: 'var(--color-label-secondary)' }}>
            Activity
          </h3>
          {activity.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--color-label-tertiary)' }}>
              No activity yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {activity.map((row) => (
                <li key={row.id} className="text-sm" style={{ color: 'var(--color-label-primary)' }}>
                  <div>{row.message}</div>
                  <div className="text-xs" style={{ color: 'var(--color-label-tertiary)' }}>
                    {[row.actorName, new Date(row.createdAt).toLocaleString()].filter(Boolean).join(' · ')}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}
