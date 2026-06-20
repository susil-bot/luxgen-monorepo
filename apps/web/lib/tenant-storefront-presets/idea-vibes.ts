import type { PartialStorefrontPreset } from './types';

/** Idea Vibes — creative learning & innovation positioning */
export const ideaVibesStorefrontPreset: PartialStorefrontPreset = {
  slug: 'creators',
  content: {
    hero: {
      headline: 'Unlock creativity with mentors on {{tenantName}}',
      subheadline: 'Join workshops, creative cohorts, and innovation labs led by makers, designers, and strategists.',
      searchPlaceholder: 'Search creative programs…',
      ratingBadge: '★ Creative community',
    },
    sections: {
      programs: 'Trending creative programs',
      categories: 'Explore creative disciplines',
      mentors: 'Featured creators & coaches',
      community: 'The Idea Vibes community',
      communityQuote: 'Build your creative practice alongside mentors who teach what they ship.',
    },
    categories: [
      { id: 'design', label: 'Design' },
      { id: 'innovation', label: 'Innovation' },
      { id: 'storytelling', label: 'Storytelling' },
      { id: 'product', label: 'Product' },
      { id: 'branding', label: 'Branding' },
      { id: 'collaboration', label: 'Collaboration' },
    ],
    cta: {
      title: 'Create, learn, and grow',
      lead: 'Enroll in a cohort or publish your own creative program on {{tenantName}}.',
      buttonLabel: 'Join Idea Vibes',
    },
    footer: {
      tagline: 'Creative learning marketplace powered by LuxGen.',
    },
  },
  theme: {
    accentColor: '#7C3AED',
    warmAccentColor: '#F59E0B',
  },
};
