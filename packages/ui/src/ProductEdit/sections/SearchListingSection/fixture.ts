import type { SearchListingSectionProps } from './SearchListingSection';

export const searchListingFixtures = {
  default: {
    seo: {
      metaTitle: 'Introduction to Product Design',
      metaDescription: 'Learn UX fundamentals.',
      urlHandle: 'intro-product-design',
    },
    productTitle: 'Introduction to Product Design',
    tenant: 'demo',
    onSeoChange: () => {},
  } satisfies SearchListingSectionProps,
};
