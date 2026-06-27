import { Request, Response, NextFunction } from 'express';
import { mcpApiKeyService } from '../services/mcpApiKeyService';
import { isAccountActive } from '../utils/accountStatus';

/** Resolve x-mcp-api-key when no JWT session is present. */
export const mcpApiKeyMiddleware = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    if (req.user) return next();

    const rawKey = req.get('x-mcp-api-key')?.trim();
    if (!rawKey) return next();

    const verified = await mcpApiKeyService.verifyRawKey(rawKey);
    if (!verified) {
      req.authError = 'INVALID_TOKEN';
      return next();
    }

    const headerTenant = req.get('x-tenant')?.trim() || req.subdomain || req.tenant?.subdomain;
    const tenantMatches =
      verified.tenantId === req.tenantId ||
      verified.tenantId === headerTenant ||
      (req.tenant && String(req.tenant._id) === verified.tenantId && headerTenant === req.tenant.subdomain);

    if (headerTenant && !tenantMatches) {
      req.authError = 'TENANT_MISMATCH';
      return next();
    }

    const owner = await mcpApiKeyService.loadKeyOwnerUser(verified.createdByUserId);
    if (!owner || !isAccountActive(owner)) {
      req.authError = 'INVALID_TOKEN';
      return next();
    }

    req.user = owner;
    req.mcpApiKey = verified;
    if (!req.tenantId) req.tenantId = verified.tenantId;
    next();
  } catch {
    req.authError = 'INVALID_TOKEN';
    next();
  }
};
