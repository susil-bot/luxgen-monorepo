/** Demo tenant storefront bootstrap preset — merged into Mongo on init */
export const demoStorefrontBootstrap = {
  slug: 'mentors',
  landingEnabled: true,
  content: {
    hero: {
      headline: 'Professional training & mentorship on {{tenantName}}',
      subheadline:
        'Discover cohort programs, executive coaching, and self-paced courses from verified trainers on our demo workspace.',
    },
  },
  theme: {
    accentColor: '#1E40AF',
    warmAccentColor: '#059669',
  },
};
