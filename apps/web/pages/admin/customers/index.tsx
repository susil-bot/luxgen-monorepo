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
import { createHandleUserAction } from '../../../lib/user-actions';
import { useLayoutUser, useAppTenantId } from '../../../lib/app-layout-user';
import { getStoredUser } from '../../../lib/session';
import { GET_COURSES } from '../../../graphql/queries/courses';
import { GET_USERS } from '../../../graphql/queries/users';
import { GET_ENROLLMENTS } from '../../../graphql/queries/enrollment';
import { getTenantPageProps } from '../../../lib/tenant-page-props';
import { useAppLayoutHeader } from '../../../lib/app-layout-header';
import { isLearnerRole } from '../../../lib/user-roles';

interface Props {
  tenant: string;
}

function AdminCustomersPageContent({ tenant }: Props) {
  const router = useRouter();
  const handleUserAction = createHandleUserAction(router);
  const layoutUser = useLayoutUser();
  const tenantId = useAppTenantId();
  const sessionUser = typeof window !== 'undefined' ? getStoredUser() : null;
  const queryTenantId = tenantId ?? sessionUser?.tenant.id;
  const headerProps = useAppLayoutHeader();

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<CustomerFilterTab>('all');

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

  const { data: enrollmentsData } = useQuery(GET_ENROLLMENTS, {
    variables: { tenantId: queryTenantId },
    skip: !queryTenantId,
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    const q = router.query.search;
    if (typeof q === 'string') setSearch(q);
  }, [router.query.search]);

  const allCustomers = useMemo(() => {
    const learners = (usersData?.users ?? []).filter((u: { role: string }) => isLearnerRole(u.role));
    return buildCustomersFromUsers(learners, coursesData?.courses, enrollmentsData?.enrollments);
  }, [coursesData, usersData, enrollmentsData]);

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
            onAddCustomer={() => void router.push('/admin/customers/create')}
          />
        )}
      </AppLayout>
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
