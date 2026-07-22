import {
  parseProductMetaFromDescription,
  priceStringToCents,
  resolveProductPriceCents,
  commerceFromDescription,
  resolveCoursePriceCents,
} from './productMeta';

describe('productMeta', () => {
  it('parses luxgen-product-meta from course description', () => {
    const description = `Body\n\n<!-- luxgen-product-meta\n${JSON.stringify({ price: '29.99', category: 'digital' })}\n-->`;
    const meta = parseProductMetaFromDescription(description);
    expect(meta.price).toBe('29.99');
    expect(meta.category).toBe('digital');
  });

  it('converts price strings to cents', () => {
    expect(priceStringToCents('49.00')).toBe(4900);
    expect(priceStringToCents('')).toBeNull();
  });

  it('resolves storefront price from meta with fallback', () => {
    const description = `Body\n\n<!-- luxgen-product-meta\n${JSON.stringify({ price: '10' })}\n-->`;
    expect(resolveProductPriceCents(description, 12900)).toBe(1000);
    expect(resolveProductPriceCents('', 4900)).toBe(4900);
  });

  it('prefers commerce.priceCents over description meta', () => {
    const description = `Body\n\n<!-- luxgen-product-meta\n${JSON.stringify({ price: '10' })}\n-->`;
    expect(resolveCoursePriceCents({ priceCents: 2500 }, description, 12900)).toBe(2500);
    expect(resolveCoursePriceCents(null, description, 12900)).toBe(1000);
  });

  it('extracts commerce fields from description', () => {
    const description = `Body\n\n<!-- luxgen-product-meta\n${JSON.stringify({
      price: '49.99',
      compareAtPrice: '59.99',
      sku: 'CRS-001',
      category: 'digital',
    })}\n-->`;
    expect(commerceFromDescription(description)).toMatchObject({
      priceCents: 4999,
      compareAtPriceCents: 5999,
      sku: 'CRS-001',
      category: 'digital',
      currency: 'usd',
    });
  });
});
