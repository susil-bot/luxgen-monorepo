import { useMemo, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import {
  AppLayout,
  getDefaultLogo,
  getDefaultSidebarSections,
  OrderListView,
  buildOrdersFromEnrollmentList,
  SnackbarProvider,
} from '@luxgen/ui';
import { PageLoadingState } from '../../components/common/PageStates';
import { createHandleUserAction } from '../../lib/user-actions';
import { useLayoutUser } from '../../lib/app-layout-user';
import { useTenantScope } from '../../lib/use-tenant-scope';
import { GET_COURSES } from '../../graphql/queries/courses';
import { GET_USERS } from '../../graphql/queries/users';
import { GET_DRAFT_ENROLLMENTS } from '../../graphql/queries/enrollment';
import { getTenantPageProps } from '../../lib/tenant-page-props';
import { useAppLayoutHeader } from '../../lib/app-layout-header';
import { isMongoObjectId } from '../../lib/mongo-id';

interface Props {
  tenant: string;
}

function OrdersDraftsContent({ tenant }: Props) {
  const router = useRouter();
  const handleUserAction = createHandleUserAction(router);
  const layoutUser = useLayoutUser();
  const { queryTenantId } = useTenantScope(tenant);
  const headerProps = useAppLayoutHeader();
  const [search, setSearch] = useState('');

  const { data: draftData, loading: draftLoading } = useQuery(GET_DRAFT_ENROLLMENTS, {
    variables: { tenantId: queryTenantId },
    skip: !isMongoObjectId(queryTenantId),
    fetchPolicy: 'cache-and-network',
  });

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

  const orders = useMemo(
    () => buildOrdersFromEnrollmentList(draftData?.draftEnrollments, coursesData?.courses, usersData?.users),
    [draftData, coursesData, usersData],
  );

  const loading = (draftLoading || coursesLoading || usersLoading) && orders.length === 0;

  return (
    <>
      <Head>
        <title>Drafts — Orders — {tenant}</title>
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
          <PageLoadingState label="Loading draft orders…" />
        ) : (
          <OrderListView
            orders={orders}
            activeTab="unpaid"
            onTabChange={() => {}}
            search={search}
            onSearchChange={setSearch}
            onCreateOrder={() => void router.push('/orders/create')}
          />
        )}
      </AppLayout>
    </>
  );
}

export default function OrdersDraftsPage(props: Props) {
  return (
    <SnackbarProvider position="top-right" maxSnackbars={3}>
      <OrdersDraftsContent {...props} />
    </SnackbarProvider>
  );
}

export const getServerSideProps = getTenantPageProps;
