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
import { PageLoadingState, PageEmptyState } from '../../components/common/PageStates';
import { createHandleUserAction } from '../../lib/user-actions';
import { useLayoutUser } from '../../lib/app-layout-user';
import { useTenantScope } from '../../lib/use-tenant-scope';
import { GET_COURSES } from '../../graphql/queries/courses';
import { GET_USERS } from '../../graphql/queries/users';
import { GET_ENROLLMENTS } from '../../graphql/queries/enrollment';
import { getTenantPageProps } from '../../lib/tenant-page-props';
import { useAppLayoutHeader } from '../../lib/app-layout-header';
import { isMongoObjectId } from '../../lib/mongo-id';

interface OrdersPageProps {
  tenant: string;
}

function OrdersPageContent({ tenant }: OrdersPageProps) {
  const router = useRouter();
  const handleUserAction = createHandleUserAction(router);
  const layoutUser = useLayoutUser();
  const { queryTenantId } = useTenantScope(tenant);
  const headerProps = useAppLayoutHeader();

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<OrderFilterTab>('all');

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

  useEffect(() => {
    const q = router.query.search;
    if (typeof q === 'string') setSearch(q);
  }, [router.query.search]);

  const allOrders = useMemo(
    () => buildOrdersFromEnrollments(coursesData?.courses, usersData?.users, enrollmentsData?.enrollments),
    [coursesData, usersData, enrollmentsData],
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

  const loading = (coursesLoading || usersLoading || enrollmentsLoading) && allOrders.length === 0;

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
        ) : orders.length === 0 ? (
          <PageEmptyState
            icon="📦"
            title="No orders yet"
            subtitle="Enrollments and purchases will appear here."
            action={<button type="button" className="ios-btn-primary mt-4" onClick={() => router.push('/orders/create')}>Create order</button>}
          />
        ) : (
          <div className="overflow-x-auto -mx-4 px-4">
            <OrderListView
              orders={orders}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              search={search}
              onSearchChange={setSearch}
              tabCounts={tabCounts}
              onCreateOrder={() => void router.push('/orders/create')}
            />
          </div>
        )}
      </AppLayout>
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
