import type { PartialStorefrontPreset } from '../types';

export const demoStorefrontPreset: PartialStorefrontPreset = {
  slug: 'mentors',
  content: {
    hero: {
      headline: 'Professional training & mentorship on {{tenantName}}',
      subheadline:
        'Discover cohort programs, executive coaching, and self-paced courses from verified trainers on our demo workspace.',
      ratingBadge: '4.9 · Trusted by demo learners',
    },
    sections: {
      communityQuote:
        'Demo trainers sell directly to learners — showcase your expertise with LuxGen enrollment and delivery tools.',
    },
    testimonials: [
      {
        id: 'demo-1',
        quote: 'The demo workspace made it easy to preview how my coaching programs would look to real learners.',
        name: 'Alex Thompson',
        role: 'Demo trainer · platform admin',
      },
    ],
  },
  theme: {
    accentColor: '#1E40AF',
    warmAccentColor: '#059669',
  },
  branding: {
    accentColor: '#1E40AF',
  },
};

/** Mongo seed / tenant bootstrap payload for demo */
export const demoStorefrontBootstrap = {
  slug: demoStorefrontPreset.slug ?? 'mentors',
  landingEnabled: true,
  content: demoStorefrontPreset.content,
  theme: demoStorefrontPreset.theme,
};
