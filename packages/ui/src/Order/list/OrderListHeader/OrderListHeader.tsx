import { OrderTranslations } from '../../translations';

export interface OrderListHeaderProps {
  onExport?: () => void;
  onCreateOrder?: () => void;
}

export function OrderListHeader({ onExport, onCreateOrder }: OrderListHeaderProps) {
  const t = OrderTranslations.en;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <h1 className="ios-large-title">{t.orders}</h1>
      <div className="flex items-center gap-2">
        <button type="button" className="ios-btn-secondary text-sm" disabled={!onExport} onClick={onExport}>
          {t.export}
        </button>
        <button type="button" className="ios-btn-primary text-sm" onClick={onCreateOrder} disabled={!onCreateOrder}>
          {t.createOrder}
        </button>
      </div>
    </div>
  );
}
