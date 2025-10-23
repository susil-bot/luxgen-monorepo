import { Presenter } from '../Presenter';
import { PhaseSet } from '../PhaseSet';
import { createFetcher, createTransformer, createSliceTransformer, createFilterTransformer } from '../index';

/**
 * ArticlePresenter is a presenter plugin for article content type.
 * It handles fetching and transforming article data for display.
 */
export class ArticlePresenter extends Presenter {
  constructor() {
    const phaseSet = new PhaseSet(
      [
        // Fetchers
        createFetcher('articleData', async (workflowContext) => {
          const { request } = workflowContext;
          const articleId = request?.params?.id;
          
          if (!articleId) {
            throw new Error('Article ID is required');
          }

          // This would typically fetch from a CMS or database
          return {
            id: articleId,
            title: 'Sample Article Title',
            content: 'This is the article content...',
            excerpt: 'This is the article excerpt...',
            author: {
              name: 'John Doe',
              email: 'john@example.com',
              avatar: '/avatars/john.jpg',
            },
            publishedAt: '2024-01-15T10:00:00Z',
            updatedAt: '2024-01-15T10:00:00Z',
            tags: ['technology', 'web development', 'react'],
            category: 'Technology',
            featuredImage: '/images/article-featured.jpg',
            readTime: 5,
            views: 1234,
            likes: 42,
            comments: 8,
          };
        }),
        createFetcher('relatedArticles', async (workflowContext) => {
          const articleData = workflowContext.fetched.articleData;
          
          // This would typically fetch related articles from a database
          return [
            {
              id: '2',
              title: 'Related Article 1',
              excerpt: 'This is a related article...',
              publishedAt: '2024-01-14T10:00:00Z',
              readTime: 3,
              views: 567,
            },
            {
              id: '3',
              title: 'Related Article 2',
              excerpt: 'This is another related article...',
              publishedAt: '2024-01-13T10:00:00Z',
              readTime: 4,
              views: 890,
            },
          ];
        }),
        createFetcher('comments', async (workflowContext) => {
          const articleId = workflowContext.fetched.articleData?.id;
          
          if (!articleId) {
            return [];
          }

          // This would typically fetch comments from a database
          return [
            {
              id: '1',
              author: 'Jane Smith',
              content: 'Great article! Very informative.',
              publishedAt: '2024-01-15T11:00:00Z',
              likes: 5,
            },
            {
              id: '2',
              author: 'Bob Johnson',
              content: 'Thanks for sharing this knowledge.',
              publishedAt: '2024-01-15T12:00:00Z',
              likes: 3,
            },
          ];
        }),
      ],
      [
        // Transformers
        createTransformer('articleMeta', (workflowContext) => {
          const articleData = workflowContext.fetched.articleData;
          
          return {
            title: articleData.title,
            description: articleData.excerpt,
            author: articleData.author.name,
            publishedAt: articleData.publishedAt,
            updatedAt: articleData.updatedAt,
            tags: articleData.tags,
            category: articleData.category,
            readTime: articleData.readTime,
            views: articleData.views,
            likes: articleData.likes,
            comments: articleData.comments,
          };
        }),
        createSliceTransformer('topRelatedArticles', 'relatedArticles', 0, 3),
        createFilterTransformer('recentComments', 'comments', (comment) => {
          const commentDate = new Date(comment.publishedAt);
          const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          return commentDate > oneWeekAgo;
        }),
        createTransformer('articleContent', (workflowContext) => {
          const articleData = workflowContext.fetched.articleData;
          
          return {
            title: articleData.title,
            content: articleData.content,
            featuredImage: articleData.featuredImage,
            author: articleData.author,
            publishedAt: articleData.publishedAt,
            updatedAt: articleData.updatedAt,
            tags: articleData.tags,
            category: articleData.category,
            readTime: articleData.readTime,
            stats: {
              views: articleData.views,
              likes: articleData.likes,
              comments: articleData.comments,
            },
          };
        }),
      ]
    );

    super(
      'presenter-articles',
      '/articles/:id',
      'article',
      phaseSet,
      undefined,
      undefined
    );
  }
}

/**
 * ArticleComponent is the React component for displaying articles.
 * This would typically be a more complex component with proper styling.
 * Note: This is a placeholder - the actual component would be in a .tsx file
 */
export const ArticleComponent = () => {
  return null; // Placeholder for the actual component
};
