import type { PartialStorefrontPreset } from '../types';
import { demoStorefrontPreset } from './demo';
import { ideaVibesStorefrontPreset } from './idea-vibes';

const TENANT_STOREFRONT_PRESETS: Record<string, PartialStorefrontPreset> = {
  demo: demoStorefrontPreset,
  luxgen: demoStorefrontPreset,
  'idea-vibes': ideaVibesStorefrontPreset,
};

export function getTenantStorefrontPreset(subdomain: string): PartialStorefrontPreset | undefined {
  return TENANT_STOREFRONT_PRESETS[subdomain];
}

export { demoStorefrontPreset, ideaVibesStorefrontPreset };
export type { PartialStorefrontPreset };
