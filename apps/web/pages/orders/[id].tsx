import { useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import {
  AppLayout,
  getDefaultLogo,
  getDefaultSidebarSections,
  OrderDetailView,
  buildOrdersFromEnrollments,
  findOrderDetail,
} from '@luxgen/ui';
import { PageLoadingState } from '../../components/common/PageStates';
import { createHandleUserAction } from '../../lib/user-actions';
import { useLayoutUser, useAppTenantId } from '../../lib/app-layout-user';
import { getStoredUser } from '../../lib/session';
import { GET_COURSES } from '../../graphql/queries/courses';
import { GET_USERS } from '../../graphql/queries/users';
import { getTenantPageProps } from '../../lib/tenant-page-props';
import { useAppLayoutHeader } from '../../lib/app-layout-header';
import { useActivityTimeline } from '../../lib/use-activity-timeline';
import { useOrderEnrollment } from '../../lib/use-order-enrollment';

interface Props {
  tenant: string;
}

function OrderDetailPageContent({ tenant }: Props) {
  const router = useRouter();
  const handleUserAction = createHandleUserAction(router);
  const layoutUser = useLayoutUser();
  const tenantId = useAppTenantId();
  const sessionUser = typeof window !== 'undefined' ? getStoredUser() : null;
  const queryTenantId = tenantId ?? sessionUser?.tenant.id ?? tenant;
  const headerProps = useAppLayoutHeader();

  const rawId = router.query.id;
  const orderId = typeof rawId === 'string' ? decodeURIComponent(rawId) : '';

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

  const baseOrder = useMemo(() => {
    const orders = buildOrdersFromEnrollments(coursesData?.courses, usersData?.users);
    return findOrderDetail(orders, orderId, coursesData?.courses);
  }, [coursesData, usersData, orderId]);

  const {
    order: orderWithEnrollment,
    notes,
    onNotesChange,
    savingNotes,
  } = useOrderEnrollment(baseOrder, queryTenantId);

  const order = orderWithEnrollment ?? baseOrder;
  const loading = !orderId || ((coursesLoading || usersLoading) && !order);

  const staffInitials =
    layoutUser?.name
      ?.split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2) ?? 'ST';

  const timeline = useActivityTimeline(queryTenantId, 'ORDER', orderId, staffInitials);

  return (
    <>
      <Head>
        <title>{order ? `${order.orderNumber} — Orders` : 'Order'} — {tenant}</title>
      </Head>

      <AppLayout
        sidebarSections={getDefaultSidebarSections()}
        user={layoutUser ?? undefined}
        logo={getDefaultLogo()}
        onUserAction={handleUserAction}
        {...headerProps}
        responsive
      >
        {loading ? (
          <PageLoadingState label="Loading order…" />
        ) : !order ? (
          <div className="max-w-2xl mx-auto px-4 py-16 text-center">
            <p className="text-secondary">Order not found</p>
            <Link href="/orders" className="ios-btn-primary mt-4 inline-block">
              Back to orders
            </Link>
          </div>
        ) : (
          <OrderDetailView
            order={order}
            timeline={timeline}
            notes={notes}
            onNotesChange={onNotesChange}
            savingNotes={savingNotes}
          />
        )}
      </AppLayout>
    </>
  );
}

export default function OrderDetailPage(props: Props) {
  return <OrderDetailPageContent {...props} />;
}

export const getServerSideProps = getTenantPageProps;
