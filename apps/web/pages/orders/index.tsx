import { useEffect, useMemo, useState } from 'react';
import { useAppShellConfig } from '../../lib/app-shell-config';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import {
  AppLayout,
  OrderListView,
  filterOrdersByTab,
  SnackbarProvider,
  type OrderFilterTab,
  type OrderPaymentStatus,
  type OrderFulfillmentStatus,
  type OrderRow,
} from '@luxgen/ui';
import { PageLoadingState, PageEmptyState } from '../../components/common/PageStates';
import { createHandleUserAction } from '../../lib/user-actions';
import { useLayoutUser } from '../../lib/app-layout-user';
import { useTenantScope } from '../../lib/use-tenant-scope';
import { GET_ORDER_ROWS } from '../../graphql/queries/orders';
import { getTenantPageProps } from '../../lib/tenant-page-props';
import { useAppLayoutHeader } from '../../lib/app-layout-header';
import { CACHE_FIRST } from '../../lib/apollo-policies';

interface OrdersPageProps {
  tenant: string;
}

function mapApiOrderRow(row: {
  id: string;
  subjectId: string;
  courseId: string;
  studentId: string;
  orderNumber: string;
  date: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  total: string;
  itemCount: number;
  courseTitle: string;
  archived: boolean;
}): OrderRow {
  return {
    ...row,
    date: String(row.date),
    paymentStatus: row.paymentStatus as OrderPaymentStatus,
    fulfillmentStatus: row.fulfillmentStatus as OrderFulfillmentStatus,
  };
}

function OrdersPageContent({ tenant }: OrdersPageProps) {
  const { sidebarSections, logo } = useAppShellConfig();
  const router = useRouter();
  const handleUserAction = createHandleUserAction(router);
  const layoutUser = useLayoutUser();
  const { queryTenantId } = useTenantScope(tenant);
  const headerProps = useAppLayoutHeader();

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<OrderFilterTab>('all');

  const { data, loading } = useQuery(GET_ORDER_ROWS, {
    variables: { tenantId: queryTenantId },
    skip: !queryTenantId,
    fetchPolicy: CACHE_FIRST,
  });

  useEffect(() => {
    const q = router.query.search;
    if (typeof q === 'string') setSearch(q);
  }, [router.query.search]);

  const allOrders = useMemo(() => (data?.orderRows ?? []).map(mapApiOrderRow), [data?.orderRows]);

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

  if (loading && allOrders.length === 0) {
    return <PageLoadingState label="Loading orders…" />;
  }

  return (
    <>
      <Head>
        <title>Orders — {tenant}</title>
      </Head>

      <AppLayout
        responsive
        sidebarSections={sidebarSections}
        user={layoutUser ?? undefined}
        logo={logo}
        onUserAction={handleUserAction}
        {...headerProps}
      >
        {allOrders.length === 0 ? (
          <PageEmptyState
            icon="📦"
            title="No orders yet"
            subtitle="Enrollments and purchases will appear here."
            action={
              <button type="button" className="ios-btn-primary mt-4" onClick={() => router.push('/orders/create')}>
                Create order
              </button>
            }
          />
        ) : (
          <OrderListView
            orders={orders}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            search={search}
            onSearchChange={setSearch}
            tabCounts={tabCounts}
            onCreateOrder={() => router.push('/orders/create')}
          />
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
