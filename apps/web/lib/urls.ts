/**
 * Web app URL helpers — reads NEXT_PUBLIC_* / server env from .env.local
 * Canonical implementation: @luxgen/config/urls
 */
export {
  getWebUrl,
  getApiUrl,
  getGraphqlUrl,
  getClientGraphqlUrl,
  getGraphqlWsUrl,
  getClientGraphqlWsUrl,
  getOllamaUrl,
  getTenantDomain,
  getTenantWebOrigin,
  urls,
} from '@luxgen/config';
