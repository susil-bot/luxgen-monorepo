import type {
  StorefrontContentSettings,
  StorefrontThemeSettings,
  StorefrontBrandingSnapshot,
} from '../storefront-profile';

export interface PartialStorefrontPreset {
  slug?: string;
  content?: Partial<StorefrontContentSettings> & {
    hero?: Partial<StorefrontContentSettings['hero']>;
    sections?: Partial<StorefrontContentSettings['sections']>;
    stats?: Partial<StorefrontContentSettings['stats']>;
    cta?: Partial<StorefrontContentSettings['cta']>;
    footer?: Partial<StorefrontContentSettings['footer']>;
    nav?: StorefrontContentSettings['nav'];
    categories?: StorefrontContentSettings['categories'];
    testimonials?: StorefrontContentSettings['testimonials'];
  };
  theme?: Partial<StorefrontThemeSettings>;
  branding?: Partial<StorefrontBrandingSnapshot>;
}
