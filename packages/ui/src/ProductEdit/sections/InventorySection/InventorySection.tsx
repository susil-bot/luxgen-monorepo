import type { ProductEditMeta } from '../../fetcher';
import { ProductEditSection } from '../../ProductEditSection';
import { inventorySectionDefaults } from './fetcher';

export interface InventorySectionProps {
  meta: ProductEditMeta;
  enrolled: number;
  onMetaChange: (patch: Partial<ProductEditMeta>) => void;
}

export function InventorySection({ meta, enrolled, onMetaChange }: InventorySectionProps) {
  const available = meta.maxEnrollments != null ? Math.max(0, meta.maxEnrollments - enrolled) : enrolled;

  return (
    <ProductEditSection title="Inventory" hint="Shopify: stock · LuxGen: enrollment seats">
      <label className="flex items-center gap-2 text-sm text-primary cursor-pointer mb-4">
        <input
          type="checkbox"
          checked={meta.trackInventory}
          onChange={(e) => onMetaChange({ trackInventory: e.target.checked })}
        />
        Inventory tracked
      </label>

      {meta.trackInventory && (
        <>
          <div className="ios-table-wrap mb-4">
            <table className="ios-table text-sm">
              <thead>
                <tr>
                  <th>Location</th>
                  <th>Unavailable</th>
                  <th>Committed</th>
                  <th>Available</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{inventorySectionDefaults.locationLabel}</td>
                  <td>0</td>
                  <td>{enrolled}</td>
                  <td>{meta.maxEnrollments != null ? available : '∞'}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="ios-form-group">
              <label htmlFor="sku">SKU</label>
              <input
                id="sku"
                className="ios-input"
                value={meta.sku}
                onChange={(e) => onMetaChange({ sku: e.target.value })}
              />
            </div>
            <div className="ios-form-group">
              <label htmlFor="barcode">Barcode (ISBN, UPC, etc.)</label>
              <input
                id="barcode"
                className="ios-input"
                value={meta.barcode}
                onChange={(e) => onMetaChange({ barcode: e.target.value })}
              />
            </div>
            <div className="ios-form-group">
              <label htmlFor="maxEnroll">Max enrollments</label>
              <input
                id="maxEnroll"
                type="number"
                min={0}
                className="ios-input"
                value={meta.maxEnrollments ?? ''}
                onChange={(e) =>
                  onMetaChange({
                    maxEnrollments: e.target.value === '' ? null : Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="ios-form-group flex items-end">
              <label className="flex items-center gap-2 text-sm text-secondary cursor-pointer">
                <input
                  type="checkbox"
                  checked={meta.sellWhenOutOfStock}
                  onChange={(e) => onMetaChange({ sellWhenOutOfStock: e.target.checked })}
                />
                Continue selling when out of stock
              </label>
            </div>
          </div>
        </>
      )}
    </ProductEditSection>
  );
}
