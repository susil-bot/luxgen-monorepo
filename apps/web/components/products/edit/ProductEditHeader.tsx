import Link from 'next/link';
import { statusBadgeClass, type ProductStatus } from '../../../lib/product-display';

interface ProductEditHeaderProps {
  title: string;
  status: ProductStatus;
  saving?: boolean;
  onSave: () => void;
  onDuplicate?: () => void;
}

export function ProductEditHeader({ title, status, saving, onSave, onDuplicate }: ProductEditHeaderProps) {
  const statusLabel =
    status === 'PUBLISHED' ? 'Active' : status === 'DRAFT' ? 'Draft' : status.charAt(0) + status.slice(1).toLowerCase();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <Link href="/products" className="ios-btn-plain text-sm flex-shrink-0">
          ← Products
        </Link>
        <div className="min-w-0 flex items-center gap-2 flex-wrap">
          <h1 className="text-lg sm:text-xl font-semibold text-primary truncate">{title || 'Untitled product'}</h1>
          <span className={`badge ${statusBadgeClass(status)} flex-shrink-0`}>{statusLabel}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {onDuplicate && (
          <button type="button" className="ios-btn-secondary text-sm" onClick={onDuplicate}>
            Duplicate
          </button>
        )}
        <button type="button" className="ios-btn-secondary text-sm" disabled>
          More actions ▾
        </button>
        <button type="button" className="ios-btn-primary text-sm" disabled={saving} onClick={onSave}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
}
