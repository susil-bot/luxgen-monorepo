import { statusBadgeClass, statusDisplayLabel, type ProductStatus } from './fetcher';
import { ProductEditTranslations } from './translations';

export interface ProductEditHeaderProps {
  title: string;
  status: ProductStatus;
  saving?: boolean;
  backHref?: string;
  saveLabel?: string;
  savingLabel?: string;
  onSave: () => void;
  onDuplicate?: () => void;
}

export function ProductEditHeader({
  title,
  status,
  saving,
  backHref = '/products',
  saveLabel,
  savingLabel,
  onSave,
  onDuplicate,
}: ProductEditHeaderProps) {
  const t = ProductEditTranslations.en;
  const actionLabel = saving ? (savingLabel ?? t.saving) : (saveLabel ?? t.save);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <a href={backHref} className="ios-btn-plain text-sm flex-shrink-0">
          {t.backToProducts}
        </a>
        <div className="min-w-0 flex items-center gap-2 flex-wrap">
          <h1 className="text-lg sm:text-xl font-semibold text-primary truncate">{title || t.untitledProduct}</h1>
          <span className={`badge ${statusBadgeClass(status)} flex-shrink-0`}>{statusDisplayLabel(status)}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {onDuplicate && (
          <button type="button" className="ios-btn-secondary text-sm" onClick={onDuplicate}>
            {t.duplicate}
          </button>
        )}
        <button type="button" className="ios-btn-secondary text-sm" disabled>
          {t.moreActions}
        </button>
        <button type="button" className="ios-btn-primary text-sm" disabled={saving} onClick={onSave}>
          {actionLabel}
        </button>
      </div>
    </div>
  );
}
