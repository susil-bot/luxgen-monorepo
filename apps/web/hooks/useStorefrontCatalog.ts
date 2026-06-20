import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { buildLearnifyCatalog, resolveStorefrontProfile, resolveStorefrontSettings } from '@luxgen/storefront';

import { GET_COURSES } from '../graphql/queries/courses';
import {
  GET_STOREFRONT_BUNDLES,
  GET_STOREFRONT_COLLECTIONS,
  GET_STOREFRONT_PRODUCTS,
} from '../graphql/queries/storefront';
import { GET_TENANT } from '../graphql/queries/tenants';
import type { LearnCourse } from '../lib/learn-store';

interface StorefrontProduct {
  id: string;
  title: string;
  description?: string;
  category?: string;
  priceCents: number;
  currency: string;
  instructorName?: string;
  enrollmentCount?: number;
}

interface StorefrontBundle {
  id: string;
  title: string;
  description?: string;
  slug?: string;
  priceCents: number;
  currency: string;
  status?: string;
}

interface StorefrontCollection {
  id: string;
  name: string;
  description?: string;
  memberCount?: number;
}

/** Fetch tenant + catalog from LuxGen GraphQL, mapped to Learnify-shaped view models. */
export function useStorefrontCatalog(tenantSubdomain: string) {
  const { data: tenantData, loading: tenantLoading } = useQuery(GET_TENANT, {
    variables: { subdomain: tenantSubdomain },
  });

  const tenant = tenantData?.tenantBySubdomain;
  const tenantId = tenant?.id as string | undefined;
  const tenantName = (tenant?.name as string | undefined) ?? tenantSubdomain;
  const tenantSettings = tenant?.settings;

  const storefrontSettings = useMemo(
    () => resolveStorefrontSettings(tenantSubdomain, tenantSettings),
    [tenantSubdomain, tenantSettings],
  );

  const profile = useMemo(
    () =>
      resolveStorefrontProfile({
        subdomain: tenantSubdomain,
        tenantName,
        settings: tenantSettings,
        routes: storefrontSettings.routes,
        slug: storefrontSettings.slug,
      }),
    [tenantSubdomain, tenantName, tenantSettings, storefrontSettings.routes, storefrontSettings.slug],
  );

  const skip = !tenantId;

  const { data: courseData, loading: coursesLoading } = useQuery(GET_COURSES, {
    skip,
    variables: { tenantId: tenantId ?? '' },
  });

  const { data: productData, loading: productsLoading } = useQuery(GET_STOREFRONT_PRODUCTS, {
    skip,
    variables: { tenantId: tenantId ?? '', category: null },
  });

  const { data: bundleData, loading: bundlesLoading } = useQuery(GET_STOREFRONT_BUNDLES, {
    skip,
    variables: { tenantId: tenantId ?? '' },
  });

  const { data: collectionData, loading: collectionsLoading } = useQuery(GET_STOREFRONT_COLLECTIONS, {
    skip,
    variables: { tenantId: tenantId ?? '' },
  });

  const catalog = useMemo(
    () =>
      buildLearnifyCatalog({
        courses: (courseData?.courses as LearnCourse[] | undefined) ?? [],
        products: (productData?.storefrontProducts as StorefrontProduct[] | undefined) ?? [],
        bundles: (bundleData?.storefrontBundles as StorefrontBundle[] | undefined) ?? [],
        collections: (collectionData?.storefrontCollections as StorefrontCollection[] | undefined) ?? [],
        routes: profile.routes,
        profileCategories: profile.content.categories,
      }),
    [
      courseData?.courses,
      productData?.storefrontProducts,
      bundleData?.storefrontBundles,
      collectionData?.storefrontCollections,
      profile.routes,
      profile.content.categories,
    ],
  );

  const loading =
    tenantLoading || (Boolean(tenantId) && (coursesLoading || productsLoading || bundlesLoading || collectionsLoading));

  return {
    tenant,
    tenantName,
    tenantSubdomain,
    storefrontSettings,
    profile,
    catalog,
    loading,
  };
}
