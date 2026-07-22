import { CustomerDetailSection } from '../../CustomerDetailSection';

export function CustomerNotesSection({
  notes,
  onNotesChange,
  saving,
}: {
  notes: string;
  onNotesChange?: (value: string) => void;
  saving?: boolean;
}) {
  return (
    <CustomerDetailSection title="Notes">
      {onNotesChange ? (
        <>
          <textarea
            className="ios-input min-h-[80px] text-sm"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Notes about this customer…"
          />
          {saving && <p className="text-xs text-tertiary mt-1">Saving…</p>}
        </>
      ) : (
        <p className="text-sm text-secondary">{notes || 'No notes'}</p>
      )}
    </CustomerDetailSection>
  );
}
