import { useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import {
  AppLayout,
  getDefaultLogo,
  getDefaultSidebarSections,
  CustomerDetailView,
  buildCustomersFromUsers,
  findCustomerDetail,
  SnackbarProvider,
} from '@luxgen/ui';
import { PageLoadingState } from '../../../components/common/PageStates';
import { CreateOrderModal } from '../../../components/commerce/CreateOrderModal';
import { createHandleUserAction } from '../../../lib/user-actions';
import { useLayoutUser, useAppTenantId } from '../../../lib/app-layout-user';
import { getStoredUser } from '../../../lib/session';
import { GET_COURSES } from '../../../graphql/queries/courses';
import { GET_USERS } from '../../../graphql/queries/users';
import { getTenantPageProps } from '../../../lib/tenant-page-props';
import { useAppLayoutHeader } from '../../../lib/app-layout-header';
import { useActivityTimeline } from '../../../lib/use-activity-timeline';

interface Props {
  tenant: string;
}

function AdminCustomerDetailContent({ tenant }: Props) {
  const router = useRouter();
  const handleUserAction = createHandleUserAction(router);
  const layoutUser = useLayoutUser();
  const tenantId = useAppTenantId();
  const sessionUser = typeof window !== 'undefined' ? getStoredUser() : null;
  const queryTenantId = tenantId ?? sessionUser?.tenant.id ?? tenant;
  const headerProps = useAppLayoutHeader();
  const [showCreateOrder, setShowCreateOrder] = useState(false);

  const customerId = typeof router.query.id === 'string' ? router.query.id : '';

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

  const learners = useMemo(
    () =>
      (usersData?.users ?? []).filter(
        (u: { role: string }) => u.role === 'STUDENT' || u.role === 'student',
      ),
    [usersData],
  );

  const customer = useMemo(() => {
    const customers = buildCustomersFromUsers(learners, coursesData?.courses);
    return findCustomerDetail(customers, customerId, coursesData?.courses, learners);
  }, [coursesData, learners, customerId]);

  const orderStudents = useMemo(
    () =>
      learners.map((u: { id: string; email: string; firstName?: string; lastName?: string }) => ({
        id: u.id,
        email: u.email,
        name: `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email,
      })),
    [learners],
  );

  const loading = !customerId || ((coursesLoading || usersLoading) && !customer);

  const staffInitials =
    layoutUser?.name
      ?.split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2) ?? 'ST';

  const timeline = useActivityTimeline(queryTenantId, 'CUSTOMER', customerId, staffInitials);

  return (
    <>
      <Head>
        <title>{customer ? `${customer.name} — Customers` : 'Customer'} — {tenant}</title>
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
          <PageLoadingState label="Loading customer…" />
        ) : !customer ? (
          <div className="max-w-2xl mx-auto px-4 py-16 text-center">
            <p className="text-secondary">Customer not found</p>
            <Link href="/admin/customers" className="ios-btn-primary mt-4 inline-block">
              Back to customers
            </Link>
          </div>
        ) : (
          <CustomerDetailView
            customer={customer}
            onCreateOrder={() => setShowCreateOrder(true)}
            timeline={timeline}
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
          defaultStudentId={customerId}
          onCreated={(orderId) => void router.push(`/orders/${encodeURIComponent(orderId)}`)}
        />
      )}
    </>
  );
}

export default function AdminCustomerDetailPage(props: Props) {
  return (
    <SnackbarProvider position="top-right" maxSnackbars={3}>
      <AdminCustomerDetailContent {...props} />
    </SnackbarProvider>
  );
}

export const getServerSideProps = getTenantPageProps;
