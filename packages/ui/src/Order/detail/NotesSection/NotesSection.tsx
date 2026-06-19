import { OrderDetailSection } from '../../OrderDetailSection';

export interface NotesSectionProps {
  notes: string;
  onNotesChange?: (value: string) => void;
}

export function NotesSection({ notes, onNotesChange }: NotesSectionProps) {
  return (
    <OrderDetailSection title="Notes" hint="Shopify: staff notes · LuxGen: internal order notes">
      <textarea
        className="ios-input min-h-[100px]"
        value={notes}
        onChange={(e) => onNotesChange?.(e.target.value)}
        placeholder="No notes from customer"
        disabled={!onNotesChange}
      />
      {!onNotesChange && (
        <p className="text-xs text-tertiary">Notes persistence — Phase 3</p>
      )}
    </OrderDetailSection>
  );
}
