/**
 * Storefront landing profile — layered defaults, tenant presets, and DB overrides.
 * See docs/STOREFRONT_TENANT_CUSTOMIZATION.md
 */

import { getTenantStorefrontPreset } from './tenant-storefront-presets';
import type { StorefrontRouteSettings } from './storefront-settings';

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

export const DEFAULT_STOREFRONT_SLUG = 'mentors';

export const DEFAULT_STOREFRONT_CONTENT: StorefrontContentSettings = {
  hero: {
    headline: 'Learn from expert trainers & mentors on {{tenantName}}',
    subheadline:
      'Access cohort programs, 1:1 mentorship, and self-paced courses — sold and delivered by independent trainers who build their business on LuxGen.',
    searchPlaceholder: 'What do you want to learn?',
    ratingBadge: '4.8 · Trusted by learners',
    emptyCardTitle: 'Mentorship programs launching soon',
    emptyCardMeta: 'Browse the catalog or become a trainer',
  },
  sections: {
    programs: 'Most popular programs',
    categories: 'Explore by focus area',
    mentors: 'Featured trainers & mentors',
    mentorsEmpty: 'Trainers on {{tenantName}} will be listed here as they publish programs.',
    community: 'Our community',
    communityQuote:
      'Trainers and mentors sell directly to learners — you keep your brand, we handle enrollment and delivery.',
    testimonials: 'Learner stories',
    cta: 'Start learning — or start selling',
  },
  nav: [
    { label: 'Home', href: '#top' },
    { label: 'About', href: '#about' },
    { label: 'Courses', href: 'courses' },
    { label: 'Mentors', href: '#mentors' },
    { label: 'Contact', href: '#contact' },
  ],
  categories: [
    { id: 'leadership', label: 'Leadership' },
    { id: 'coaching', label: 'Coaching' },
    { id: 'business', label: 'Business' },
    { id: 'marketing', label: 'Marketing' },
    { id: 'design', label: 'Design' },
    { id: 'development', label: 'Development' },
    { id: 'wellness', label: 'Wellness' },
    { id: 'finance', label: 'Finance' },
    { id: 'communication', label: 'Communication' },
    { id: 'productivity', label: 'Productivity' },
    { id: 'sales', label: 'Sales' },
    { id: 'mentorship', label: 'Mentorship' },
  ],
  testimonials: [
    {
      id: '1',
      quote:
        'My mentor helped me launch a coaching practice in 90 days. The structured programs and live sessions made all the difference.',
      name: 'Sarah Chen',
      role: 'Executive coach · enrolled learner',
    },
    {
      id: '2',
      quote:
        'I sell cohort-based training here and the platform handles enrollment, payments, and learner progress — I focus on teaching.',
      name: 'Marcus Webb',
      role: 'Leadership trainer · course creator',
    },
  ],
  stats: {
    trainers: 'Trainers & mentors',
    programs: 'Programs & courses',
    learners: 'Active learners',
    community: 'Community members',
  },
  cta: {
    title: 'Start learning — or start selling',
    lead: 'Join as a learner to enroll in mentor-led programs, or register to publish your own training on {{tenantName}}.',
    buttonLabel: 'Sign up now',
  },
  footer: {
    tagline: 'Trainer & mentor marketplace powered by LuxGen.',
    contactEmail: 'hello@{{tenantSubdomain}}.learn',
    newsletterTitle: 'Stay updated',
    newsletterHint: 'New mentors and cohorts — no spam.',
    exploreTitle: 'Explore',
    categoriesTitle: 'Categories',
  },
};

export const DEFAULT_STOREFRONT_THEME: StorefrontThemeSettings = {
  accentColor: '#28b485',
  warmAccentColor: '#ffb800',
  layout: 'classic',
};

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as UnknownRecord) : null;
}

function asString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

export function interpolateStorefrontText(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] ?? '');
}

