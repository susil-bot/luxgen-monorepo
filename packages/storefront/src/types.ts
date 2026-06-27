/** Shared storefront domain types — @luxgen/storefront */

export interface StorefrontRouteSettings {
  landing: string;
  courses: string;
  programs: string;
  login: string;
  register: string;
}

export interface StorefrontNavLink {
  label: string;
  href: string;
}

export interface StorefrontCategory {
  id: string;
  label: string;
}

export interface StorefrontTestimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
}

export interface StorefrontHeroContent {
  headline: string;
  subheadline: string;
  searchPlaceholder: string;
  ratingBadge: string;
  emptyCardTitle: string;
  emptyCardMeta: string;
}

export interface StorefrontSectionContent {
  programs: string;
  categories: string;
  mentors: string;
  mentorsEmpty: string;
  community: string;
  communityQuote: string;
  testimonials: string;
  cta: string;
}

export interface StorefrontStatsLabels {
  trainers: string;
  programs: string;
  learners: string;
  community: string;
}

export interface StorefrontCtaContent {
  title: string;
  lead: string;
  buttonLabel: string;
}

export interface StorefrontFooterContent {
  tagline: string;
  contactEmail: string;
  newsletterTitle: string;
  newsletterHint: string;
  exploreTitle: string;
  categoriesTitle: string;
}

export interface StorefrontContentSettings {
  hero: StorefrontHeroContent;
  sections: StorefrontSectionContent;
  nav: StorefrontNavLink[];
  categories: StorefrontCategory[];
  testimonials: StorefrontTestimonial[];
  stats: StorefrontStatsLabels;
  cta: StorefrontCtaContent;
  footer: StorefrontFooterContent;
}

export interface StorefrontThemeSettings {
  accentColor?: string;
  warmAccentColor?: string;
  heroImage?: string;
  layout: 'classic' | 'split';
}

export interface StorefrontBrandingSnapshot {
  logoUrl?: string;
  logoAlt?: string;
  accentColor?: string;
  warmAccentColor?: string;
}

export interface StorefrontProfile {
  slug: string;
  routes: StorefrontRouteSettings;
  content: StorefrontContentSettings;
  theme: StorefrontThemeSettings;
  branding: StorefrontBrandingSnapshot;
}

export interface TenantStorefrontSettings {
  landingEnabled: boolean;
  slug: string;
  routes: StorefrontRouteSettings;
  content?: Partial<StorefrontContentSettings>;
  theme?: Partial<StorefrontThemeSettings>;
}

export interface StorefrontSettingsPayload {
  landingEnabled: boolean;
  slug: string;
  routes: StorefrontRouteSettings;
  content?: Partial<StorefrontContentSettings>;
  theme?: Partial<StorefrontThemeSettings>;
}

export interface ResolveStorefrontProfileInput {
  subdomain: string;
  tenantName: string;
  settings: unknown;
  routes: StorefrontRouteSettings;
  slug?: string;
}

export const STOREFRONT_ROUTE_KEYS = ['landing', 'courses', 'programs', 'login', 'register'] as const;
export type StorefrontRouteKey = (typeof STOREFRONT_ROUTE_KEYS)[number];

export interface StorefrontPatchBody {
  landingEnabled?: boolean;
  slug?: string;
  routes?: Partial<Record<StorefrontRouteKey, string>>;
  content?: Record<string, unknown>;
  theme?: {
    accentColor?: string;
    warmAccentColor?: string;
    heroImage?: string;
    layout?: 'classic' | 'split';
  };
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface PartialStorefrontPreset {
  slug?: string;
  content?: {
    hero?: Partial<StorefrontHeroContent>;
    sections?: Partial<StorefrontSectionContent>;
    stats?: Partial<StorefrontStatsLabels>;
    cta?: Partial<StorefrontCtaContent>;
    footer?: Partial<StorefrontFooterContent>;
    nav?: StorefrontNavLink[];
    categories?: StorefrontCategory[];
    testimonials?: StorefrontTestimonial[];
  };
  theme?: Partial<StorefrontThemeSettings>;
  branding?: Partial<StorefrontBrandingSnapshot>;
}
