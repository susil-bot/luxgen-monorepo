import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from '@apollo/client';
import { AppLayout, SnackbarProvider, useSnackbar } from '@luxgen/ui';
import {
  CouponForm,
  couponFormToInput,
  couponToFormValues,
  emptyCouponForm,
  type CouponFormValues,
} from '../../../components/commerce/CouponForm';
import { GET_COUPON, UPDATE_COUPON } from '../../../graphql/queries/coupons';
import { PageLoadingState, PageEmptyState } from '../../../components/common/PageStates';
import { getTenantPageProps } from '../../../lib/tenant-page-props';
import { useCommercePageShell } from '../../../lib/commerce-page-shell';
import { useAppTenantId } from '../../../lib/app-layout-user';
import { getStoredUser } from '../../../lib/session';
import { isMongoObjectId } from '../../../lib/mongo-id';

interface Props {
  tenant: string;
}

function EditCouponContent({ tenant }: Props) {
  const router = useRouter();
  const id = typeof router.query.id === 'string' ? router.query.id : '';
  const { appLayoutProps } = useCommercePageShell();
  const { showSuccess, showError } = useSnackbar();
  const tenantId = useAppTenantId();
  const sessionUser = typeof window !== 'undefined' ? getStoredUser() : null;
  const queryTenantId = tenantId ?? sessionUser?.tenant.id;

  const [values, setValues] = useState<CouponFormValues>(emptyCouponForm);
  const [hydrated, setHydrated] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data, loading, error } = useQuery(GET_COUPON, {
    variables: { id, tenantId: queryTenantId },
    skip: !id || !queryTenantId,
    fetchPolicy: 'network-only',
  });

  const [updateCoupon] = useMutation(UPDATE_COUPON);

  useEffect(() => {
    const coupon = data?.coupon;
    if (!coupon || hydrated) return;
    setValues(couponToFormValues(coupon));
    setHydrated(true);
  }, [data?.coupon, hydrated]);

  const handleSave = async () => {
    if (!isMongoObjectId(queryTenantId) || !id) {
      showError('Tenant or coupon not ready — refresh and try again.');
      return;
    }
    if (!values.code.trim()) {
      showError('Coupon code is required.');
      return;
    }

    setSaving(true);
    try {
      const { tenantId: _t, ...input } = couponFormToInput(values, queryTenantId);
      const { data: updated } = await updateCoupon({
        variables: { id, tenantId: queryTenantId, input },
      });
      if (!updated?.updateCoupon?.id) {
        showError('Update failed — coupon not found.');
        return;
      }
      showSuccess('Coupon saved');
      void router.push('/coupons');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to save coupon.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Head>
        <title>Edit coupon — {tenant}</title>
      </Head>
      <AppLayout {...appLayoutProps}>
        {loading && !hydrated ? (
          <PageLoadingState label="Loading coupon…" />
        ) : error || (!loading && !data?.coupon) ? (
          <PageEmptyState
            title="Coupon not found"
            subtitle="It may have been deleted or belongs to another tenant."
            action={
              <button type="button" className="ios-btn-primary text-sm" onClick={() => void router.push('/coupons')}>
                Back to coupons
              </button>
            }
          />
        ) : (
          <CouponForm
            mode="edit"
            values={values}
            saving={saving}
            onChange={(patch) => setValues((prev) => ({ ...prev, ...patch }))}
            onSave={() => void handleSave()}
          />
        )}
      </AppLayout>
    </>
  );
}

export default function EditCouponPage(props: Props) {
  return (
    <SnackbarProvider position="top-right" maxSnackbars={3}>
      <EditCouponContent {...props} />
    </SnackbarProvider>
  );
}

export const getServerSideProps = getTenantPageProps;
