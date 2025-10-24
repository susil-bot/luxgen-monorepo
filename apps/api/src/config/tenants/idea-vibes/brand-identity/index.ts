/**
 * Idea Vibes Tenant - Brand Identity Configuration
 * Creative visual identity and assets
 */

export const ideaVibesBrandIdentity = {
  // Logo configurations
  logo: {
    primary: {
      url: '/assets/logos/idea-vibes-logo-primary.svg',
      alt: 'Idea Vibes Logo',
      width: 250,
      height: 80
    },
    secondary: {
      url: '/assets/logos/idea-vibes-logo-secondary.svg',
      alt: 'Idea Vibes Secondary Logo',
      width: 180,
      height: 60
    },
    icon: {
      url: '/assets/logos/idea-vibes-icon.svg',
      alt: 'Idea Vibes Icon',
      width: 40,
      height: 40
    },
    favicon: {
      url: '/assets/favicons/idea-vibes-favicon.ico',
      sizes: ['16x16', '32x32', '48x48', '64x64']
    },
    animated: {
      url: '/assets/logos/idea-vibes-animated.svg',
      alt: 'Idea Vibes Animated Logo',
      width: 200,
      height: 60
    }
  },

  // Brand assets
  assets: {
    heroImage: '/assets/images/idea-vibes-hero.jpg',
    backgroundPattern: '/assets/patterns/idea-vibes-pattern.svg',
    placeholderImage: '/assets/images/idea-vibes-placeholder.jpg',
    illustrations: {
      creativity: '/assets/illustrations/creativity.svg',
      innovation: '/assets/illustrations/innovation.svg',
      collaboration: '/assets/illustrations/collaboration.svg',
      growth: '/assets/illustrations/growth.svg'
    },
    icons: {
      lightbulb: '/assets/icons/lightbulb.svg',
      rocket: '/assets/icons/rocket.svg',
      brain: '/assets/icons/brain.svg',
      sparkle: '/assets/icons/sparkle.svg'
    }
  },

  // Brand messaging
  messaging: {
    tagline: 'Where Ideas Come to Life',
    description: 'A vibrant platform for creative minds to collaborate, innovate, and bring ideas to reality',
    valueProposition: 'Transform your creative ideas into reality with our collaborative platform',
    callToAction: {
      primary: 'Start Creating',
      secondary: 'Join the Community',
      tertiary: 'Explore Ideas'
    },
    slogans: [
      'Ideas in Motion',
      'Creative Collaboration',
      'Innovation Hub',
      'Where Creativity Meets Technology'
    ]
  },

  // Brand voice and tone
  voice: {
    tone: 'creative',
    personality: ['energetic', 'inspiring', 'collaborative', 'innovative', 'playful'],
    writingStyle: {
      formality: 'casual',
      complexity: 'simple',
      humor: 'moderate',
      creativity: 'high'
    },
    keywords: [
      'creative',
      'innovative',
      'collaborative',
      'inspiring',
      'dynamic',
      'vibrant',
      'energetic',
      'fresh'
    ]
  },

  // Social media branding
  social: {
    twitter: {
      handle: '@idea_vibes',
      cardImage: '/assets/social/idea-vibes-twitter-card.jpg',
      bio: 'Where ideas come to life! 🚀✨ Join our creative community'
    },
    linkedin: {
      company: 'Idea Vibes',
      logo: '/assets/social/idea-vibes-linkedin-logo.png',
      description: 'Creative collaboration platform for innovators'
    },
    facebook: {
      page: 'Idea Vibes',
      coverImage: '/assets/social/idea-vibes-facebook-cover.jpg',
      description: 'A vibrant community for creative minds'
    },
    instagram: {
      handle: '@idea_vibes',
      profileImage: '/assets/social/idea-vibes-instagram.jpg',
      bio: '✨ Where creativity meets innovation 🚀'
    }
  },

  // Brand guidelines
  guidelines: {
    logoUsage: {
      minSize: 100,
      clearSpace: 30,
      donts: [
        'Do not alter the gradient colors',
        'Do not change the font',
        'Do not add effects beyond brand guidelines',
        'Do not place on busy backgrounds without proper contrast'
      ],
      dos: [
        'Use on solid backgrounds for best visibility',
        'Maintain aspect ratio',
        'Use the animated version for digital applications',
        'Ensure sufficient contrast'
      ]
    },
    colorUsage: {
      primary: 'Use for main brand elements and primary actions',
      secondary: 'Use for supporting elements and secondary actions',
      accent: 'Use for highlights, call-to-actions, and creative elements',
      creative: 'Use for special features and creative tools'
    },
    typography: {
      headings: 'Use Poppins for all headings and titles',
      body: 'Use Inter for body text and descriptions',
      creative: 'Use Space Grotesk for creative elements and special text'
    }
  },

  // Brand personality traits
  personality: {
    traits: [
      'Creative',
      'Innovative',
      'Collaborative',
      'Inspiring',
      'Energetic',
      'Playful',
      'Professional',
      'Approachable'
    ],
    values: [
      'Creativity',
      'Innovation',
      'Collaboration',
      'Community',
      'Growth',
      'Diversity',
      'Inclusion',
      'Excellence'
    ]
  }
};
