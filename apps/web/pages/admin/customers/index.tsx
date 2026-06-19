import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import {
  AppLayout,
  getDefaultLogo,
  getDefaultSidebarSections,
  CustomerListView,
  buildCustomersFromUsers,
  filterCustomersByTab,
  SnackbarProvider,
  type CustomerFilterTab,
} from '@luxgen/ui';
import { PageLoadingState } from '../../../components/common/PageStates';
import { CreateCustomerModal } from '../../../components/commerce/CreateCustomerModal';
import { createHandleUserAction } from '../../../lib/user-actions';
import { useLayoutUser, useAppTenantId } from '../../../lib/app-layout-user';
import { getStoredUser } from '../../../lib/session';
import { GET_COURSES } from '../../../graphql/queries/courses';
import { GET_USERS } from '../../../graphql/queries/users';
import { getTenantPageProps } from '../../../lib/tenant-page-props';
import { useAppLayoutHeader } from '../../../lib/app-layout-header';

interface Props {
  tenant: string;
}

function AdminCustomersPageContent({ tenant }: Props) {
  const router = useRouter();
  const handleUserAction = createHandleUserAction(router);
  const layoutUser = useLayoutUser();
  const tenantId = useAppTenantId();
  const sessionUser = typeof window !== 'undefined' ? getStoredUser() : null;
  const queryTenantId = tenantId ?? sessionUser?.tenant.id ?? tenant;
  const headerProps = useAppLayoutHeader();

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<CustomerFilterTab>('all');
  const [showCreateCustomer, setShowCreateCustomer] = useState(false);

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

  const allCustomers = useMemo(() => {
    const learners = (usersData?.users ?? []).filter(
      (u: { role: string }) => u.role === 'STUDENT' || u.role === 'student',
    );
    return buildCustomersFromUsers(learners, coursesData?.courses);
  }, [coursesData, usersData]);

  const customers = useMemo(() => {
    let rows = filterCustomersByTab(allCustomers, activeTab);
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.rfmGroup.toLowerCase().includes(q),
      );
    }
    return rows;
  }, [allCustomers, activeTab, search]);

  const loading = (coursesLoading || usersLoading) && allCustomers.length === 0;

  return (
    <>
      <Head>
        <title>Customers — {tenant}</title>
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
          <PageLoadingState label="Loading customers…" />
        ) : (
          <CustomerListView
            customers={customers}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            search={search}
            onSearchChange={setSearch}
            onAddCustomer={() => setShowCreateCustomer(true)}
          />
        )}
      </AppLayout>

      {queryTenantId && (
        <CreateCustomerModal
          isOpen={showCreateCustomer}
          onClose={() => setShowCreateCustomer(false)}
          tenantId={queryTenantId}
          onCreated={(id) => void router.push(`/admin/customers/${id}`)}
        />
      )}
    </>
  );
}

export default function AdminCustomersPage(props: Props) {
  return (
    <SnackbarProvider position="top-right" maxSnackbars={3}>
      <AdminCustomersPageContent {...props} />
    </SnackbarProvider>
  );
}

export const getServerSideProps = getTenantPageProps;
