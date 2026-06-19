const SEO_MARKER = '\n\n<!-- luxgen-seo\n';

export interface ProductSeo {
  metaTitle: string;
  metaDescription: string;
  urlHandle: string;
}

const DEFAULT_SEO: ProductSeo = {
  metaTitle: '',
  metaDescription: '',
  urlHandle: '',
};

export function parseProductDescription(raw: string | null | undefined): {
  bodyHtml: string;
  seo: ProductSeo;
} {
  const text = raw ?? '';
  const idx = text.indexOf(SEO_MARKER);
  if (idx === -1) {
    return { bodyHtml: text, seo: { ...DEFAULT_SEO } };
  }

  const bodyHtml = text.slice(0, idx);
  const jsonPart = text.slice(idx + SEO_MARKER.length).replace(/\n-->$/, '').trim();

  try {
    const seo = { ...DEFAULT_SEO, ...JSON.parse(jsonPart) } as ProductSeo;
    return { bodyHtml, seo };
  } catch {
    return { bodyHtml: text, seo: { ...DEFAULT_SEO } };
  }
}

export function serializeProductDescription(bodyHtml: string, seo: ProductSeo): string {
  const trimmed = bodyHtml.trim();
  const hasSeo = seo.metaTitle || seo.metaDescription || seo.urlHandle;
  if (!hasSeo) return trimmed;
  return `${trimmed}${SEO_MARKER}${JSON.stringify(seo)}\n-->`;
}
