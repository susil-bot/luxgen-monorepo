import { User, IUser, UserRole, UserStatus, IUserPermissions } from '@luxgen/db';
import { Tenant } from '@luxgen/db';
import { hashPassword } from '@luxgen/auth';
import { logger } from '../utils/logger';

export interface UserRegistrationData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  tenantId: string;
  invitedBy?: string;
  metadata?: {
    preferences?: {
      theme?: 'light' | 'dark' | 'auto';
      notifications?: boolean;
      language?: string;
    };
  };
}

export interface UserRegistrationResult {
  success: boolean;
  user?: IUser;
  message: string;
  errors?: Record<string, string>;
}

export class UserRegistrationService {
  /**
   * Register a new user with role and tenant mapping
   */
  static async registerUser(data: UserRegistrationData): Promise<UserRegistrationResult> {
    try {
      // Validate tenant exists
      const tenant = await Tenant.findById(data.tenantId);
      if (!tenant) {
        return {
          success: false,
          message: 'Invalid tenant',
          errors: { tenant: 'Tenant not found' }
        };
      }

      // Check if user already exists
      const existingUser = await User.findOne({ 
        email: data.email.toLowerCase().trim() 
      });
      
      if (existingUser) {
        return {
          success: false,
          message: 'User already exists',
          errors: { email: 'Email is already registered' }
        };
      }

      // Validate role assignment
      const roleValidation = await this.validateRoleAssignment(
        data.role, 
        data.tenantId, 
        data.invitedBy
      );
      
      if (!roleValidation.valid) {
        return {
          success: false,
          message: 'Invalid role assignment',
          errors: { role: roleValidation.reason }
        };
      }

      // Hash password
      const hashedPassword = await hashPassword(data.password);

      // Set default permissions based on role
      const defaultPermissions = this.getDefaultPermissions(data.role);

      // Create user metadata
      const metadata = {
        lastLogin: null,
        loginCount: 0,
        preferences: {
          theme: data.metadata?.preferences?.theme || 'light',
          notifications: data.metadata?.preferences?.notifications ?? true,
          language: data.metadata?.preferences?.language || 'en',
        },
        permissions: defaultPermissions,
        tenantRoles: [{
          tenantId: data.tenantId,
          role: data.role,
          assignedBy: data.invitedBy || data.tenantId, // Use tenant as fallback
          assignedAt: new Date(),
        }],
      };

      // Create new user
      const newUser = new User({
        email: data.email.toLowerCase().trim(),
        password: hashedPassword,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        role: data.role,
        status: this.getInitialStatus(data.role),
        tenant: data.tenantId,
        isActive: true,
        metadata,
      });

      await newUser.save();
      await newUser.populate('tenant');

      logger.info(`User registered: ${newUser.email} with role ${newUser.role} in tenant ${tenant.name}`);

      return {
        success: true,
        user: newUser,
        message: 'User registered successfully'
      };

    } catch (error) {
      logger.error('User registration error:', error);
      return {
        success: false,
        message: 'Registration failed',
        errors: { general: 'Internal server error' }
      };
    }
  }

  /**
   * Validate if a role can be assigned
   */
  private static async validateRoleAssignment(
    role: UserRole, 
    tenantId: string, 
    invitedBy?: string
  ): Promise<{ valid: boolean; reason?: string }> {
    // Super admin can only be assigned by existing super admins
    if (role === UserRole.SUPER_ADMIN) {
      if (!invitedBy) {
        return { valid: false, reason: 'Super admin role requires invitation from existing super admin' };
      }
      
      const inviter = await User.findById(invitedBy);
      if (!inviter || inviter.role !== UserRole.SUPER_ADMIN) {
        return { valid: false, reason: 'Only super admins can assign super admin role' };
      }
    }

    // Admin role requires invitation from super admin or admin
    if (role === UserRole.ADMIN) {
      if (invitedBy) {
        const inviter = await User.findById(invitedBy);
        if (!inviter || (inviter.role !== UserRole.SUPER_ADMIN && inviter.role !== UserRole.ADMIN)) {
          return { valid: false, reason: 'Admin role requires invitation from super admin or admin' };
        }
      }
    }

    // Check if tenant already has an admin (for first admin assignment)
    if (role === UserRole.ADMIN) {
      const existingAdmin = await User.findOne({ 
        tenant: tenantId, 
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE 
      });
      
      if (!existingAdmin && !invitedBy) {
        // First admin in tenant - this is allowed
        return { valid: true };
      }
    }

    return { valid: true };
  }

