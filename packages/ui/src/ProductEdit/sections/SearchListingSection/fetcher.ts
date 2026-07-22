export function buildSeoPreviewUrl(tenant: string, handle: string): string {
  return `https://${tenant}.localhost/products/${handle}`;
}

export function deriveUrlHandle(productTitle: string, urlHandle: string): string {
  return urlHandle || productTitle.toLowerCase().replace(/\s+/g, '-').slice(0, 48);
}
