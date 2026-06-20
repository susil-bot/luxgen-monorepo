import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useMemo } from 'react';
import Head from 'next/head';
import { useQuery } from '@apollo/client';

import { StorefrontLanding } from '../../../components/storefront/StorefrontLanding';
import { PageLoadingState } from '../../../components/common/PageStates';
import { GET_TENANT } from '../../../graphql/queries/tenants';
import { learnStoreServerProps } from '../../../lib/learn-store';
import { resolveStorefrontSettings } from '../../../lib/storefront-settings';
import { useClientMounted } from '../../../lib/use-client-mounted';

interface MentorsPageProps {
  tenantSubdomain: string;
}

export default function StoreMentorsLandingPage({ tenantSubdomain }: MentorsPageProps) {
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

  useEffect(() => {
    if (!mounted || tenantLoading) return;
    if (!storefront.landingEnabled) {
      void router.replace('/');
    }
  }, [mounted, tenantLoading, storefront.landingEnabled, router]);

  if (!mounted || tenantLoading) {
    return <PageLoadingState label="Loading…" />;
  }

  if (!storefront.landingEnabled) {
    return <PageLoadingState label="Redirecting…" />;
  }

  return (
    <>
      <Head>
        <title>Trainers &amp; mentors — {tenantName}</title>
        <meta
          name="description"
          content={`Discover courses, cohort programs, and mentorship from trainers on ${tenantName}.`}
        />
      </Head>
      <StorefrontLanding tenantSubdomain={tenantSubdomain} routes={storefront.routes} />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { props } = learnStoreServerProps(context);
  return { props };
};
