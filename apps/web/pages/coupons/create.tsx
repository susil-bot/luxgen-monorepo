import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useMutation } from '@apollo/client';
import { AppLayout, SnackbarProvider, useSnackbar } from '@luxgen/ui';
import {
  CouponForm,
  couponFormToInput,
  emptyCouponForm,
  type CouponFormValues,
} from '../../components/commerce/CouponForm';
import { CREATE_COUPON } from '../../graphql/queries/coupons';
import { getTenantPageProps } from '../../lib/tenant-page-props';
import { useCommercePageShell } from '../../lib/commerce-page-shell';
import { useAppTenantId } from '../../lib/app-layout-user';
import { getStoredUser } from '../../lib/session';
import { isMongoObjectId } from '../../lib/mongo-id';

interface Props {
  tenant: string;
}

function CreateCouponContent({ tenant }: Props) {
  const router = useRouter();
  const { appLayoutProps } = useCommercePageShell();
  const { showSuccess, showError } = useSnackbar();
  const tenantId = useAppTenantId();
  const sessionUser = typeof window !== 'undefined' ? getStoredUser() : null;
  const queryTenantId = tenantId ?? sessionUser?.tenant.id;

  const [values, setValues] = useState<CouponFormValues>(emptyCouponForm);
  const [saving, setSaving] = useState(false);
  const [createCoupon] = useMutation(CREATE_COUPON);

  const handleSave = async () => {
    if (!isMongoObjectId(queryTenantId)) {
      showError('Tenant not ready — refresh and try again.');
      return;
    }
    if (!values.code.trim()) {
      showError('Coupon code is required.');
      return;
    }

    setSaving(true);
    try {
      const input = couponFormToInput(values, queryTenantId);
      const { data } = await createCoupon({ variables: { input } });
      const id = data?.createCoupon?.id as string | undefined;
      if (!id) {
        showError('Create failed — no coupon id returned.');
        return;
      }
      showSuccess('Coupon created');
      void router.push('/coupons');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to create coupon.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Head>
        <title>Create coupon — {tenant}</title>
      </Head>
      <AppLayout {...appLayoutProps}>
        <CouponForm
          mode="create"
          values={values}
          saving={saving}
          onChange={(patch) => setValues((prev) => ({ ...prev, ...patch }))}
          onSave={() => void handleSave()}
        />
      </AppLayout>
    </>
  );
}

export default function CreateCouponPage(props: Props) {
  return (
    <SnackbarProvider position="top-right" maxSnackbars={3}>
      <CreateCouponContent {...props} />
    </SnackbarProvider>
  );
}

export const getServerSideProps = getTenantPageProps;
