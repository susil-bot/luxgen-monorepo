import { useEffect, useState } from 'react';
import { SplitPageFormField } from './SplitPageLayout/SplitPageFormField';

export type RecurrenceFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
export type IncompleteOccurrenceBehavior = 'create_anyway' | 'skip' | 'after_complete';

export interface TaskRecurrenceItem {
  id: string;
  frequency: RecurrenceFrequency | string;
  interval: number;
  incompleteBehavior: IncompleteOccurrenceBehavior | string;
  timezone: string;
  nextFireAt: string;
  enabled: boolean;
  endAt?: string | null;
}

export interface RecurrenceEditorProps {
  recurrence?: TaskRecurrenceItem | null;
  busy?: boolean;
  onSave: (input: {
    frequency: RecurrenceFrequency;
    interval: number;
    incompleteBehavior: IncompleteOccurrenceBehavior;
    nextFireAt?: string | null;
    enabled: boolean;
  }) => void;
  onDisable: () => void;
}

function toDatetimeLocal(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function RecurrenceEditor({ recurrence, busy, onSave, onDisable }: RecurrenceEditorProps) {
  const [frequency, setFrequency] = useState<RecurrenceFrequency>('WEEKLY');
  const [interval, setInterval] = useState(1);
  const [behavior, setBehavior] = useState<IncompleteOccurrenceBehavior>('create_anyway');
  const [nextLocal, setNextLocal] = useState('');
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    if (!recurrence) {
      setFrequency('WEEKLY');
      setInterval(1);
      setBehavior('create_anyway');
      setNextLocal('');
      setEnabled(true);
      return;
    }
    setFrequency((recurrence.frequency as RecurrenceFrequency) || 'WEEKLY');
    setInterval(recurrence.interval || 1);
    setBehavior((recurrence.incompleteBehavior as IncompleteOccurrenceBehavior) || 'create_anyway');
    setNextLocal(toDatetimeLocal(recurrence.nextFireAt));
    setEnabled(recurrence.enabled);
  }, [recurrence]);

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold" style={{ color: 'var(--color-label-secondary)' }}>
        Recurrence
      </h3>
      <p className="text-xs" style={{ color: 'var(--color-label-tertiary)' }}>
        Server job creates occurrences (no browser timers). Deduped by series + date key.
      </p>

      <SplitPageFormField id="rec-freq" label="Frequency">
        <select
          id="rec-freq"
          className="ios-input w-full"
          value={frequency}
          disabled={busy}
          onChange={(e) => setFrequency(e.target.value as RecurrenceFrequency)}
        >
          <option value="DAILY">Daily</option>
          <option value="WEEKLY">Weekly</option>
          <option value="MONTHLY">Monthly</option>
          <option value="YEARLY">Yearly</option>
        </select>
      </SplitPageFormField>

      <SplitPageFormField id="rec-interval" label="Every">
        <input
          id="rec-interval"
          type="number"
          min={1}
          className="ios-input w-full"
          value={interval}
          disabled={busy}
          onChange={(e) => setInterval(Math.max(1, Number(e.target.value) || 1))}
        />
      </SplitPageFormField>

      <SplitPageFormField id="rec-behavior" label="If previous incomplete">
        <select
          id="rec-behavior"
          className="ios-input w-full"
          value={behavior}
          disabled={busy}
          onChange={(e) => setBehavior(e.target.value as IncompleteOccurrenceBehavior)}
        >
          <option value="create_anyway">Create anyway</option>
          <option value="skip">Skip this fire</option>
          <option value="after_complete">Wait until complete</option>
        </select>
      </SplitPageFormField>

      <SplitPageFormField id="rec-next" label="Next fire (local)">
        <input
          id="rec-next"
          type="datetime-local"
          className="ios-input w-full"
          value={nextLocal}
          disabled={busy}
          onChange={(e) => setNextLocal(e.target.value)}
        />
      </SplitPageFormField>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={enabled} disabled={busy} onChange={(e) => setEnabled(e.target.checked)} />
        <span style={{ color: 'var(--color-label-primary)' }}>Enabled</span>
      </label>

      {recurrence ? (
        <p className="text-xs" style={{ color: 'var(--color-label-tertiary)' }}>
          Next UTC: {new Date(recurrence.nextFireAt).toLocaleString()} · {recurrence.enabled ? 'on' : 'off'}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="ios-btn-secondary text-sm"
          disabled={busy}
          onClick={() =>
            onSave({
              frequency,
              interval,
              incompleteBehavior: behavior,
              nextFireAt: nextLocal ? new Date(nextLocal).toISOString() : null,
              enabled,
            })
          }
        >
          Save recurrence
        </button>
        {recurrence?.enabled ? (
          <button type="button" className="ios-btn-plain text-sm" disabled={busy} onClick={onDisable}>
            Disable
          </button>
        ) : null}
      </div>
    </div>
  );
}
