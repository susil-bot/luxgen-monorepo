import {
  EntityFormPageLayout,
  SplitPageFormField,
  SplitPageHeader,
  SplitPageSection,
} from '@luxgen/ui';

export type CouponFormDiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING' | 'BUY_X_GET_Y';
export type CouponFormStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
export type CouponFormAppliesTo = 'ALL' | 'PRODUCTS' | 'COLLECTIONS';

export interface CouponFormValues {
  code: string;
  discountType: CouponFormDiscountType;
  /** UI: percent 0–100, or dollars for FIXED_AMOUNT, or 0 for FREE_SHIPPING. */
  discountValue: string;
  appliesTo: CouponFormAppliesTo;
  minPurchaseDollars: string;
  usageLimit: string;
  oneUsePerCustomer: boolean;
  startsAt: string;
  endsAt: string;
  noEndDate: boolean;
  status: CouponFormStatus;
}

export const emptyCouponForm = (): CouponFormValues => ({
  code: '',
  discountType: 'PERCENTAGE',
  discountValue: '20',
  appliesTo: 'ALL',
  minPurchaseDollars: '',
  usageLimit: '',
  oneUsePerCustomer: false,
  startsAt: '',
  endsAt: '',
  noEndDate: true,
  status: 'ACTIVE',
});

function toDateInput(value?: string | null): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

/** Map API coupon → form (fixed amount stored as cents). */
export function couponToFormValues(coupon: {
  code: string;
  discountType: CouponFormDiscountType;
  discountValue: number;
  appliesTo: CouponFormAppliesTo;
  minPurchaseCents?: number | null;
  usageLimit?: number | null;
  oneUsePerCustomer: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
  status: CouponFormStatus;
}): CouponFormValues {
  const discountValue =
    coupon.discountType === 'FIXED_AMOUNT' ? (coupon.discountValue / 100).toFixed(2) : String(coupon.discountValue);

  return {
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue,
    appliesTo: coupon.appliesTo,
    minPurchaseDollars:
      coupon.minPurchaseCents == null ? '' : (coupon.minPurchaseCents / 100).toFixed(2),
    usageLimit: coupon.usageLimit == null ? '' : String(coupon.usageLimit),
    oneUsePerCustomer: coupon.oneUsePerCustomer,
    startsAt: toDateInput(coupon.startsAt),
    endsAt: toDateInput(coupon.endsAt),
    noEndDate: !coupon.endsAt,
    status: coupon.status,
  };
}

export function couponFormToInput(values: CouponFormValues, tenantId: string) {
  const raw = Number(values.discountValue);
  const discountValue =
    values.discountType === 'FIXED_AMOUNT'
      ? Math.round((Number.isFinite(raw) ? raw : 0) * 100)
      : Number.isFinite(raw)
        ? raw
        : 0;

  const minPurchaseCents =
    values.minPurchaseDollars.trim() === ''
      ? null
      : Math.round(Number(values.minPurchaseDollars) * 100);
  const usageLimit = values.usageLimit.trim() === '' ? null : Number(values.usageLimit);

  return {
    tenantId,
    code: values.code.trim().toUpperCase(),
    discountType: values.discountType,
    discountValue,
    appliesTo: values.appliesTo,
    minPurchaseCents: minPurchaseCents != null && Number.isFinite(minPurchaseCents) ? minPurchaseCents : null,
    usageLimit: usageLimit != null && Number.isFinite(usageLimit) ? usageLimit : null,
    oneUsePerCustomer: values.oneUsePerCustomer,
    startsAt: values.startsAt ? new Date(values.startsAt).toISOString() : null,
    endsAt: values.noEndDate || !values.endsAt ? null : new Date(values.endsAt).toISOString(),
    status: values.status,
  };
}

function discountValueHint(type: CouponFormDiscountType): string {
  if (type === 'PERCENTAGE') return 'Percent off (0–100)';
  if (type === 'FIXED_AMOUNT') return 'Dollar amount off (saved as cents)';
  if (type === 'FREE_SHIPPING') return 'Value is always 0';
  return 'Configure buy/get quantities later';
}

export interface CouponFormProps {
  mode: 'create' | 'edit';
  values: CouponFormValues;
  saving?: boolean;
  onChange: (patch: Partial<CouponFormValues>) => void;
  onSave: () => void;
  backHref?: string;
}

