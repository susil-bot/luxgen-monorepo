import { useMemo, useState } from 'react';
import { useAppShellConfig } from '../../lib/app-shell-config';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from '@apollo/client';
import {
  AppLayout,
  AbandonedCheckoutListView,
  buildAbandonedCheckoutRows,
  SnackbarProvider } from '@luxgen/ui';
import { PageLoadingState } from '../../components/common/PageStates';
import { createHandleUserAction } from '../../lib/user-actions';
import { useLayoutUser } from '../../lib/app-layout-user';
import { useTenantScope } from '../../lib/use-tenant-scope';
import { GET_USERS } from '../../graphql/queries/users';
import { GET_ABANDONED_CHECKOUTS, SEND_CHECKOUT_RECOVERY } from '../../graphql/queries/enrollment';
import { getTenantPageProps } from '../../lib/tenant-page-props';
import { useAppLayoutHeader } from '../../lib/app-layout-header';
import { isMongoObjectId } from '../../lib/mongo-id';

interface Props {
  tenant: string;
}

function OrdersAbandonedContent({ tenant }: Props) {
  const { sidebarSections, logo } = useAppShellConfig();
  const router = useRouter();
  const handleUserAction = createHandleUserAction(router);
  const layoutUser = useLayoutUser();
  const { queryTenantId } = useTenantScope(tenant);
  const headerProps = useAppLayoutHeader();
  const [search, setSearch] = useState('');
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sendRecovery] = useMutation(SEND_CHECKOUT_RECOVERY);

  const { data: checkoutData, loading: checkoutLoading } = useQuery(GET_ABANDONED_CHECKOUTS, {
    variables: { tenantId: queryTenantId },
    skip: !isMongoObjectId(queryTenantId),
    fetchPolicy: 'cache-and-network' });

  const { data: usersData, loading: usersLoading } = useQuery(GET_USERS, {
    variables: { tenantId: queryTenantId },
    skip: !queryTenantId,
    fetchPolicy: 'cache-and-network' });

  const checkouts = useMemo(
    () => buildAbandonedCheckoutRows(checkoutData?.abandonedCheckouts, usersData?.users),
    [checkoutData, usersData],
  );

  const loading = (checkoutLoading || usersLoading) && checkouts.length === 0;

  return (
    <>
      <Head>
        <title>Abandoned checkouts — Orders — {tenant}</title>
      </Head>
      <AppLayout
        sidebarSections={sidebarSections}
        user={layoutUser ?? undefined}
        logo={logo}
        onUserAction={handleUserAction}
        {...headerProps}
        responsive
      >
        {loading ? (
          <PageLoadingState label="Loading abandoned checkouts…" />
        ) : (
          <AbandonedCheckoutListView
            checkouts={checkouts}
            search={search}
            onSearchChange={setSearch}
            sendingId={sendingId}
            onSendRecovery={(checkoutSessionId) => {
              setSendingId(checkoutSessionId);
              void sendRecovery({ variables: { tenantId: queryTenantId, checkoutSessionId } }).finally(() => setSendingId(null));
            }}
          />
        )}
      </AppLayout>
    </>
  );
}

export default function OrdersAbandonedPage(props: Props) {
  return (
    <SnackbarProvider position="top-right" maxSnackbars={3}>
      <OrdersAbandonedContent {...props} />
    </SnackbarProvider>
  );
}