  /**
   * Get default permissions for a role
   */
  private static getDefaultPermissions(role: UserRole): IUserPermissions {
    const permissions: IUserPermissions = {
      canManageUsers: false,
      canManageTenants: false,
      canManageCourses: false,
      canManageGroups: false,
      canViewReports: false,
      canManageSettings: false,
      canInviteUsers: false,
      canApproveRequests: false,
    };

    switch (role) {
      case UserRole.SUPER_ADMIN:
        permissions.canManageUsers = true;
        permissions.canManageTenants = true;
        permissions.canManageCourses = true;
        permissions.canManageGroups = true;
        permissions.canViewReports = true;
        permissions.canManageSettings = true;
        permissions.canInviteUsers = true;
        permissions.canApproveRequests = true;
        break;
      
      case UserRole.ADMIN:
        permissions.canManageUsers = true;
        permissions.canManageCourses = true;
        permissions.canManageGroups = true;
        permissions.canViewReports = true;
        permissions.canManageSettings = true;
        permissions.canInviteUsers = true;
        permissions.canApproveRequests = true;
        break;
      
      case UserRole.USER:
        // Users have minimal permissions by default
        break;
    }

    return permissions;
  }

  /**
   * Get initial status for a role
   */
  private static getInitialStatus(role: UserRole): UserStatus {
    // Super admins and admins are active immediately
    if (role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN) {
      return UserStatus.ACTIVE;
    }
    
    // Students and instructors need approval
    return UserStatus.PENDING;
  }

  /**
   * Update user role and permissions
   */
  static async updateUserRole(
    userId: string, 
    newRole: UserRole, 
    updatedBy: string,
    tenantId: string
  ): Promise<UserRegistrationResult> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          errors: { user: 'User does not exist' }
        };
      }

      // Validate role change
      const roleValidation = await this.validateRoleAssignment(newRole, tenantId, updatedBy);
      if (!roleValidation.valid) {
        return {
          success: false,
          message: 'Invalid role assignment',
          errors: { role: roleValidation.reason }
        };
      }

      // Update user role and permissions
      user.role = newRole;
      user.metadata.permissions = this.getDefaultPermissions(newRole);
      
      // Add to tenant roles if not already present
      const existingTenantRole = user.metadata.tenantRoles.find(
        tr => tr.tenantId.toString() === tenantId
      );
      
      if (existingTenantRole) {
        existingTenantRole.role = newRole;
        existingTenantRole.assignedBy = updatedBy;
        existingTenantRole.assignedAt = new Date();
      } else {
        user.metadata.tenantRoles.push({
          tenantId: tenantId as any,
          role: newRole,
          assignedBy: updatedBy as any,
          assignedAt: new Date(),
        });
      }

      await user.save();

      logger.info(`User role updated: ${user.email} to ${newRole} by ${updatedBy}`);

      return {
        success: true,
        user,
        message: 'User role updated successfully'
      };

    } catch (error) {
      logger.error('User role update error:', error);
      return {
        success: false,
        message: 'Role update failed',
        errors: { general: 'Internal server error' }
      };
    }
  }

  /**
   * Activate user account
   */
  static async activateUser(userId: string, activatedBy: string): Promise<UserRegistrationResult> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          errors: { user: 'User does not exist' }
        };
      }

      user.status = UserStatus.ACTIVE;
      await user.save();

      logger.info(`User activated: ${user.email} by ${activatedBy}`);

      return {
        success: true,
        user,
        message: 'User activated successfully'
      };

    } catch (error) {
      logger.error('User activation error:', error);
      return {
        success: false,
        message: 'User activation failed',
        errors: { general: 'Internal server error' }
      };
    }
  }
}