export function landingPathFromSlug(slug: string): string {
  const normalized = slug.trim().replace(/^\/+|\/+$/g, '');
  if (!normalized) return '/store/mentors';
  if (normalized.startsWith('store/')) return `/${normalized}`;
  return `/store/${normalized}`;
}

function mergeContent(
  base: StorefrontContentSettings,
  override: Partial<StorefrontContentSettings> | undefined,
): StorefrontContentSettings {
  if (!override) return base;
  return {
    hero: { ...base.hero, ...override.hero },
    sections: { ...base.sections, ...override.sections },
    nav: override.nav?.length ? override.nav : base.nav,
    categories: override.categories?.length ? override.categories : base.categories,
    testimonials: override.testimonials?.length ? override.testimonials : base.testimonials,
    stats: { ...base.stats, ...override.stats },
    cta: { ...base.cta, ...override.cta },
    footer: { ...base.footer, ...override.footer },
  };
}

function mergeTheme(
  base: StorefrontThemeSettings,
  override: Partial<StorefrontThemeSettings> | undefined,
): StorefrontThemeSettings {
  if (!override) return base;
  return {
    layout: override.layout === 'split' ? 'split' : base.layout,
    ...(override.accentColor ? { accentColor: override.accentColor } : {}),
    ...(override.warmAccentColor ? { warmAccentColor: override.warmAccentColor } : {}),
    ...(override.heroImage ? { heroImage: override.heroImage } : {}),
  };
}

function parseContentFromDb(raw: unknown): Partial<StorefrontContentSettings> | undefined {
  const content = asRecord(raw);
  if (!content) return undefined;

  const hero = asRecord(content.hero);
  const sections = asRecord(content.sections);
  const stats = asRecord(content.stats);
  const cta = asRecord(content.cta);
  const footer = asRecord(content.footer);

  const nav = Array.isArray(content.nav)
    ? content.nav
        .map((item) => {
          const link = asRecord(item);
          if (!link) return null;
          const label = asString(link.label, '');
          const href = asString(link.href, '');
          return label && href ? { label, href } : null;
        })
        .filter((item): item is StorefrontNavLink => item !== null)
    : undefined;

  const categories = Array.isArray(content.categories)
    ? content.categories
        .map((item) => {
          const cat = asRecord(item);
          if (!cat) return null;
          const id = asString(cat.id, '');
          const label = asString(cat.label, '');
          return id && label ? { id, label } : null;
        })
        .filter((item): item is StorefrontCategory => item !== null)
    : undefined;

  const testimonials = Array.isArray(content.testimonials)
    ? content.testimonials
        .map((item) => {
          const t = asRecord(item);
          if (!t) return null;
          const id = asString(t.id, '');
          const quote = asString(t.quote, '');
          const name = asString(t.name, '');
          const role = asString(t.role, '');
          return id && quote && name ? { id, quote, name, role } : null;
        })
        .filter((item): item is StorefrontTestimonial => item !== null)
    : undefined;

  return {
    ...(hero
      ? {
          hero: {
            headline: asString(hero.headline, DEFAULT_STOREFRONT_CONTENT.hero.headline),
            subheadline: asString(hero.subheadline, DEFAULT_STOREFRONT_CONTENT.hero.subheadline),
            searchPlaceholder: asString(hero.searchPlaceholder, DEFAULT_STOREFRONT_CONTENT.hero.searchPlaceholder),
            ratingBadge: asString(hero.ratingBadge, DEFAULT_STOREFRONT_CONTENT.hero.ratingBadge),
            emptyCardTitle: asString(hero.emptyCardTitle, DEFAULT_STOREFRONT_CONTENT.hero.emptyCardTitle),
            emptyCardMeta: asString(hero.emptyCardMeta, DEFAULT_STOREFRONT_CONTENT.hero.emptyCardMeta),
          },
        }
      : {}),
    ...(sections
      ? {
          sections: {
            programs: asString(sections.programs, DEFAULT_STOREFRONT_CONTENT.sections.programs),
            categories: asString(sections.categories, DEFAULT_STOREFRONT_CONTENT.sections.categories),
            mentors: asString(sections.mentors, DEFAULT_STOREFRONT_CONTENT.sections.mentors),
            mentorsEmpty: asString(sections.mentorsEmpty, DEFAULT_STOREFRONT_CONTENT.sections.mentorsEmpty),
            community: asString(sections.community, DEFAULT_STOREFRONT_CONTENT.sections.community),
            communityQuote: asString(sections.communityQuote, DEFAULT_STOREFRONT_CONTENT.sections.communityQuote),
            testimonials: asString(sections.testimonials, DEFAULT_STOREFRONT_CONTENT.sections.testimonials),
            cta: asString(sections.cta, DEFAULT_STOREFRONT_CONTENT.sections.cta),
          },
        }
      : {}),
    ...(nav?.length ? { nav } : {}),
    ...(categories?.length ? { categories } : {}),
    ...(testimonials?.length ? { testimonials } : {}),
    ...(stats
      ? {
          stats: {
            trainers: asString(stats.trainers, DEFAULT_STOREFRONT_CONTENT.stats.trainers),
            programs: asString(stats.programs, DEFAULT_STOREFRONT_CONTENT.stats.programs),
            learners: asString(stats.learners, DEFAULT_STOREFRONT_CONTENT.stats.learners),
            community: asString(stats.community, DEFAULT_STOREFRONT_CONTENT.stats.community),
          },
        }
      : {}),
    ...(cta
      ? {
          cta: {
            title: asString(cta.title, DEFAULT_STOREFRONT_CONTENT.cta.title),
            lead: asString(cta.lead, DEFAULT_STOREFRONT_CONTENT.cta.lead),
            buttonLabel: asString(cta.buttonLabel, DEFAULT_STOREFRONT_CONTENT.cta.buttonLabel),
          },
        }
      : {}),
    ...(footer
      ? {
          footer: {
            tagline: asString(footer.tagline, DEFAULT_STOREFRONT_CONTENT.footer.tagline),
            contactEmail: asString(footer.contactEmail, DEFAULT_STOREFRONT_CONTENT.footer.contactEmail),
            newsletterTitle: asString(footer.newsletterTitle, DEFAULT_STOREFRONT_CONTENT.footer.newsletterTitle),
            newsletterHint: asString(footer.newsletterHint, DEFAULT_STOREFRONT_CONTENT.footer.newsletterHint),
            exploreTitle: asString(footer.exploreTitle, DEFAULT_STOREFRONT_CONTENT.footer.exploreTitle),
            categoriesTitle: asString(footer.categoriesTitle, DEFAULT_STOREFRONT_CONTENT.footer.categoriesTitle),
          },
        }
      : {}),
  };
}

