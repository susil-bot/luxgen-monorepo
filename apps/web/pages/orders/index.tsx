import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import {
  AppLayout,
  getDefaultLogo,
  getDefaultSidebarSections,
  OrderListView,
  buildOrdersFromEnrollments,
  filterOrdersByTab,
  SnackbarProvider,
  type OrderFilterTab,
} from '@luxgen/ui';
import { PageLoadingState } from '../../components/common/PageStates';
import { CreateOrderModal } from '../../components/commerce/CreateOrderModal';
import { createHandleUserAction } from '../../lib/user-actions';
import { useLayoutUser, useAppTenantId } from '../../lib/app-layout-user';
import { getStoredUser } from '../../lib/session';
import { GET_COURSES } from '../../graphql/queries/courses';
import { GET_USERS } from '../../graphql/queries/users';
import { getTenantPageProps } from '../../lib/tenant-page-props';
import { useAppLayoutHeader } from '../../lib/app-layout-header';

interface OrdersPageProps {
  tenant: string;
}

function OrdersPageContent({ tenant }: OrdersPageProps) {
  const router = useRouter();
  const handleUserAction = createHandleUserAction(router);
  const layoutUser = useLayoutUser();
  const tenantId = useAppTenantId();
  const sessionUser = typeof window !== 'undefined' ? getStoredUser() : null;
  const queryTenantId = tenantId ?? sessionUser?.tenant.id ?? tenant;
  const headerProps = useAppLayoutHeader();

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<OrderFilterTab>('all');
  const [showCreateOrder, setShowCreateOrder] = useState(false);

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

  useEffect(() => {
    const q = router.query.search;
    if (typeof q === 'string') setSearch(q);
  }, [router.query.search]);

  const learners = useMemo(
    () =>
      (usersData?.users ?? []).filter(
        (u: { role: string }) => u.role === 'STUDENT' || u.role === 'student',
      ),
    [usersData],
  );

  const orderStudents = useMemo(
    () =>
      learners.map((u: { id: string; email: string; firstName?: string; lastName?: string }) => ({
        id: u.id,
        email: u.email,
        name: `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email,
      })),
    [learners],
  );

  const allOrders = useMemo(
    () => buildOrdersFromEnrollments(coursesData?.courses, usersData?.users),
    [coursesData, usersData],
  );

  const tabCounts = useMemo(
    () => ({
      all: allOrders.length,
      unpaid: filterOrdersByTab(allOrders, 'unpaid').length,
      unfulfilled: filterOrdersByTab(allOrders, 'unfulfilled').length,
      open: filterOrdersByTab(allOrders, 'open').length,
      archived: filterOrdersByTab(allOrders, 'archived').length,
    }),
    [allOrders],
  );

  const orders = useMemo(() => {
    let rows = filterOrdersByTab(allOrders, activeTab);

    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerEmail.toLowerCase().includes(q) ||
          o.courseTitle.toLowerCase().includes(q),
      );
    }

    return rows;
  }, [allOrders, activeTab, search]);

  const loading = (coursesLoading || usersLoading) && allOrders.length === 0;

  return (
    <>
      <Head>
        <title>Orders — {tenant}</title>
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
          <PageLoadingState label="Loading orders…" />
        ) : (
          <OrderListView
            orders={orders}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            search={search}
            onSearchChange={setSearch}
            tabCounts={tabCounts}
            onCreateOrder={() => setShowCreateOrder(true)}
          />
        )}
      </AppLayout>

      {queryTenantId && (
        <CreateOrderModal
          isOpen={showCreateOrder}
          onClose={() => setShowCreateOrder(false)}
          tenantId={queryTenantId}
          courses={coursesData?.courses ?? []}
          students={orderStudents}
          onCreated={(orderId) => void router.push(`/orders/${encodeURIComponent(orderId)}`)}
        />
      )}
    </>
  );
}

export default function OrdersPage(props: OrdersPageProps) {
  return (
    <SnackbarProvider position="top-right" maxSnackbars={3}>
      <OrdersPageContent {...props} />
    </SnackbarProvider>
  );
}

export const getServerSideProps = getTenantPageProps;
