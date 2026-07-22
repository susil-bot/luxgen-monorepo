import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useMemo } from 'react';
import Head from 'next/head';
import { useQuery } from '@apollo/client';
import { matchesStorefrontSlug } from '@luxgen/storefront';

import { LearnifyStorefront } from '../../components/storefront/LearnifyStorefront';
import { PageLoadingState } from '../../components/common/PageStates';
import { GET_TENANT } from '../../graphql/queries/tenants';
import { learnStoreServerProps } from '../../lib/learn-store';
import { resolveStorefrontSettings } from '../../lib/storefront-settings';
import { useClientMounted } from '../../lib/use-client-mounted';

interface StoreSlugPageProps {
  tenantSubdomain: string;
  slug: string;
}

export default function StoreSlugLandingPage({ tenantSubdomain, slug }: StoreSlugPageProps) {
  const router = useRouter();
  const mounted = useClientMounted();

  const { data: tenantData, loading: tenantLoading } = useQuery(GET_TENANT, {
    variables: { subdomain: tenantSubdomain },
  });

  const tenant = tenantData?.tenantBySubdomain;
  const tenantName = (tenant?.name as string | undefined) ?? tenantSubdomain;

  const storefront = useMemo(
    () => resolveStorefrontSettings(tenantSubdomain, tenant?.settings),
    [tenantSubdomain, tenant?.settings],
  );

  const slugMatches = matchesStorefrontSlug(slug, storefront);

  useEffect(() => {
    if (!mounted || tenantLoading) return;
    if (!storefront.landingEnabled) {
      void router.replace('/');
      return;
    }
    if (!slugMatches) {
      void router.replace(storefront.routes.landing);
    }
  }, [mounted, tenantLoading, storefront.landingEnabled, storefront.routes.landing, slugMatches, router]);

  if (!mounted || tenantLoading) {
    return <PageLoadingState label="Loading…" />;
  }

  if (!storefront.landingEnabled || !slugMatches) {
    return <PageLoadingState label="Redirecting…" />;
  }

  return (
    <>
      <Head>
        <title>{tenantName} — trainers &amp; mentors</title>
        <meta
          name="description"
          content={`Discover courses, cohort programs, and mentorship from trainers on ${tenantName}.`}
        />
      </Head>
      <LearnifyStorefront tenantSubdomain={tenantSubdomain} />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const slug = typeof context.params?.slug === 'string' ? context.params.slug : 'mentors';
  const { props } = learnStoreServerProps(context);
  return { props: { ...props, slug } };
};