function parseThemeFromDb(raw: unknown): Partial<StorefrontThemeSettings> | undefined {
  const theme = asRecord(raw);
  if (!theme) return undefined;
  return {
    ...(typeof theme.accentColor === 'string' ? { accentColor: theme.accentColor } : {}),
    ...(typeof theme.warmAccentColor === 'string' ? { warmAccentColor: theme.warmAccentColor } : {}),
    ...(typeof theme.heroImage === 'string' ? { heroImage: theme.heroImage } : {}),
    ...(theme.layout === 'split' ? { layout: 'split' as const } : {}),
  };
}

function brandingFromSettings(settings: unknown): StorefrontBrandingSnapshot {
  const settingsObj = asRecord(settings);
  const branding = asRecord(settingsObj?.branding);
  if (!branding) return {};

  return {
    logoUrl: typeof branding.logo === 'string' ? branding.logo : undefined,
    logoAlt: typeof branding.logoAlt === 'string' ? branding.logoAlt : undefined,
    accentColor:
      (typeof branding.accentColor === 'string' ? branding.accentColor : undefined) ??
      (typeof branding.primaryColor === 'string' ? branding.primaryColor : undefined),
  };
}

function interpolateContent(
  content: StorefrontContentSettings,
  vars: Record<string, string>,
): StorefrontContentSettings {
  const mapStr = (s: string) => interpolateStorefrontText(s, vars);
  return {
    ...content,
    hero: {
      headline: mapStr(content.hero.headline),
      subheadline: mapStr(content.hero.subheadline),
      searchPlaceholder: mapStr(content.hero.searchPlaceholder),
      ratingBadge: mapStr(content.hero.ratingBadge),
      emptyCardTitle: mapStr(content.hero.emptyCardTitle),
      emptyCardMeta: mapStr(content.hero.emptyCardMeta),
    },
    sections: {
      ...content.sections,
      mentorsEmpty: mapStr(content.sections.mentorsEmpty),
      communityQuote: mapStr(content.sections.communityQuote),
    },
    cta: {
      title: mapStr(content.cta.title),
      lead: mapStr(content.cta.lead),
      buttonLabel: mapStr(content.cta.buttonLabel),
    },
    footer: {
      ...content.footer,
      tagline: mapStr(content.footer.tagline),
      contactEmail: mapStr(content.footer.contactEmail),
    },
  };
}

