import { Request, Response, NextFunction } from 'express';
import { UserRole, UserStatus, hasPermission } from '@luxgen/auth';
import { User, IUser } from '@luxgen/db';
import { logger } from '../utils/logger';

export interface RoleManagementRequest extends Request {
  user?: IUser;
  requiredRole?: UserRole;
  requiredPermissions?: string[];
  tenantContext?: string;
}

/**
 * Middleware to check if user has required role
 */
export const requireRole = (requiredRole: UserRole) => {
  return async (req: RoleManagementRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          error: 'User not authenticated'
        });
      }

      // Check if user has the required role
      if (req.user.role !== requiredRole) {
        logger.warn(`Access denied: User ${req.user.email} (${req.user.role}) attempted to access ${requiredRole} resource`);
        return res.status(403).json({
          success: false,
          message: 'Insufficient privileges',
          error: `Required role: ${requiredRole}, User role: ${req.user.role}`
        });
      }

      // Check if user is active
      if (req.user.status !== UserStatus.ACTIVE) {
        return res.status(403).json({
          success: false,
          message: 'Account is not active',
          error: `User status: ${req.user.status}`
        });
      }

      req.requiredRole = requiredRole;
      next();
    } catch (error) {
      logger.error('Role middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during role verification',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
};

/**
 * Middleware to check if user has required permissions
 */
export const requirePermissions = (requiredPermissions: string[]) => {
  return async (req: RoleManagementRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          error: 'User not authenticated'
        });
      }

      // Check if user has all required permissions
      const hasAllPermissions = requiredPermissions.every(permission => 
        hasPermission(req.user!.role, permission)
      );

      if (!hasAllPermissions) {
        logger.warn(`Access denied: User ${req.user.email} lacks required permissions: ${requiredPermissions.join(', ')}`);
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
          error: `Required permissions: ${requiredPermissions.join(', ')}`
        });
      }

      req.requiredPermissions = requiredPermissions;
      next();
    } catch (error) {
      logger.error('Permission middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during permission verification',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
};

/**
 * Middleware to check if user can manage other users
 */
export const canManageUsers = async (req: RoleManagementRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'User not authenticated'
      });
    }

    // Super admins can manage all users
    if (req.user.role === UserRole.SUPER_ADMIN) {
      return next();
    }

    // Admins can manage users in their tenant
    if (req.user.role === UserRole.ADMIN) {
      const targetUserId = req.params.userId || req.body.userId;
      if (targetUserId) {
        const targetUser = await User.findById(targetUserId);
        if (!targetUser) {
          return res.status(404).json({
            success: false,
            message: 'User not found',
            error: 'Target user does not exist'
          });
        }

        // Check if target user is in the same tenant
        if (targetUser.tenant.toString() !== req.user.tenant.toString()) {
          return res.status(403).json({
            success: false,
            message: 'Cannot manage users from other tenants',
            error: 'Cross-tenant user management not allowed'
          });
        }
      }
      return next();
    }

    // Other roles cannot manage users
    return res.status(403).json({
      success: false,
      message: 'Insufficient privileges to manage users',
      error: `Role ${req.user.role} cannot manage users`
    });
  } catch (error) {
    logger.error('User management middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during user management verification',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Middleware to check if user can manage tenants
 */
export const canManageTenants = async (req: RoleManagementRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'User not authenticated'
      });
    }

    // Only super admins can manage tenants
    if (req.user.role !== UserRole.SUPER_ADMIN) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient privileges to manage tenants',
        error: `Role ${req.user.role} cannot manage tenants`
      });
    }

    next();
  } catch (error) {
    logger.error('Tenant management middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during tenant management verification',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Middleware to check if user can invite other users
 */
export const canInviteUsers = async (req: RoleManagementRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'User not authenticated'
      });
    }

    // Check if user has invite permission
    if (!hasPermission(req.user.role, 'invite:send')) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient privileges to invite users',
        error: `Role ${req.user.role} cannot invite users`
      });
    }

    next();
  } catch (error) {
    logger.error('User invitation middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during invitation verification',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Middleware to check if user can approve requests
 */
export const canApproveRequests = async (req: RoleManagementRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'User not authenticated'
      });
    }

    // Check if user has approval permission
    if (!hasPermission(req.user.role, 'request:approve')) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient privileges to approve requests',
        error: `Role ${req.user.role} cannot approve requests`
      });
    }

    next();
  } catch (error) {
    logger.error('Request approval middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during approval verification',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Middleware to check if user can access tenant-specific resources
 */
export const requireTenantAccess = async (req: RoleManagementRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'User not authenticated'
      });
    }

    const requestedTenant = req.params.tenantId || req.query.tenantId || req.body.tenantId;
    
    // Super admins can access all tenants
    if (req.user.role === UserRole.SUPER_ADMIN) {
      req.tenantContext = requestedTenant || req.user.tenant.toString();
      return next();
    }

    // Other users can only access their own tenant
    if (requestedTenant && requestedTenant !== req.user.tenant.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to requested tenant',
        error: 'Cannot access resources from other tenants'
      });
    }

    req.tenantContext = req.user.tenant.toString();
    next();
  } catch (error) {
    logger.error('Tenant access middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during tenant access verification',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Middleware to log role-based access attempts
 */
export const logRoleAccess = (resource: string) => {
  return (req: RoleManagementRequest, res: Response, next: NextFunction) => {
    if (req.user) {
      logger.info(`Role access: User ${req.user.email} (${req.user.role}) accessing ${resource}`);
    }
    next();
  };
};
