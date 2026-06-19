import type { ProductEditFormProps } from './ProductEditForm';
import { DEFAULT_PRODUCT_EDIT_META } from './fetcher';

export const productEditFixtures = {
  default: {
    tenant: 'demo',
    title: 'Introduction to Product Design',
    bodyHtml: '<p>A comprehensive course covering UX fundamentals.</p>',
    seo: {
      metaTitle: 'Introduction to Product Design',
      metaDescription: 'Learn UX fundamentals with hands-on projects.',
      urlHandle: 'intro-product-design',
    },
    meta: {
      ...DEFAULT_PRODUCT_EDIT_META,
      category: 'Design',
      vendor: 'Jane Smith',
      sku: 'CRS-DEMO01',
      price: '99.00',
      tags: ['digital', 'best-seller'],
    },
    status: 'PUBLISHED',
    enrollmentCount: 42,
    saving: false,
    onTitleChange: () => {},
    onBodyChange: () => {},
    onSeoChange: () => {},
    onMetaChange: () => {},
    onStatusChange: () => {},
    onSave: () => {},
  } satisfies ProductEditFormProps,

  draft: {
    tenant: 'demo',
    title: '',
    bodyHtml: '',
    seo: { metaTitle: '', metaDescription: '', urlHandle: '' },
    meta: { ...DEFAULT_PRODUCT_EDIT_META },
    status: 'DRAFT',
    enrollmentCount: 0,
    onTitleChange: () => {},
    onBodyChange: () => {},
    onSeoChange: () => {},
    onMetaChange: () => {},
    onStatusChange: () => {},
    onSave: () => {},
  } satisfies ProductEditFormProps,
};
