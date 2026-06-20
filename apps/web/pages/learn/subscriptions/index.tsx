import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/router';

import { LearnLayout } from '../../../components/learn/LearnLayout';
import { PageLoadingState } from '../../../components/common/PageStates';
import { CANCEL_LEARNER_SUBSCRIPTION, GET_LEARNER_SUBSCRIPTIONS } from '../../../graphql/queries/storefront';
import { useLearnTenant } from '../../../hooks/useLearnTenant';
import { buildLoginRedirect } from '../../../lib/auth-routes';
import { learnStoreServerProps } from '../../../lib/learn-store';
import { formatBillingInterval, formatStorefrontPrice } from '../../../lib/storefront-format';
import { getStoredUser, isStoredSessionExpired } from '../../../lib/session';

interface Props {
  tenantSubdomain: string;
}

export default function StorefrontSubscriptionsPage({ tenantSubdomain }: Props) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const { tenantId, tenantName, tenantSettings, loading: tenantLoading } = useLearnTenant(tenantSubdomain);

  useEffect(() => {
    if (isStoredSessionExpired() || !getStoredUser()?.id) {
      void router.replace(buildLoginRedirect('/learn/subscriptions'));
      return;
    }
    setReady(true);
  }, [router]);

  const { data, loading, error, refetch } = useQuery(GET_LEARNER_SUBSCRIPTIONS, {
    skip: !tenantId || !ready,
    variables: { tenantId: tenantId ?? '' },
  });

  const [cancelSub, { loading: canceling }] = useMutation(CANCEL_LEARNER_SUBSCRIPTION);

  const subscriptions = data?.learnerSubscriptions ?? [];

  const handleCancel = async (subscriptionId: string) => {
    await cancelSub({ variables: { subscriptionId } });
    await refetch();
  };

  if (!ready) {
    return <PageLoadingState label="Checking session…" />;
  }

  return (
    <>
      <Head>
        <title>My subscriptions — {tenantName ?? tenantSubdomain}</title>
      </Head>
      <LearnLayout tenantSubdomain={tenantSubdomain} tenantName={tenantName} tenantSettings={tenantSettings}>
        <header className="mb-6">
          <h1 className="ios-large-title">My subscriptions</h1>
          <p className="text-sm text-secondary mt-1">Manage your bundle subscriptions</p>
        </header>

        {(tenantLoading || loading) && <PageLoadingState label="Loading subscriptions…" />}
        {error && <p className="text-sm text-red">{error.message}</p>}

        {!loading && !error && subscriptions.length === 0 && (
          <div className="ios-empty-state ios-card py-12">
            <p className="empty-title">No active subscriptions</p>
            <p className="empty-subtitle">Browse bundles to subscribe</p>
          </div>
        )}

        <div className="space-y-4">
          {subscriptions.map(
            (sub: {
              id: string;
              status: string;
              currentPeriodEnd?: string;
              bundle?: { title: string; priceCents: number; currency: string; billingInterval: string };
            }) => (
              <div
                key={sub.id}
                className="ios-card p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div>
                  <p className="font-semibold text-primary">{sub.bundle?.title ?? 'Bundle'}</p>
                  <p className="text-sm text-secondary mt-1 capitalize">Status: {sub.status}</p>
                  {sub.bundle && (
                    <p className="text-sm mt-1" style={{ color: 'var(--color-blue)' }}>
                      {formatStorefrontPrice(sub.bundle.priceCents, sub.bundle.currency)}{' '}
                      {formatBillingInterval(sub.bundle.billingInterval)}
                    </p>
                  )}
                  {sub.currentPeriodEnd && (
                    <p className="text-xs text-secondary mt-1">
                      Renews / ends {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                    </p>
                  )}
                </div>
                {sub.status === 'active' && (
                  <button
                    type="button"
                    className="ios-btn-secondary text-sm"
                    disabled={canceling}
                    onClick={() => void handleCancel(sub.id)}
                  >
                    Cancel
                  </button>
                )}
              </div>
            ),
          )}
        </div>
      </LearnLayout>
    </>
  );
}

export const getServerSideProps = learnStoreServerProps;
