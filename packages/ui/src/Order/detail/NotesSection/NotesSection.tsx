import { OrderDetailSection } from '../../OrderDetailSection';

export interface NotesSectionProps {
  notes: string;
  onNotesChange?: (value: string) => void;
  saving?: boolean;
}

export function NotesSection({ notes, onNotesChange, saving }: NotesSectionProps) {
  return (
    <OrderDetailSection title="Notes" hint="Shopify: staff notes · LuxGen: internal order notes">
      <textarea
        className="ios-input min-h-[100px]"
        value={notes}
        onChange={(e) => onNotesChange?.(e.target.value)}
        placeholder="Notes about this order…"
        disabled={!onNotesChange}
      />
      {onNotesChange && saving && <p className="text-xs text-tertiary">Saving…</p>}
      {!onNotesChange && <p className="text-xs text-tertiary">Sign in as staff to edit notes.</p>}
    </OrderDetailSection>
  );
}