export function resolveNavHref(href: string, routes: StorefrontRouteSettings): string {
  if (href.startsWith('#') || href.startsWith('http')) return href;
  if (href === 'courses') return routes.courses;
  if (href === 'programs') return routes.programs;
  if (href === 'landing') return routes.landing;
  if (href === 'login') return routes.login;
  if (href === 'register') return routes.register;
  return href.startsWith('/') ? href : routes.landing;
}

/** CSS custom properties for StorefrontLanding root element */
export function storefrontThemeCssVars(
  theme: StorefrontThemeSettings,
  branding: StorefrontBrandingSnapshot,
): Record<string, string> {
  const accent = theme.accentColor ?? branding.accentColor ?? DEFAULT_STOREFRONT_THEME.accentColor!;
  const warm = theme.warmAccentColor ?? branding.warmAccentColor ?? DEFAULT_STOREFRONT_THEME.warmAccentColor!;
  const vars: Record<string, string> = {
    '--sf-accent': accent,
    '--sf-accent-hover': accent,
    '--sf-accent-soft': `${accent}18`,
    '--sf-accent-muted': `${accent}1f`,
    '--sf-warm': warm,
  };
  if (theme.heroImage) {
    vars['--sf-hero-image'] = `url(${theme.heroImage})`;
  }
  return vars;
}

export interface ResolveStorefrontProfileInput {
  subdomain: string;
  tenantName: string;
  settings: unknown;
  routes: StorefrontRouteSettings;
  slug?: string;
}

export function resolveStorefrontProfile(input: ResolveStorefrontProfileInput): StorefrontProfile {
  const { subdomain, tenantName, settings, routes } = input;
  const settingsObj = asRecord(settings);
  const config = asRecord(settingsObj?.config);
  const storefront = asRecord(config?.storefront);

  const preset = getTenantStorefrontPreset(subdomain);
  const dbSlug = typeof storefront?.slug === 'string' ? storefront.slug.trim() : undefined;
  const slug = dbSlug || input.slug || preset?.slug || DEFAULT_STOREFRONT_SLUG;

  const presetContent = preset?.content as Partial<StorefrontContentSettings> | undefined;
  const dbContent = parseContentFromDb(storefront?.content);
  let content = mergeContent(DEFAULT_STOREFRONT_CONTENT, presetContent);
  content = mergeContent(content, dbContent);

  const dbTheme = parseThemeFromDb(storefront?.theme);
  let theme = mergeTheme(DEFAULT_STOREFRONT_THEME, preset?.theme);
  theme = mergeTheme(theme, dbTheme);

  const branding = { ...brandingFromSettings(settings), ...preset?.branding };
  if (branding.accentColor && !theme.accentColor) {
    theme = { ...theme, accentColor: branding.accentColor };
  }

  const vars = { tenantName, tenantSubdomain: subdomain };
  content = interpolateContent(content, vars);

  return {
    slug,
    routes,
    content,
    theme,
    branding,
  };
}
