/** Extended product edit fields (Shopify metafields / organization) stored in course description footer. */

import {
  parseProductDescription,
  serializeProductDescription,
  type ProductSeo,
} from './product-seo';

export type { ProductSeo };

const META_MARKER = '\n\n<!-- luxgen-product-meta\n';

export interface ProductEditMeta {
  category: string;
  productType: string;
  vendor: string;
  tags: string[];
  collectionIds: string[];
  price: string;
  compareAtPrice: string;
  chargeTax: boolean;
  sku: string;
  barcode: string;
  trackInventory: boolean;
  maxEnrollments: number | null;
  sellWhenOutOfStock: boolean;
  themeTemplate: string;
}

export const DEFAULT_PRODUCT_EDIT_META: ProductEditMeta = {
  category: '',
  productType: 'Course',
  vendor: '',
  tags: [],
  collectionIds: [],
  price: '',
  compareAtPrice: '',
  chargeTax: false,
  sku: '',
  barcode: '',
  trackInventory: true,
  maxEnrollments: null,
  sellWhenOutOfStock: false,
  themeTemplate: 'default',
};

export function parseProductMeta(raw: string | null | undefined): {
  contentWithoutMeta: string;
  meta: ProductEditMeta;
} {
  const text = raw ?? '';
  const idx = text.indexOf(META_MARKER);
  if (idx === -1) {
    return { contentWithoutMeta: text, meta: { ...DEFAULT_PRODUCT_EDIT_META } };
  }

  const contentWithoutMeta = text.slice(0, idx);
  const jsonPart = text.slice(idx + META_MARKER.length).replace(/\n-->$/, '').trim();

  try {
    return {
      contentWithoutMeta,
      meta: { ...DEFAULT_PRODUCT_EDIT_META, ...JSON.parse(jsonPart) } as ProductEditMeta,
    };
  } catch {
    return { contentWithoutMeta: text, meta: { ...DEFAULT_PRODUCT_EDIT_META } };
  }
}

export function appendProductMeta(content: string, meta: ProductEditMeta): string {
  const base = content.trim();
  const hasValues = Object.entries(meta).some(([k, v]) => {
    if (k === 'productType' || k === 'themeTemplate' || k === 'trackInventory') return false;
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === 'boolean') return v !== DEFAULT_PRODUCT_EDIT_META[k as keyof ProductEditMeta];
    return v !== '' && v !== null;
  });
  if (!hasValues) return base;
  return `${base}${META_MARKER}${JSON.stringify(meta)}\n-->`;
}

export function parseProductEditRecord(raw: string | null | undefined): {
  bodyHtml: string;
  seo: ProductSeo;
  meta: ProductEditMeta;
} {
  const { contentWithoutMeta, meta } = parseProductMeta(raw);
  const { bodyHtml, seo } = parseProductDescription(contentWithoutMeta);
  return { bodyHtml, seo, meta };
}

export function serializeProductEditRecord(
  bodyHtml: string,
  seo: ProductSeo,
  meta: ProductEditMeta,
): string {
  return appendProductMeta(serializeProductDescription(bodyHtml, seo), meta);
}
