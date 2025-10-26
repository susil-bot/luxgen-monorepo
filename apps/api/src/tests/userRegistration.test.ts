import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { UserRegistrationService } from '../services/userRegistrationService';
import { User, UserRole, UserStatus } from '@luxgen/db';
import { Tenant } from '@luxgen/db';
import { hashPassword } from '@luxgen/auth';

// Mock dependencies
jest.mock('@luxgen/db');
jest.mock('@luxgen/auth');

describe('UserRegistrationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('registerUser', () => {
    it('should register a new student user successfully', async () => {
      const mockTenant = {
        _id: 'tenant123',
        name: 'Test Tenant',
        subdomain: 'test'
      };

      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.USER,
        status: UserStatus.PENDING,
        tenant: 'tenant123',
        isActive: true,
        metadata: {
          lastLogin: null,
          loginCount: 0,
          preferences: {
            theme: 'light',
            notifications: true,
            language: 'en'
          },
          permissions: {
            canManageUsers: false,
            canManageTenants: false,
            canManageCourses: false,
            canManageGroups: false,
            canViewReports: false,
            canManageSettings: false,
            canInviteUsers: false,
            canApproveRequests: false
          },
          tenantRoles: [{
            tenantId: 'tenant123',
            role: UserRole.USER,
            assignedBy: 'tenant123',
            assignedAt: expect.any(Date)
          }]
        },
        save: jest.fn().mockResolvedValue(true),
        populate: jest.fn().mockResolvedValue(true)
      };

      (Tenant.findById as jest.Mock).mockResolvedValue(mockTenant);
      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User as any).mockImplementation(() => mockUser);
      (hashPassword as jest.Mock).mockResolvedValue('hashedPassword');

      const result = await UserRegistrationService.registerUser({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.USER,
        tenantId: 'tenant123'
      });

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user?.role).toBe(UserRole.STUDENT);
      expect(result.user?.status).toBe(UserStatus.PENDING);
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should register a new admin user successfully', async () => {
      const mockTenant = {
        _id: 'tenant123',
        name: 'Test Tenant',
        subdomain: 'test'
      };

      const mockUser = {
        _id: 'user123',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        tenant: 'tenant123',
        isActive: true,
        metadata: {
          permissions: {
            canManageUsers: true,
            canManageTenants: false,
            canManageCourses: true,
            canManageGroups: true,
            canViewReports: true,
            canManageSettings: true,
            canInviteUsers: true,
            canApproveRequests: true
          }
        },
        save: jest.fn().mockResolvedValue(true),
        populate: jest.fn().mockResolvedValue(true)
      };

      (Tenant.findById as jest.Mock).mockResolvedValue(mockTenant);
      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User as any).mockImplementation(() => mockUser);
      (hashPassword as jest.Mock).mockResolvedValue('hashedPassword');

      const result = await UserRegistrationService.registerUser({
        email: 'admin@example.com',
        password: 'password123',
        firstName: 'Admin',
        lastName: 'User',
        role: UserRole.ADMIN,
        tenantId: 'tenant123'
      });

      expect(result.success).toBe(true);
      expect(result.user?.role).toBe(UserRole.ADMIN);
      expect(result.user?.status).toBe(UserStatus.ACTIVE);
    });

    it('should fail if tenant does not exist', async () => {
      (Tenant.findById as jest.Mock).mockResolvedValue(null);

      const result = await UserRegistrationService.registerUser({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.USER,
        tenantId: 'invalid-tenant'
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid tenant');
      expect(result.errors?.tenant).toBe('Tenant not found');
    });

    it('should fail if user already exists', async () => {
      const mockTenant = { _id: 'tenant123' };
      const existingUser = { _id: 'existing123', email: 'test@example.com' };

      (Tenant.findById as jest.Mock).mockResolvedValue(mockTenant);
      (User.findOne as jest.Mock).mockResolvedValue(existingUser);

      const result = await UserRegistrationService.registerUser({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.USER,
        tenantId: 'tenant123'
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe('User already exists');
      expect(result.errors?.email).toBe('Email is already registered');
    });

    it('should fail if super admin role is assigned without invitation', async () => {
      const mockTenant = { _id: 'tenant123' };

      (Tenant.findById as jest.Mock).mockResolvedValue(mockTenant);
      (User.findOne as jest.Mock).mockResolvedValue(null);

      const result = await UserRegistrationService.registerUser({
        email: 'superadmin@example.com',
        password: 'password123',
        firstName: 'Super',
        lastName: 'Admin',
        role: UserRole.SUPER_ADMIN,
        tenantId: 'tenant123'
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid role assignment');
      expect(result.errors?.role).toBe('Super admin role requires invitation from existing super admin');
    });

    it('should handle registration errors gracefully', async () => {
      (Tenant.findById as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await UserRegistrationService.registerUser({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.USER,
        tenantId: 'tenant123'
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Registration failed');
      expect(result.errors?.general).toBe('Internal server error');
    });
  });

  describe('updateUserRole', () => {
    it('should update user role successfully', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        role: UserRole.USER,
        metadata: {
          permissions: {},
          tenantRoles: []
        },
        save: jest.fn().mockResolvedValue(true)
      };

      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      const result = await UserRegistrationService.updateUserRole(
        'user123',
        UserRole.INSTRUCTOR,
        'admin123',
        'tenant123'
      );

      expect(result.success).toBe(true);
      expect(result.user?.role).toBe(UserRole.INSTRUCTOR);
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should fail if user does not exist', async () => {
      (User.findById as jest.Mock).mockResolvedValue(null);

      const result = await UserRegistrationService.updateUserRole(
        'invalid-user',
        UserRole.INSTRUCTOR,
        'admin123',
        'tenant123'
      );

      expect(result.success).toBe(false);
      expect(result.message).toBe('User not found');
      expect(result.errors?.user).toBe('User does not exist');
    });

    it('should fail if super admin role is assigned by non-super admin', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        role: UserRole.USER,
        metadata: { permissions: {}, tenantRoles: [] },
        save: jest.fn()
      };

      const mockInviter = {
        _id: 'admin123',
        role: UserRole.ADMIN
      };

      (User.findById as jest.Mock)
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockInviter);

      const result = await UserRegistrationService.updateUserRole(
        'user123',
        UserRole.SUPER_ADMIN,
        'admin123',
        'tenant123'
      );

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid role assignment');
      expect(result.errors?.role).toBe('Only super admins can assign super admin role');
    });
  });

  describe('activateUser', () => {
    it('should activate user successfully', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        status: UserStatus.PENDING,
        save: jest.fn().mockResolvedValue(true)
      };

      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      const result = await UserRegistrationService.activateUser('user123', 'admin123');

      expect(result.success).toBe(true);
      expect(result.user?.status).toBe(UserStatus.ACTIVE);
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should fail if user does not exist', async () => {
      (User.findById as jest.Mock).mockResolvedValue(null);

      const result = await UserRegistrationService.activateUser('invalid-user', 'admin123');

      expect(result.success).toBe(false);
      expect(result.message).toBe('User not found');
      expect(result.errors?.user).toBe('User does not exist');
    });

    it('should handle activation errors gracefully', async () => {
      (User.findById as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await UserRegistrationService.activateUser('user123', 'admin123');

      expect(result.success).toBe(false);
      expect(result.message).toBe('User activation failed');
      expect(result.errors?.general).toBe('Internal server error');
    });
  });
});
