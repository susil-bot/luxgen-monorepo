import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';

import { LearnLayout } from '../../../components/learn/LearnLayout';
import { PageLoadingState } from '../../../components/common/PageStates';
import { GET_STOREFRONT_PRODUCT } from '../../../graphql/queries/storefront';
import { useLearnTenant } from '../../../hooks/useLearnTenant';
import { learnStoreServerProps } from '../../../lib/learn-store';
import { formatStorefrontPrice } from '../../../lib/storefront-format';
import { useLearnEnroll } from '../../../lib/use-learn-enroll';

interface Props {
  tenantSubdomain: string;
}

export default function StorefrontProductPage({ tenantSubdomain }: Props) {
  const router = useRouter();
  const productId = router.query.id as string;
  const { tenantName, tenantSettings } = useLearnTenant(tenantSubdomain);

  const { data, loading, error } = useQuery(GET_STOREFRONT_PRODUCT, {
    skip: !productId,
    variables: { id: productId },
  });

  const product = data?.storefrontProduct;
  const returnPath = `/learn/products/${productId}`;
  const {
    enroll,
    loading: enrolling,
    error: enrollError,
    success,
  } = useLearnEnroll({ courseId: productId, returnPath });

  return (
    <>
      <Head>
        <title>{product?.title ? `${product.title} — Products` : 'Product'}</title>
      </Head>
      <LearnLayout tenantSubdomain={tenantSubdomain} tenantName={tenantName} tenantSettings={tenantSettings}>
        <Link href="/learn/products" className="ios-btn-plain text-sm mb-4 inline-flex">
          ← Products
        </Link>

        {loading && <PageLoadingState label="Loading product…" />}
        {error && <p className="text-sm text-red">{error.message}</p>}

        {product && (
          <article className="space-y-6">
            <header>
              <h1 className="ios-large-title">{product.title}</h1>
              {product.instructorName && <p className="text-secondary text-sm mt-2">By {product.instructorName}</p>}
              <p className="text-lg font-semibold mt-3" style={{ color: 'var(--color-blue)' }}>
                {formatStorefrontPrice(product.priceCents, product.currency)}
              </p>
            </header>
            {product.description && (
              <section className="ios-card p-5">
                <p className="text-secondary text-sm leading-relaxed whitespace-pre-wrap">{product.description}</p>
              </section>
            )}
            <section className="ios-card p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <p className="font-semibold">{success ? 'Enrolled!' : 'Enroll in this course'}</p>
              {success ? (
                <Link href="/dashboard" className="ios-btn-primary">
                  Go to dashboard
                </Link>
              ) : (
                <button type="button" className="ios-btn-primary" disabled={enrolling} onClick={() => void enroll()}>
                  {enrolling ? 'Enrolling…' : 'Enroll now'}
                </button>
              )}
            </section>
            {enrollError && <p className="text-sm text-red">{enrollError}</p>}
          </article>
        )}
      </LearnLayout>
    </>
  );
}

export const getServerSideProps = learnStoreServerProps;
