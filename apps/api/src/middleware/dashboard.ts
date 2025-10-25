import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { User } from '@luxgen/db';

export interface DashboardRequest extends Request {
  dashboardUser?: any;
  dashboardTenant?: string;
  dashboardPermissions?: string[];
}

/**
 * Middleware to authenticate dashboard access
 */
export const dashboardAuthMiddleware = async (
  req: DashboardRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      logger.warn('Dashboard access denied: No authenticated user');
      return res.status(401).json({ 
        error: 'Authentication required for dashboard access' 
      });
    }

    // Get user details from database
    const user = await User.findById(req.user.id).populate('tenant');
    if (!user) {
      logger.warn(`Dashboard access denied: User ${req.user.id} not found`);
      return res.status(401).json({ 
        error: 'User not found' 
      });
    }

    // Check if user is active
    if (!user.isActive) {
      logger.warn(`Dashboard access denied: User ${user.email} is inactive`);
      return res.status(403).json({ 
        error: 'Account is inactive' 
      });
    }

    // Set dashboard user and tenant
    req.dashboardUser = user;
    req.dashboardTenant = user.tenant.toString();
    req.dashboardPermissions = user.metadata?.permissions || [];

    logger.info(`Dashboard access granted for user ${user.email} in tenant ${req.dashboardTenant}`);
    next();
  } catch (error) {
    logger.error('Dashboard auth middleware error:', error);
    return res.status(500).json({ 
      error: 'Internal server error during authentication' 
    });
  }
};

/**
 * Middleware to check dashboard permissions
 */
export const dashboardPermissionMiddleware = (requiredPermissions: string[]) => {
  return (req: DashboardRequest, res: Response, next: NextFunction) => {
    try {
      const userPermissions = req.dashboardPermissions || [];
      
      // Check if user has required permissions
      const hasPermission = requiredPermissions.every(permission => 
        userPermissions.includes(permission) || userPermissions.includes('all')
      );

      if (!hasPermission) {
        logger.warn(`Dashboard permission denied: User ${req.dashboardUser?.email} lacks required permissions ${requiredPermissions.join(', ')}`);
        return res.status(403).json({ 
          error: 'Insufficient permissions for dashboard access' 
        });
      }

      next();
    } catch (error) {
      logger.error('Dashboard permission middleware error:', error);
      return res.status(500).json({ 
        error: 'Internal server error during permission check' 
      });
    }
  };
};

/**
 * Middleware to validate tenant access for dashboard
 */
export const dashboardTenantMiddleware = async (
  req: DashboardRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const requestedTenant = req.params.tenant || req.query.tenant || req.body.tenant;
    const userTenant = req.dashboardTenant;

    // If no specific tenant requested, use user's tenant
    if (!requestedTenant) {
      req.dashboardTenant = userTenant;
      return next();
    }

    // Check if user can access requested tenant
    if (requestedTenant !== userTenant) {
      // Check if user has cross-tenant permissions
      const hasCrossTenantAccess = req.dashboardPermissions?.includes('cross_tenant_access') || 
                                  req.dashboardPermissions?.includes('all');

      if (!hasCrossTenantAccess) {
        logger.warn(`Dashboard tenant access denied: User ${req.dashboardUser?.email} cannot access tenant ${requestedTenant}`);
        return res.status(403).json({ 
          error: 'Access denied to requested tenant' 
        });
      }
    }

    req.dashboardTenant = requestedTenant;
    next();
  } catch (error) {
    logger.error('Dashboard tenant middleware error:', error);
    return res.status(500).json({ 
      error: 'Internal server error during tenant validation' 
    });
  }
};

/**
 * Middleware to add dashboard headers
 */
export const dashboardHeadersMiddleware = (
  req: DashboardRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Add dashboard-specific headers
    res.setHeader('X-Dashboard-Tenant', req.dashboardTenant || '');
    res.setHeader('X-Dashboard-User', req.dashboardUser?.email || '');
    res.setHeader('X-Dashboard-Permissions', req.dashboardPermissions?.join(',') || '');
    
    // Add cache headers for dashboard data
    res.setHeader('Cache-Control', 'private, max-age=300'); // 5 minutes cache
    
    next();
  } catch (error) {
    logger.error('Dashboard headers middleware error:', error);
    next(); // Don't fail the request for header errors
  }
};

/**
 * Middleware to log dashboard access
 */
export const dashboardLoggingMiddleware = (
  req: DashboardRequest,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info(`Dashboard request: ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms - User: ${req.dashboardUser?.email} - Tenant: ${req.dashboardTenant}`);
  });
  
  next();
};