export function CouponForm({
  mode,
  values,
  saving,
  onChange,
  onSave,
  backHref = '/coupons',
}: CouponFormProps) {
  const title = values.code.trim() || (mode === 'create' ? 'New coupon' : 'Edit coupon');
  const valueLabel =
    values.discountType === 'PERCENTAGE'
      ? 'Discount %'
      : values.discountType === 'FIXED_AMOUNT'
        ? 'Discount amount ($)'
        : 'Discount value';

  return (
    <EntityFormPageLayout
      header={
        <SplitPageHeader
          backHref={backHref}
          backLabel="Coupons"
          title={title}
          badges={
            <span className={`badge ${values.status === 'ACTIVE' ? 'badge-green' : 'badge-blue'}`}>
              {mode === 'create' ? 'New' : values.status}
            </span>
          }
          actions={
            <button type="button" className="ios-btn-primary text-sm" disabled={saving} onClick={onSave}>
              {saving ? 'Saving…' : mode === 'create' ? 'Create coupon' : 'Save coupon'}
            </button>
          }
        />
      }
      main={
        <>
          <SplitPageSection title="Coupon code & discount">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SplitPageFormField id="coupon-code" label="Coupon code" hint="Stored uppercase; unique per tenant">
                <input
                  id="coupon-code"
                  type="text"
                  className="ios-input w-full"
                  value={values.code}
                  onChange={(e) => onChange({ code: e.target.value.toUpperCase() })}
                  placeholder="WELCOME20"
                  autoComplete="off"
                  required
                />
              </SplitPageFormField>
              <SplitPageFormField id="coupon-status" label="Status">
                <select
                  id="coupon-status"
                  className="ios-input w-full"
                  value={values.status}
                  onChange={(e) => onChange({ status: e.target.value as CouponFormStatus })}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="EXPIRED">Expired</option>
                </select>
              </SplitPageFormField>
              <SplitPageFormField id="coupon-type" label="Discount type">
                <select
                  id="coupon-type"
                  className="ios-input w-full"
                  value={values.discountType}
                  onChange={(e) =>
                    onChange({
                      discountType: e.target.value as CouponFormDiscountType,
                      discountValue: e.target.value === 'FREE_SHIPPING' ? '0' : values.discountValue,
                    })
                  }
                >
                  <option value="PERCENTAGE">Percentage discount</option>
                  <option value="FIXED_AMOUNT">Fixed amount discount</option>
                  <option value="FREE_SHIPPING">Free shipping</option>
                  <option value="BUY_X_GET_Y">Buy X Get Y</option>
                </select>
              </SplitPageFormField>
              <SplitPageFormField id="coupon-value" label={valueLabel} hint={discountValueHint(values.discountType)}>
                <input
                  id="coupon-value"
                  type="number"
                  min={0}
                  step={values.discountType === 'PERCENTAGE' ? 1 : 0.01}
                  className="ios-input w-full"
                  value={values.discountValue}
                  onChange={(e) => onChange({ discountValue: e.target.value })}
                  disabled={values.discountType === 'FREE_SHIPPING'}
                />
              </SplitPageFormField>
            </div>
          </SplitPageSection>

          <SplitPageSection title="Applies to & requirements">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SplitPageFormField id="coupon-applies" label="Applies to">
                <select
                  id="coupon-applies"
                  className="ios-input w-full"
                  value={values.appliesTo}
                  onChange={(e) => onChange({ appliesTo: e.target.value as CouponFormAppliesTo })}
                >
                  <option value="ALL">All products</option>
                  <option value="PRODUCTS">Specific products</option>
                  <option value="COLLECTIONS">Specific collections</option>
                </select>
              </SplitPageFormField>
              <SplitPageFormField id="coupon-min" label="Minimum purchase ($)" hint="Optional">
                <input
                  id="coupon-min"
                  type="number"
                  min={0}
                  step={0.01}
                  className="ios-input w-full"
                  value={values.minPurchaseDollars}
                  onChange={(e) => onChange({ minPurchaseDollars: e.target.value })}
                  placeholder="No minimum"
                />
              </SplitPageFormField>
              <SplitPageFormField id="coupon-limit" label="Total usage limit" hint="Optional">
                <input
                  id="coupon-limit"
                  type="number"
                  min={1}
                  className="ios-input w-full"
                  value={values.usageLimit}
                  onChange={(e) => onChange({ usageLimit: e.target.value })}
                  placeholder="Unlimited"
                />
              </SplitPageFormField>
              <SplitPageFormField id="coupon-once" label="Per customer">
                <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-label-primary)' }}>
                  <input
                    id="coupon-once"
                    type="checkbox"
                    checked={values.oneUsePerCustomer}
                    onChange={(e) => onChange({ oneUsePerCustomer: e.target.checked })}
                  />
                  Limit to one use per customer
                </label>
              </SplitPageFormField>
            </div>
          </SplitPageSection>

          <SplitPageSection title="Active dates">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SplitPageFormField id="coupon-start" label="Start date">
                <input
                  id="coupon-start"
                  type="date"
                  className="ios-input w-full"
                  value={values.startsAt}
                  onChange={(e) => onChange({ startsAt: e.target.value })}
                />
              </SplitPageFormField>
              <SplitPageFormField id="coupon-end" label="End date">
                <input
                  id="coupon-end"
                  type="date"
                  className="ios-input w-full"
                  value={values.endsAt}
                  onChange={(e) => onChange({ endsAt: e.target.value, noEndDate: !e.target.value })}
                  disabled={values.noEndDate}
                />
                <label
                  className="mt-2 flex items-center gap-2 text-sm"
                  style={{ color: 'var(--color-label-secondary)' }}
                >
                  <input
                    type="checkbox"
                    checked={values.noEndDate}
                    onChange={(e) =>
                      onChange({ noEndDate: e.target.checked, endsAt: e.target.checked ? '' : values.endsAt })
                    }
                  />
                  No end date
                </label>
              </SplitPageFormField>
            </div>
          </SplitPageSection>
        </>
      }
    />
  );
}
