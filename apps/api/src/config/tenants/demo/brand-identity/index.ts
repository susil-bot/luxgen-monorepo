/**
 * Demo Tenant - Brand Identity Configuration
 * Logo, assets, and visual identity elements
 */

export const demoBrandIdentity = {
  // Logo configurations
  logo: {
    primary: {
      url: '/assets/logos/demo-logo-primary.svg',
      alt: 'Demo Platform Logo',
      width: 200,
      height: 60
    },
    secondary: {
      url: '/assets/logos/demo-logo-secondary.svg',
      alt: 'Demo Platform Secondary Logo',
      width: 150,
      height: 45
    },
    icon: {
      url: '/assets/logos/demo-icon.svg',
      alt: 'Demo Platform Icon',
      width: 32,
      height: 32
    },
    favicon: {
      url: '/assets/favicons/demo-favicon.ico',
      sizes: ['16x16', '32x32', '48x48']
    }
  },

  // Brand assets
  assets: {
    heroImage: '/assets/images/demo-hero.jpg',
    backgroundPattern: '/assets/patterns/demo-pattern.svg',
    placeholderImage: '/assets/images/demo-placeholder.jpg'
  },

  // Brand messaging
  messaging: {
    tagline: 'Professional Demo Platform',
    description: 'A comprehensive platform for professional demonstrations and presentations',
    valueProposition: 'Streamline your demo process with our professional platform',
    callToAction: {
      primary: 'Get Started',
      secondary: 'Learn More',
      tertiary: 'Contact Sales'
    }
  },

  // Brand voice and tone
  voice: {
    tone: 'professional',
    personality: ['confident', 'reliable', 'innovative', 'approachable'],
    writingStyle: {
      formality: 'professional',
      complexity: 'moderate',
      humor: 'minimal'
    }
  },

  // Social media branding
  social: {
    twitter: {
      handle: '@demo_platform',
      cardImage: '/assets/social/demo-twitter-card.jpg'
    },
    linkedin: {
      company: 'Demo Platform',
      logo: '/assets/social/demo-linkedin-logo.png'
    },
    facebook: {
      page: 'Demo Platform',
      coverImage: '/assets/social/demo-facebook-cover.jpg'
    }
  },

  // Brand guidelines
  guidelines: {
    logoUsage: {
      minSize: 120,
      clearSpace: 20,
      donts: [
        'Do not stretch or distort the logo',
        'Do not change the colors',
        'Do not add effects or shadows',
        'Do not place on busy backgrounds'
      ]
    },
    colorUsage: {
      primary: 'Use for main actions and primary elements',
      secondary: 'Use for secondary actions and supporting elements',
      accent: 'Use sparingly for highlights and call-to-actions'
    }
  }
};
