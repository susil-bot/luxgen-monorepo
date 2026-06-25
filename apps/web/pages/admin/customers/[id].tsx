import { useCallback, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from '@apollo/client';
import {
  AppLayout,
  getDefaultLogo,
  getDefaultSidebarSections,
  CustomerDetailView,
  buildCustomerDetailFromUser,
  SnackbarProvider,
  useSnackbar,
  type CustomerDetail,
} from '@luxgen/ui';
import { PageLoadingState } from '../../../components/common/PageStates';
import { createHandleUserAction } from '../../../lib/user-actions';
import { useLayoutUser, useAppTenantId } from '../../../lib/app-layout-user';
import { getStoredUser } from '../../../lib/session';
import { GET_COURSES } from '../../../graphql/queries/courses';
import { GET_USER, GET_USERS, DELETE_USER } from '../../../graphql/queries/users';
import { GET_ENROLLMENTS } from '../../../graphql/queries/enrollment';
import { getTenantPageProps } from '../../../lib/tenant-page-props';
import { useAppLayoutHeader } from '../../../lib/app-layout-header';
import { useActivityTimeline } from '../../../lib/use-activity-timeline';
import { useCustomerNotes } from '../../../lib/use-customer-notes';
import { useCustomerProfile } from '../../../lib/use-customer-profile';
import { applyProfilePatch, marketingPatch } from '../../../lib/customer-profile';
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
  const { showError, showSuccess } = useSnackbar();
  const [localCustomer, setLocalCustomer] = useState<CustomerDetail | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState(false);

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

  const { data: enrollmentsData } = useQuery(GET_ENROLLMENTS, {
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
      enrollmentsData?.enrollments,
    );
  }, [userData?.user, coursesData?.courses, learners, enrollmentsData?.enrollments]);

  useEffect(() => {
    setLocalCustomer(null);
  }, [customerId, customer?.id]);

  const displayCustomer = localCustomer ?? customer;
  const { saveProfile, saving: savingMarketing } = useCustomerProfile(customerId);

  const onMarketingChange = useCallback(
    async (channel: 'email' | 'sms' | 'whatsapp', subscribed: boolean) => {
      if (!customer) return;
      const patch = marketingPatch(channel, subscribed, customer);
      const optimistic = applyProfilePatch(customer, patch);
      setLocalCustomer(optimistic);
      try {
        await saveProfile(patch, optimistic);
      } catch {
        setLocalCustomer(null);
        showError('Failed to save marketing preference');
      }
    },
    [customer, saveProfile, showError],
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

  const [deleteUser] = useMutation(DELETE_USER);

  const handleDeleteCustomer = useCallback(async () => {
    if (!customerId) return;
    const confirmed = window.confirm(
      'Delete this customer permanently? This cannot be undone. Customers with active orders cannot be deleted.',
    );
    if (!confirmed) return;

    setDeletingCustomer(true);
    try {
      await deleteUser({ variables: { id: customerId } });
      showSuccess('Customer deleted');
      void router.push('/admin/customers');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to delete customer');
    } finally {
      setDeletingCustomer(false);
    }
  }, [customerId, deleteUser, router, showError, showSuccess]);

  return (
    <>
      <Head>
        <title>
          {customer ? `${customer.name} — Customers` : 'Customer'} — {tenant}
        </title>
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
        ) : !displayCustomer ? (
          <div className="max-w-2xl mx-auto px-4 py-16 text-center">
            <p className="text-secondary">Customer not found</p>
            <Link href="/admin/customers" className="ios-btn-primary mt-4 inline-block">
              Back to customers
            </Link>
          </div>
        ) : (
          <CustomerDetailView
            customer={displayCustomer}
            editHref={`/admin/customers/${customerId}/edit`}
            onCreateOrder={() => void router.push(`/orders/create?customerId=${encodeURIComponent(customerId)}`)}
            onDeleteCustomer={() => void handleDeleteCustomer()}
            deletingCustomer={deletingCustomer}
            onMarketingChange={onMarketingChange}
            savingMarketing={savingMarketing}
            timeline={timeline}
            customerNotes={customerNotes}
            onCustomerNotesChange={onCustomerNotesChange}
            savingCustomerNotes={savingCustomerNotes}
          />
        )}
      </AppLayout>
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
