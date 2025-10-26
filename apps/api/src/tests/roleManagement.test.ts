import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { 
  requireRole, 
  requirePermissions, 
  canManageUsers, 
  canManageTenants,
  canInviteUsers,
  canApproveRequests,
  requireTenantAccess,
  logRoleAccess
} from '../middleware/roleManagement';
import { UserRole, UserStatus, hasPermission } from '@luxgen/auth';
import { User } from '@luxgen/db';

// Mock dependencies
jest.mock('@luxgen/auth');
jest.mock('@luxgen/db');

describe('Role Management Middleware', () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      user: null,
      params: {},
      query: {},
      body: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('requireRole', () => {
    it('should allow access for user with required role', async () => {
      mockReq.user = {
        _id: 'user123',
        email: 'admin@example.com',
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE
      };

      const middleware = requireRole(UserRole.ADMIN);
      await middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should deny access for user without required role', async () => {
      mockReq.user = {
        _id: 'user123',
        email: 'student@example.com',
        role: UserRole.USER,
        status: UserStatus.ACTIVE
      };

      const middleware = requireRole(UserRole.ADMIN);
      await middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Insufficient privileges',
        error: 'Required role: ADMIN, User role: STUDENT'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should deny access for inactive user', async () => {
      mockReq.user = {
        _id: 'user123',
        email: 'admin@example.com',
        role: UserRole.ADMIN,
        status: UserStatus.INACTIVE
      };

      const middleware = requireRole(UserRole.ADMIN);
      await middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Account is not active',
        error: 'User status: INACTIVE'
      });
    });

    it('should deny access for unauthenticated user', async () => {
      const middleware = requireRole(UserRole.ADMIN);
      await middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authentication required',
        error: 'User not authenticated'
      });
    });

    it('should handle middleware errors gracefully', async () => {
      mockReq.user = {
        _id: 'user123',
        email: 'admin@example.com',
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE
      };

      // Mock an error in the middleware
      const middleware = requireRole(UserRole.ADMIN);
      jest.spyOn(mockReq.user, 'role', 'get').mockImplementation(() => {
        throw new Error('Test error');
      });

      await middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error during role verification',
        error: 'Test error'
      });
    });
  });

  describe('requirePermissions', () => {
    it('should allow access for user with required permissions', async () => {
      mockReq.user = {
        _id: 'user123',
        email: 'admin@example.com',
        role: UserRole.ADMIN
      };

      (hasPermission as jest.Mock).mockReturnValue(true);

      const middleware = requirePermissions(['user:read', 'user:write']);
      await middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should deny access for user without required permissions', async () => {
      mockReq.user = {
        _id: 'user123',
        email: 'student@example.com',
        role: UserRole.STUDENT
      };

      (hasPermission as jest.Mock).mockReturnValue(false);

      const middleware = requirePermissions(['user:read', 'user:write']);
      await middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Insufficient permissions',
        error: 'Required permissions: user:read, user:write'
      });
    });

    it('should deny access for unauthenticated user', async () => {
      const middleware = requirePermissions(['user:read']);
      await middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authentication required',
        error: 'User not authenticated'
      });
    });
  });

  describe('canManageUsers', () => {
    it('should allow super admin to manage any user', async () => {
      mockReq.user = {
        _id: 'superadmin123',
        email: 'superadmin@example.com',
        role: UserRole.SUPER_ADMIN,
        tenant: 'tenant123'
      };

      await canManageUsers(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should allow admin to manage users in same tenant', async () => {
      const mockTargetUser = {
        _id: 'target123',
        tenant: 'tenant123'
      };

      mockReq.user = {
        _id: 'admin123',
        email: 'admin@example.com',
        role: UserRole.ADMIN,
        tenant: 'tenant123'
      };
      mockReq.params.userId = 'target123';

      (User.findById as jest.Mock).mockResolvedValue(mockTargetUser);

      await canManageUsers(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should deny admin access to users in different tenant', async () => {
      const mockTargetUser = {
        _id: 'target123',
        tenant: 'different-tenant'
      };

      mockReq.user = {
        _id: 'admin123',
        email: 'admin@example.com',
        role: UserRole.ADMIN,
        tenant: 'tenant123'
      };
      mockReq.params.userId = 'target123';

      (User.findById as jest.Mock).mockResolvedValue(mockTargetUser);

      await canManageUsers(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Cannot manage users from other tenants',
        error: 'Cross-tenant user management not allowed'
      });
    });

    it('should deny student access to user management', async () => {
      mockReq.user = {
        _id: 'student123',
        email: 'student@example.com',
        role: UserRole.STUDENT
      };

      await canManageUsers(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Insufficient privileges to manage users',
        error: 'Role USER cannot manage users'
      });
    });

    it('should handle target user not found', async () => {
      mockReq.user = {
        _id: 'admin123',
        email: 'admin@example.com',
        role: UserRole.ADMIN,
        tenant: 'tenant123'
      };
      mockReq.params.userId = 'nonexistent';

      (User.findById as jest.Mock).mockResolvedValue(null);

      await canManageUsers(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not found',
        error: 'Target user does not exist'
      });
    });
  });

  describe('canManageTenants', () => {
    it('should allow super admin to manage tenants', async () => {
      mockReq.user = {
        _id: 'superadmin123',
        email: 'superadmin@example.com',
        role: UserRole.SUPER_ADMIN
      };

      await canManageTenants(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should deny admin access to tenant management', async () => {
      mockReq.user = {
        _id: 'admin123',
        email: 'admin@example.com',
        role: UserRole.ADMIN
      };

      await canManageTenants(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Insufficient privileges to manage tenants',
        error: 'Role ADMIN cannot manage tenants'
      });
    });
  });

  describe('canInviteUsers', () => {
    it('should allow user with invite permission', async () => {
      mockReq.user = {
        _id: 'admin123',
        email: 'admin@example.com',
        role: UserRole.ADMIN
      };

      (hasPermission as jest.Mock).mockReturnValue(true);

      await canInviteUsers(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should deny user without invite permission', async () => {
      mockReq.user = {
        _id: 'student123',
        email: 'student@example.com',
        role: UserRole.STUDENT
      };

      (hasPermission as jest.Mock).mockReturnValue(false);

      await canInviteUsers(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Insufficient privileges to invite users',
        error: 'Role USER cannot invite users'
      });
    });
  });

  describe('canApproveRequests', () => {
    it('should allow user with approval permission', async () => {
      mockReq.user = {
        _id: 'admin123',
        email: 'admin@example.com',
        role: UserRole.ADMIN
      };

      (hasPermission as jest.Mock).mockReturnValue(true);

      await canApproveRequests(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should deny user without approval permission', async () => {
      mockReq.user = {
        _id: 'student123',
        email: 'student@example.com',
        role: UserRole.STUDENT
      };

      (hasPermission as jest.Mock).mockReturnValue(false);

      await canApproveRequests(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Insufficient privileges to approve requests',
        error: 'Role USER cannot approve requests'
      });
    });
  });

  describe('requireTenantAccess', () => {
    it('should allow super admin to access any tenant', async () => {
      mockReq.user = {
        _id: 'superadmin123',
        email: 'superadmin@example.com',
        role: UserRole.SUPER_ADMIN,
        tenant: 'tenant123'
      };
      mockReq.params.tenantId = 'different-tenant';

      await requireTenantAccess(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockReq.tenantContext).toBe('different-tenant');
    });

    it('should allow user to access their own tenant', async () => {
      mockReq.user = {
        _id: 'user123',
        email: 'user@example.com',
        role: UserRole.USER,
        tenant: 'tenant123'
      };
      mockReq.params.tenantId = 'tenant123';

      await requireTenantAccess(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockReq.tenantContext).toBe('tenant123');
    });

    it('should deny user access to different tenant', async () => {
      mockReq.user = {
        _id: 'user123',
        email: 'user@example.com',
        role: UserRole.USER,
        tenant: 'tenant123'
      };
      mockReq.params.tenantId = 'different-tenant';

      await requireTenantAccess(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access denied to requested tenant',
        error: 'Cannot access resources from other tenants'
      });
    });

    it('should use user tenant when no specific tenant requested', async () => {
      mockReq.user = {
        _id: 'user123',
        email: 'user@example.com',
        role: UserRole.USER,
        tenant: 'tenant123'
      };

      await requireTenantAccess(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.tenantContext).toBe('tenant123');
    });
  });

  describe('logRoleAccess', () => {
    it('should log role access attempts', () => {
      const consoleSpy = jest.spyOn(console, 'info').mockImplementation();
      
      mockReq.user = {
        _id: 'user123',
        email: 'user@example.com',
        role: UserRole.STUDENT
      };

      const middleware = logRoleAccess('test resource');
      middleware(mockReq, mockRes, mockNext);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Role access: User user@example.com (STUDENT) accessing test resource'
      );
      expect(mockNext).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should handle missing user gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'info').mockImplementation();
      
      const middleware = logRoleAccess('test resource');
      middleware(mockReq, mockRes, mockNext);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Role access: User undefined (undefined) accessing test resource'
      );
      expect(mockNext).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });
});
