import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import {
  AppLayout,
  OrderEditForm,
  SnackbarProvider,
  useSnackbar,
  buildOrdersFromEnrollments,
  findOrderDetail,
  type OrderPaymentStatus,
} from '@luxgen/ui';
import { PageLoadingState } from '../../../components/common/PageStates';
import { GET_COURSES } from '../../../graphql/queries/courses';
import { GET_USERS } from '../../../graphql/queries/users';
import { GET_ENROLLMENTS } from '../../../graphql/queries/enrollment';
import { getTenantPageProps } from '../../../lib/tenant-page-props';
import { useCommercePageShell } from '../../../lib/commerce-page-shell';
import { useTenantScope } from '../../../lib/use-tenant-scope';
import { useOrderEnrollment } from '../../../lib/use-order-enrollment';
import { useOrderActions } from '../../../lib/use-order-actions';
import { isMongoObjectId } from '../../../lib/mongo-id';

interface Props {
  tenant: string;
}

function EditOrderContent({ tenant }: Props) {
  const router = useRouter();
  const { appLayoutProps } = useCommercePageShell();
  const { showSuccess, showError } = useSnackbar();
  const { queryTenantId } = useTenantScope(tenant);

  const orderId = typeof router.query.id === 'string' ? router.query.id : '';

  const { data: coursesData, loading: coursesLoading } = useQuery(GET_COURSES, {
    variables: { tenantId: queryTenantId },
    skip: !queryTenantId,
    fetchPolicy: 'cache-and-network',
  });

  const { data: usersData, loading: usersLoading } = useQuery(GET_USERS, {
    variables: { tenantId: queryTenantId },
    skip: !queryTenantId,
    fetchPolicy: 'cache-and-network',
  });

  const { data: enrollmentsData, loading: enrollmentsLoading } = useQuery(GET_ENROLLMENTS, {
    variables: { tenantId: queryTenantId },
    skip: !isMongoObjectId(queryTenantId),
    fetchPolicy: 'cache-and-network',
  });

  const baseOrder = useMemo(() => {
    const orders = buildOrdersFromEnrollments(coursesData?.courses, usersData?.users, enrollmentsData?.enrollments);
    return findOrderDetail(orders, orderId, coursesData?.courses);
  }, [coursesData, usersData, enrollmentsData, orderId]);

  const { order: orderWithEnrollment } = useOrderEnrollment(baseOrder, queryTenantId);
  const order = orderWithEnrollment ?? baseOrder;

  const [notes, setNotes] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<OrderPaymentStatus>('pending');

  useEffect(() => {
    if (!order) return;
    setNotes(order.notes ?? '');
    setPaymentStatus(order.paymentStatus);
  }, [order]);

  const { saveOrder, saving } = useOrderActions(order, queryTenantId);

  const loading = !orderId || ((coursesLoading || usersLoading || enrollmentsLoading) && !order);

  const handleSave = async () => {
    if (!order) return;
    try {
      await saveOrder(notes, paymentStatus);
      showSuccess('Order saved');
      void router.push(`/orders/${orderId}`);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to save order');
    }
  };

  const isTerminal = order?.paymentStatus === 'voided' || order?.paymentStatus === 'refunded';

  return (
    <>
      <Head>
        <title>
          {order ? `Edit ${order.orderNumber}` : 'Edit order'} — {tenant}
        </title>
      </Head>

      <AppLayout {...appLayoutProps}>
        {loading ? (
          <PageLoadingState label="Loading order…" />
        ) : !order ? (
          <div className="max-w-2xl mx-auto px-4 py-16 text-center">
            <p className="text-secondary">Order not found</p>
            <Link href="/orders" className="ios-btn-primary mt-4 inline-block">
              Back to orders
            </Link>
          </div>
        ) : isTerminal ? (
          <div className="max-w-2xl mx-auto px-4 py-16 text-center">
            <p className="text-secondary">This order can no longer be edited.</p>
            <Link href={`/orders/${orderId}`} className="ios-btn-primary mt-4 inline-block">
              Back to order
            </Link>
          </div>
        ) : (
          <OrderEditForm
            order={order}
            notes={notes}
            paymentStatus={paymentStatus}
            saving={saving}
            backHref={`/orders/${orderId}`}
            onNotesChange={setNotes}
            onPaymentStatusChange={setPaymentStatus}
            onSave={() => void handleSave()}
          />
        )}
      </AppLayout>
    </>
  );
}

export default function EditOrderPage(props: Props) {
  return (
    <SnackbarProvider position="top-right" maxSnackbars={3}>
      <EditOrderContent {...props} />
    </SnackbarProvider>
  );
}

export const getServerSideProps = getTenantPageProps;
