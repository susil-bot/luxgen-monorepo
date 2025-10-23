import { Plugin } from '../Plugin';
import { PhaseSet } from '../PhaseSet';
import { createFetcher, createTransformer } from '../index';

/**
 * HeadPlugin is a shared plugin that manages the HTML head section.
 * It fetches metadata and transforms it for the head component.
 */
export class HeadPlugin extends Plugin {
  constructor() {
    const phaseSet = new PhaseSet(
      [
        // Fetchers
        createFetcher('siteMetadata', async (workflowContext) => {
          return {
            title: 'Luxgen Monorepo',
            description: 'A comprehensive monorepo with UI components and plugin system',
            keywords: ['monorepo', 'ui', 'components', 'plugins'],
            author: 'Luxgen Team',
            siteUrl: process.env.SITE_URL || 'https://luxgen.com',
            ogImage: '/og-image.jpg',
            twitterCard: 'summary_large_image',
          };
        }),
        createFetcher('pageMetadata', async (workflowContext) => {
          const { request } = workflowContext;
          return {
            title: request?.title || 'Page Title',
            description: request?.description || 'Page Description',
            canonical: request?.canonical || workflowContext.fetched.siteMetadata?.siteUrl,
            robots: request?.robots || 'index,follow',
          };
        }),
      ],
      [
        // Transformers
        createTransformer('headData', (workflowContext) => {
          const siteMetadata = workflowContext.fetched.siteMetadata;
          const pageMetadata = workflowContext.fetched.pageMetadata;
          
          return {
            title: `${pageMetadata.title} | ${siteMetadata.title}`,
            description: pageMetadata.description || siteMetadata.description,
            keywords: siteMetadata.keywords.join(', '),
            author: siteMetadata.author,
            canonical: pageMetadata.canonical,
            robots: pageMetadata.robots,
            og: {
              title: pageMetadata.title,
              description: pageMetadata.description,
              url: pageMetadata.canonical,
              image: siteMetadata.ogImage,
              type: 'website',
            },
            twitter: {
              card: siteMetadata.twitterCard,
              title: pageMetadata.title,
              description: pageMetadata.description,
              image: siteMetadata.ogImage,
            },
          };
        }),
      ]
    );

    super('plugin-head', phaseSet);
  }
}
