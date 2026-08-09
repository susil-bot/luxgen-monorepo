import { useState } from 'react';
import { SplitPageFormField } from './SplitPageLayout/SplitPageFormField';

export type ReminderOffsetPreset = 'M5' | 'M15' | 'M30' | 'H1' | 'D1' | 'W1' | 'CUSTOM';

export interface TaskReminderItem {
  id: string;
  taskId: string;
  fireAt: string;
  offsetPreset?: string | null;
  channelPrefs: string[];
  status: 'scheduled' | 'fired' | 'snoozed' | 'cancelled' | string;
  snoozeUntil?: string | null;
}

export interface ReminderEditorProps {
  reminders: TaskReminderItem[];
  hasDueDate: boolean;
  busy?: boolean;
  onCreate: (input: { offsetPreset: ReminderOffsetPreset; fireAt?: string | null }) => void;
  onSnooze: (id: string, untilIso: string) => void;
  onCancel: (id: string) => void;
}

const PRESET_LABELS: { value: ReminderOffsetPreset; label: string }[] = [
  { value: 'M5', label: '5 minutes before due' },
  { value: 'M15', label: '15 minutes before due' },
  { value: 'M30', label: '30 minutes before due' },
  { value: 'H1', label: '1 hour before due' },
  { value: 'D1', label: '1 day before due' },
  { value: 'W1', label: '1 week before due' },
  { value: 'CUSTOM', label: 'Custom date & time' },
];

function snoozeUntil(minutes: number): string {
  return new Date(Date.now() + minutes * 60 * 1000).toISOString();
}

function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocalValue(local: string): string {
  const d = new Date(local);
  return d.toISOString();
}

export function ReminderEditor({ reminders, hasDueDate, busy, onCreate, onSnooze, onCancel }: ReminderEditorProps) {
  const [preset, setPreset] = useState<ReminderOffsetPreset>(hasDueDate ? 'H1' : 'CUSTOM');
  const [customLocal, setCustomLocal] = useState('');

  const active = reminders.filter((r) => r.status === 'scheduled' || r.status === 'snoozed');
  const past = reminders.filter((r) => r.status === 'fired' || r.status === 'cancelled');

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold" style={{ color: 'var(--color-label-secondary)' }}>
        Reminders
      </h3>
      <p className="text-xs" style={{ color: 'var(--color-label-tertiary)' }}>
        Server-scheduled (UTC). Fires via job sweep — not browser timers.
      </p>

      <SplitPageFormField id="reminder-preset" label="When">
        <select
          id="reminder-preset"
          className="ios-input w-full"
          value={preset}
          onChange={(e) => setPreset(e.target.value as ReminderOffsetPreset)}
        >
          {PRESET_LABELS.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.value !== 'CUSTOM' && !hasDueDate}>
              {opt.label}
              {opt.value !== 'CUSTOM' && !hasDueDate ? ' (set due date first)' : ''}
            </option>
          ))}
        </select>
      </SplitPageFormField>

      {preset === 'CUSTOM' ? (
        <SplitPageFormField id="reminder-custom" label="Fire at (local)">
          <input
            id="reminder-custom"
            type="datetime-local"
            className="ios-input w-full"
            value={customLocal}
            onChange={(e) => setCustomLocal(e.target.value)}
          />
        </SplitPageFormField>
      ) : null}

      <button
        type="button"
        className="ios-btn-secondary text-sm"
        disabled={busy || (preset === 'CUSTOM' && !customLocal) || (preset !== 'CUSTOM' && !hasDueDate)}
        onClick={() =>
          onCreate({
            offsetPreset: preset,
            fireAt: preset === 'CUSTOM' && customLocal ? fromDatetimeLocalValue(customLocal) : null,
          })
        }
      >
        Add reminder
      </button>

      {active.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--color-label-tertiary)' }}>
          No active reminders.
        </p>
      ) : (
        <ul className="space-y-3">
          {active.map((r) => (
            <li key={r.id} className="rounded-lg p-3" style={{ background: 'var(--color-bg-tertiary)' }}>
              <div className="text-sm" style={{ color: 'var(--color-label-primary)' }}>
                {new Date(r.fireAt).toLocaleString()}
                {r.offsetPreset && r.offsetPreset !== 'CUSTOM' ? ` · ${r.offsetPreset}` : ''}
              </div>
              <div className="text-xs mb-2" style={{ color: 'var(--color-label-tertiary)' }}>
                {r.status}
                {r.snoozeUntil ? ` · snoozed until ${new Date(r.snoozeUntil).toLocaleString()}` : ''}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="ios-btn-plain text-xs"
                  disabled={busy}
                  onClick={() => onSnooze(r.id, snoozeUntil(15))}
                >
                  Snooze 15m
                </button>
                <button
                  type="button"
                  className="ios-btn-plain text-xs"
                  disabled={busy}
                  onClick={() => onSnooze(r.id, snoozeUntil(60))}
                >
                  Snooze 1h
                </button>
                <button
                  type="button"
                  className="ios-btn-plain text-xs"
                  disabled={busy}
                  onClick={() => onSnooze(r.id, snoozeUntil(24 * 60))}
                >
                  Snooze 1d
                </button>
                <button
                  type="button"
                  className="ios-btn-plain text-xs"
                  style={{ color: 'var(--color-red)' }}
                  disabled={busy}
                  onClick={() => onCancel(r.id)}
                >
                  Cancel
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {past.length > 0 ? (
        <details>
          <summary className="text-xs cursor-pointer" style={{ color: 'var(--color-label-tertiary)' }}>
            Past reminders ({past.length})
          </summary>
          <ul className="mt-2 space-y-1">
            {past.map((r) => (
              <li key={r.id} className="text-xs" style={{ color: 'var(--color-label-tertiary)' }}>
                {r.status} · {toDatetimeLocalValue(r.fireAt) || r.fireAt}
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}
