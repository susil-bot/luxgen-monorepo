import type { StorefrontContentSettings, StorefrontRouteSettings, StorefrontThemeSettings } from './types';

export const DEFAULT_STOREFRONT_SLUG = 'mentors';

export const LUXGEN_STOREFRONT_TENANT_SUBDOMAINS = new Set(['demo', 'luxgen']);

export const DEFAULT_STOREFRONT_ROUTES: StorefrontRouteSettings = {
  landing: '/store/mentors',
  courses: '/learn',
  programs: '/store/product',
  login: '/login',
  register: '/register',
};

export const STOREFRONT_LANDING_PATH = DEFAULT_STOREFRONT_ROUTES.landing;

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
