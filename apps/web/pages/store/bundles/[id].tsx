import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';

import { StoreLayout } from '../../../components/store/StoreLayout';
import { PageLoadingState } from '../../../components/common/PageStates';
import { GET_STOREFRONT_BUNDLE, GET_STOREFRONT_PRODUCTS } from '../../../graphql/queries/storefront';
import { useLearnTenant } from '../../../hooks/useLearnTenant';
import { storeServerProps } from '../../../lib/learn-store';
import { formatBillingInterval, formatStorefrontPrice } from '../../../lib/storefront-format';
import { useStorefrontSubscribe } from '../../../lib/use-storefront-subscribe';
import { CheckoutSteps } from '../../../components/store/CheckoutSteps';

interface Props {
  tenantSubdomain: string;
}

export default function StoreBundleDetailPage({ tenantSubdomain }: Props) {
  const router = useRouter();
  const bundleId = router.query.id as string;
  const { tenantId, tenantName, tenantSettings } = useLearnTenant(tenantSubdomain);

  const { data, loading, error } = useQuery(GET_STOREFRONT_BUNDLE, {
    skip: !bundleId || !tenantId,
    variables: { id: bundleId, tenantId: tenantId ?? '' },
  });

  const { data: productsData } = useQuery(GET_STOREFRONT_PRODUCTS, {
    skip: !tenantId,
    variables: { tenantId: tenantId ?? '', category: null },
  });

  const bundle = data?.storefrontBundle;
  const allProducts = productsData?.storefrontProducts ?? [];
  const included = allProducts.filter((p: { id: string }) => bundle?.courseIds?.includes(p.id));
  const returnPath = `/store/bundles/${bundleId}`;
  const { subscribe, loading: subscribing, error: subError, success } = useStorefrontSubscribe(returnPath);

  return (
    <>
      <Head>
        <title>{bundle?.title ? `${bundle.title} — GPT Store` : 'Bundle'}</title>
      </Head>
      <StoreLayout tenantSubdomain={tenantSubdomain} tenantName={tenantName} tenantSettings={tenantSettings}>
        <Link href="/store/bundles" className="text-sm text-secondary hover:text-primary mb-6 inline-block">
          ← Bundles
        </Link>

        {loading && <PageLoadingState label="Loading bundle…" />}
        {error && <p className="text-sm text-red">{error.message}</p>}

        {bundle && (
          <article className="space-y-6">
            <CheckoutSteps current={success ? 3 : subscribing ? 2 : 1} />
            <header
              className="rounded-2xl p-8"
              style={{
                background: 'linear-gradient(145deg, rgba(0,122,255,0.18), rgba(175,82,222,0.12))',
                border: '1px solid rgba(0,122,255,0.15)',
              }}
            >
              <h1 className="text-3xl font-bold text-primary">{bundle.title}</h1>
              <p className="text-2xl font-semibold mt-3" style={{ color: 'var(--color-blue)' }}>
                {formatStorefrontPrice(bundle.priceCents, bundle.currency)}{' '}
                <span className="text-sm font-normal text-secondary">
                  {formatBillingInterval(bundle.billingInterval)}
                </span>
              </p>
              {bundle.description && <p className="text-secondary text-sm mt-3">{bundle.description}</p>}
            </header>

            <section className="rounded-2xl p-6" style={{ background: 'var(--color-bg-secondary)' }}>
              <h2 className="font-semibold mb-3">Included</h2>
              <ul className="space-y-2">
                {included.map((p: { id: string; title: string }) => (
                  <li key={p.id}>
                    <Link href={`/store/product/${p.id}`} className="text-sm" style={{ color: 'var(--color-blue)' }}>
                      {p.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <section
              className="rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              style={{ border: '1px solid rgba(0,122,255,0.25)' }}
            >
              <p className="font-semibold">
                {success ? 'Subscribed — all items unlocked' : 'One tap — GPT handles the rest'}
              </p>
              {success ? (
                <Link
                  href="/learn/subscriptions"
                  className="text-sm py-2.5 px-5 rounded-full font-medium text-white text-center"
                  style={{ background: 'linear-gradient(135deg, #007AFF, #0A84FF)' }}
                >
                  View subscriptions
                </Link>
              ) : (
                <button
                  type="button"
                  className="text-sm py-2.5 px-5 rounded-full font-medium text-white disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #007AFF, #5856D6)' }}
                  disabled={subscribing}
                  onClick={() => void subscribe(bundleId)}
                >
                  {subscribing ? 'Processing…' : bundle.billingInterval === 'one_time' ? 'Buy bundle' : 'Subscribe'}
                </button>
              )}
            </section>
            {subError && <p className="text-sm text-red">{subError}</p>}
          </article>
        )}
      </StoreLayout>
    </>
  );
}

export const getServerSideProps = storeServerProps;
