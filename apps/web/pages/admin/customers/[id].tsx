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
  buildCustomerDetailFromUser,
  SnackbarProvider,
} from '@luxgen/ui';
import { PageLoadingState } from '../../../components/common/PageStates';
import { CreateOrderModal } from '../../../components/commerce/CreateOrderModal';
import { createHandleUserAction } from '../../../lib/user-actions';
import { useLayoutUser, useAppTenantId } from '../../../lib/app-layout-user';
import { getStoredUser } from '../../../lib/session';
import { GET_COURSES } from '../../../graphql/queries/courses';
import { GET_USER, GET_USERS } from '../../../graphql/queries/users';
import { getTenantPageProps } from '../../../lib/tenant-page-props';
import { useAppLayoutHeader } from '../../../lib/app-layout-header';
import { useActivityTimeline } from '../../../lib/use-activity-timeline';
import { useCustomerNotes } from '../../../lib/use-customer-notes';
import { isMongoObjectId } from '../../../lib/mongo-id';
import { isLearnerRole } from '../../../lib/user-roles';

interface Props {
  tenant: string;
}

function AdminCustomerDetailContent({ tenant }: Props) {
  const router = useRouter();
  const handleUserAction = createHandleUserAction(router);
  const layoutUser = useLayoutUser();
  const tenantId = useAppTenantId();
  const sessionUser = typeof window !== 'undefined' ? getStoredUser() : null;
  const queryTenantId = tenantId ?? sessionUser?.tenant.id;
  const headerProps = useAppLayoutHeader();
  const [showCreateOrder, setShowCreateOrder] = useState(false);

  const customerId = typeof router.query.id === 'string' ? router.query.id : '';

  const { data: userData, loading: userLoading } = useQuery(GET_USER, {
    variables: { id: customerId },
    skip: !customerId,
    fetchPolicy: 'cache-and-network',
  });

  const { data: coursesData, loading: coursesLoading } = useQuery(GET_COURSES, {
    variables: { tenantId: queryTenantId },
    skip: !isMongoObjectId(queryTenantId),
    fetchPolicy: 'cache-and-network',
  });

  const { data: usersData, loading: usersLoading } = useQuery(GET_USERS, {
    variables: { tenantId: queryTenantId },
    skip: !isMongoObjectId(queryTenantId),
    fetchPolicy: 'cache-and-network',
  });

  const learners = useMemo(
    () => (usersData?.users ?? []).filter((u: { role: string }) => isLearnerRole(u.role)),
    [usersData],
  );

  const customer = useMemo(() => {
    const user = userData?.user;
    if (!user || !isLearnerRole(user.role)) return null;
    return buildCustomerDetailFromUser(
      user,
      coursesData?.courses,
      learners,
      user.staffNotes ?? '',
    );
  }, [userData?.user, coursesData?.courses, learners]);

  const orderStudents = useMemo(
    () =>
      learners.map((u: { id: string; email: string; firstName?: string; lastName?: string }) => ({
        id: u.id,
        email: u.email,
        name: `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email,
      })),
    [learners],
  );

  const loading =
    !customerId ||
    (userLoading && !userData) ||
    ((coursesLoading || usersLoading) && !coursesData && !usersData && !customer);

  const staffInitials =
    layoutUser?.name
      ?.split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2) ?? 'ST';

  const mentionOptions = useMemo(
    () =>
      (usersData?.users ?? [])
        .filter((u: { role: string }) => !isLearnerRole(u.role))
        .map((u: { email?: string; firstName?: string }) =>
          (u.email?.split('@')[0] || u.firstName || 'staff').toLowerCase(),
        ),
    [usersData],
  );

  const timelineTenantId = isMongoObjectId(queryTenantId) ? queryTenantId : undefined;
  const timeline = useActivityTimeline(timelineTenantId, 'CUSTOMER', customerId, staffInitials, mentionOptions);

  const {
    notes: customerNotes,
    onNotesChange: onCustomerNotesChange,
    savingNotes: savingCustomerNotes,
  } = useCustomerNotes(customerId, timelineTenantId, customer?.notes ?? '');

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
            customerNotes={customerNotes}
            onCustomerNotesChange={onCustomerNotesChange}
            savingCustomerNotes={savingCustomerNotes}
          />
        )}
      </AppLayout>

      {isMongoObjectId(queryTenantId) && (
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
