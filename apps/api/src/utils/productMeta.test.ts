import { parseProductMetaFromDescription, priceStringToCents, resolveProductPriceCents } from './productMeta';

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
});
