/** Dev fallbacks when URL env vars are unset — override via .env in each app. */
export const URL_DEFAULTS = {
  WEB: 'http://localhost:3000',
  API: 'http://localhost:4000',
  GRAPHQL: 'http://localhost:4000/graphql',
  OLLAMA: 'http://localhost:11434',
  MONGODB: 'mongodb://localhost:27017/luxgen',
  REDIS: 'redis://localhost:6379',
  APP_DOMAIN: 'localhost',
  WEB_PORT: '3000',
  API_PORT: '4000',
} as const;
