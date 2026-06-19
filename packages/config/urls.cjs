/**
 * CommonJS URL helpers for next.config.js and other non-TS entrypoints.
 * Defaults match packages/config/src/url-defaults.ts — override via .env
 */
function trimUrl(url) {
  return url.replace(/\/+$/, '');
}

function env(key) {
  return process.env[key];
}

function webUrl() {
  return trimUrl(
    env('WEB_APP_URL') ||
      env('NEXT_PUBLIC_APP_URL') ||
      env('NEXT_PUBLIC_BASE_URL') ||
      env('CORS_ORIGIN') ||
      'http://localhost:3000',
  );
}

function apiUrl() {
  return trimUrl(env('API_URL') || env('NEXT_PUBLIC_API_URL') || 'http://localhost:4000');
}

function graphqlUrl() {
  return trimUrl(env('GRAPHQL_URL') || env('NEXT_PUBLIC_GRAPHQL_URL') || `${apiUrl()}/graphql`);
}

module.exports = { webUrl, apiUrl, graphqlUrl, trimUrl };
