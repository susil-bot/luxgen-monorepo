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

const errMsg = (e: unknown) => (e instanceof Error ? e.message : undefined);

export const requireRole = (requiredRole: UserRole) => {
  return async (req: RoleManagementRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          error: 'User not authenticated',
        });
      }

      if (req.user.role !== requiredRole) {
        logger.warn(
          `Access denied: User ${req.user.email} (${req.user.role}) attempted to access ${requiredRole} resource`,
        );
        return res.status(403).json({
          success: false,
          message: 'Insufficient privileges',
          error: `Required role: ${requiredRole}, User role: ${req.user.role}`,
        });
      }

      if (req.user.status !== UserStatus.ACTIVE) {
        return res.status(403).json({
          success: false,
          message: 'Account is not active',
          error: `User status: ${req.user.status}`,
        });
      }

      req.requiredRole = requiredRole;
      next();
    } catch (error) {
      logger.error('Role middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during role verification',
        error: process.env.NODE_ENV === 'development' ? errMsg(error) : undefined,
      });
    }
  };
};

export const requirePermissions = (requiredPermissions: string[]) => {
  return async (req: RoleManagementRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          error: 'User not authenticated',
        });
      }

      const hasAllPermissions = requiredPermissions.every((permission) =>
        hasPermission(req.user!.role as any, permission),
      );

      if (!hasAllPermissions) {
        logger.warn(
          `Access denied: User ${req.user.email} lacks required permissions: ${requiredPermissions.join(', ')}`,
        );
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
          error: `Required permissions: ${requiredPermissions.join(', ')}`,
        });
      }

      req.requiredPermissions = requiredPermissions;
      next();
    } catch (error) {
      logger.error('Permission middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during permission verification',
        error: process.env.NODE_ENV === 'development' ? errMsg(error) : undefined,
      });
    }
  };
};

export const canManageUsers = async (req: RoleManagementRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'User not authenticated',
      });
    }

    if (req.user.role === UserRole.SUPER_ADMIN) {
      return next();
    }

    if (req.user.role === UserRole.ADMIN) {
      const targetUserId = req.params.userId || req.body.userId;
      if (targetUserId) {
        const targetUser = await User.findById(targetUserId);
        if (!targetUser) {
          return res.status(404).json({
            success: false,
            message: 'User not found',
            error: 'Target user does not exist',
          });
        }

        if (targetUser.tenant.toString() !== req.user.tenant.toString()) {
          return res.status(403).json({
            success: false,
            message: 'Cannot manage users from other tenants',
            error: 'Cross-tenant user management not allowed',
          });
        }
      }
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Insufficient privileges to manage users',
      error: `Role ${req.user.role} cannot manage users`,
    });
  } catch (error) {
    logger.error('User management middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during user management verification',
      error: process.env.NODE_ENV === 'development' ? errMsg(error) : undefined,
    });
  }
};

export const canManageTenants = async (req: RoleManagementRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'User not authenticated',
      });
    }

    if (req.user.role !== UserRole.SUPER_ADMIN) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient privileges to manage tenants',
        error: `Role ${req.user.role} cannot manage tenants`,
      });
    }

    next();
  } catch (error) {
    logger.error('Tenant management middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during tenant management verification',
      error: process.env.NODE_ENV === 'development' ? errMsg(error) : undefined,
    });
  }
};

export const canInviteUsers = async (req: RoleManagementRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'User not authenticated',
      });
    }

    if (!hasPermission(req.user.role as any, 'invite:send')) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient privileges to invite users',
        error: `Role ${req.user.role} cannot invite users`,
      });
    }

    next();
  } catch (error) {
    logger.error('User invitation middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during invitation verification',
      error: process.env.NODE_ENV === 'development' ? errMsg(error) : undefined,
    });
  }
};

export const canApproveRequests = async (req: RoleManagementRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'User not authenticated',
      });
    }

    if (!hasPermission(req.user.role as any, 'request:approve')) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient privileges to approve requests',
        error: `Role ${req.user.role} cannot approve requests`,
      });
    }

    next();
  } catch (error) {
    logger.error('Request approval middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during approval verification',
      error: process.env.NODE_ENV === 'development' ? errMsg(error) : undefined,
    });
  }
};

export const requireTenantAccess = async (req: RoleManagementRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'User not authenticated',
      });
    }

    const requestedTenant = req.params.tenantId || req.query.tenantId || req.body.tenantId;

    if (req.user.role === UserRole.SUPER_ADMIN) {
      req.tenantContext = requestedTenant || req.user.tenant.toString();
      return next();
    }

    if (requestedTenant && requestedTenant !== req.user.tenant.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to requested tenant',
        error: 'Cannot access resources from other tenants',
      });
    }

    req.tenantContext = req.user.tenant.toString();
    next();
  } catch (error) {
    logger.error('Tenant access middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during tenant access verification',
      error: process.env.NODE_ENV === 'development' ? errMsg(error) : undefined,
    });
  }
};

export const logRoleAccess = (resource: string) => {
  return (req: RoleManagementRequest, res: Response, next: NextFunction) => {
    if (req.user) {
      logger.info(`Role access: User ${req.user.email} (${req.user.role}) accessing ${resource}`);
    }
    next();
  };
};
