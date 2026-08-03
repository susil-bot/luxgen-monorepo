import {
  buildCourseCreateInput,
  buildCourseUpdateInput,
  centsToPriceString,
  commerceInputFromMeta,
  DEFAULT_PRODUCT_EDIT_META,
  mapCourseToProductEditState,
  parseProductEditRecord,
  serializeProductEditRecord,
} from './fetcher';

describe('ProductEdit fetcher commerce persist', () => {
  it('commerceInputFromMeta maps price/sku/category', () => {
    expect(
      commerceInputFromMeta({
        ...DEFAULT_PRODUCT_EDIT_META,
        price: '49.99',
        compareAtPrice: '59.00',
        sku: 'CRS-TEST',
        category: 'Marketing',
      }),
    ).toEqual({
      currency: 'usd',
      priceCents: 4999,
      compareAtPriceCents: 5900,
      sku: 'CRS-TEST',
      category: 'Marketing',
    });
  });

  it('buildCourseUpdateInput includes commerce and always embeds meta', () => {
    const input = buildCourseUpdateInput({
      title: 'Pro Course',
      bodyHtml: '<p>Hello</p>',
      seo: { metaTitle: '', metaDescription: '', urlHandle: '' },
      meta: { ...DEFAULT_PRODUCT_EDIT_META, productType: 'Bundle', price: '99.00', sku: 'B-1' },
      status: 'PUBLISHED',
    });

    expect(input.commerce).toEqual({
      currency: 'usd',
      priceCents: 9900,
      sku: 'B-1',
    });
    expect(input.description).toContain('luxgen-product-meta');
    expect(input.description).toContain('"productType":"Bundle"');
    expect(input.status).toBe('PUBLISHED');
  });

  it('buildCourseCreateInput includes commerce', () => {
    const input = buildCourseCreateInput(
      {
        title: 'New',
        bodyHtml: '',
        seo: { metaTitle: '', metaDescription: '', urlHandle: '' },
        meta: { ...DEFAULT_PRODUCT_EDIT_META, price: '10' },
      },
      'user1',
      'tenant1',
    );
    expect(input.commerce.priceCents).toBe(1000);
    expect(input.instructorId).toBe('user1');
  });

  it('mapCourseToProductEditState hydrates from commerce when meta blob missing', () => {
    const state = mapCourseToProductEditState({
      id: 'abc123456789',
      title: 'Hydrated',
      description: '<p>Body</p>',
      status: 'PUBLISHED',
      commerce: { priceCents: 2500, sku: 'SKU-HYDR', category: 'Dev' },
      students: [{ id: 's1' }],
    });

    expect(state.meta.price).toBe('25.00');
    expect(state.meta.sku).toBe('SKU-HYDR');
    expect(state.meta.category).toBe('Dev');
    expect(state.enrollmentCount).toBe(1);
  });

  it('round-trips productType-only meta through serialize/parse', () => {
    const serialized = serializeProductEditRecord('<p>x</p>', { metaTitle: '', metaDescription: '', urlHandle: '' }, {
      ...DEFAULT_PRODUCT_EDIT_META,
      productType: 'Subscription',
      themeTemplate: 'landing',
      trackInventory: false,
    });
    const parsed = parseProductEditRecord(serialized);
    expect(parsed.meta.productType).toBe('Subscription');
    expect(parsed.meta.themeTemplate).toBe('landing');
    expect(parsed.meta.trackInventory).toBe(false);
  });

  it('centsToPriceString formats cents', () => {
    expect(centsToPriceString(199)).toBe('1.99');
    expect(centsToPriceString(null)).toBe('');
  });
});
