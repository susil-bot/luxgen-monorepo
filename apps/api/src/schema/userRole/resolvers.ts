import { User, UserRole, UserStatus, IUser } from '@luxgen/db';
import { Tenant } from '@luxgen/db';
import { UserRegistrationService } from '../../services/userRegistrationService';
import { logger } from '../../utils/logger';

export const userRoleResolvers = {
  Query: {
    getUsers: async (_: any, { tenantId, role, status, limit = 50, offset = 0 }: any, context: any) => {
      try {
        const query: any = {};
        
        if (tenantId) {
          query.tenant = tenantId;
        }
        
        if (role) {
          query.role = role;
        }
        
        if (status) {
          query.status = status;
        }

        const users = await User.find(query)
          .populate('tenant')
          .limit(limit)
          .skip(offset)
          .sort({ createdAt: -1 });

        return users;
      } catch (error) {
        logger.error('Error getting users:', error);
        throw new Error('Failed to fetch users');
      }
    },

    getUserById: async (_: any, { userId }: { userId: string }, context: any) => {
      try {
        const user = await User.findById(userId).populate('tenant');
        if (!user) {
          throw new Error('User not found');
        }
        return user;
      } catch (error) {
        logger.error('Error getting user by ID:', error);
        throw new Error('Failed to fetch user');
      }
    },

    getUsersByRole: async (_: any, { role, tenantId }: { role: UserRole; tenantId?: string }, context: any) => {
      try {
        const query: any = { role };
        
        if (tenantId) {
          query.tenant = tenantId;
        }

        const users = await User.find(query).populate('tenant');
        return users;
      } catch (error) {
        logger.error('Error getting users by role:', error);
        throw new Error('Failed to fetch users by role');
      }
    },

    getPendingUsers: async (_: any, { tenantId }: { tenantId?: string }, context: any) => {
      try {
        const query: any = { status: UserStatus.PENDING };
        
        if (tenantId) {
          query.tenant = tenantId;
        }

        const users = await User.find(query).populate('tenant');
        return users;
      } catch (error) {
        logger.error('Error getting pending users:', error);
        throw new Error('Failed to fetch pending users');
      }
    },

    getUserPermissions: async (_: any, { userId }: { userId: string }, context: any) => {
      try {
        const user = await User.findById(userId);
        if (!user) {
          throw new Error('User not found');
        }
        return user.metadata.permissions;
      } catch (error) {
        logger.error('Error getting user permissions:', error);
        throw new Error('Failed to fetch user permissions');
      }
    },

    getRoleAssignments: async (_: any, { userId }: { userId: string }, context: any) => {
      try {
        const user = await User.findById(userId);
        if (!user) {
          throw new Error('User not found');
        }
        
        // Convert tenant roles to role assignments
        const assignments = user.metadata.tenantRoles.map((tenantRole, index) => ({
          id: `${userId}-${index}`,
          user,
          newRole: tenantRole.role,
          previousRole: tenantRole.role, // This would need to be tracked separately
          assignedBy: tenantRole.assignedBy,
          assignedAt: tenantRole.assignedAt.toISOString(),
          reason: 'Role assignment'
        }));

        return assignments;
      } catch (error) {
        logger.error('Error getting role assignments:', error);
        throw new Error('Failed to fetch role assignments');
      }
    },

    getTenantAdmins: async (_: any, { tenantId }: { tenantId: string }, context: any) => {
      try {
        const admins = await User.find({
          tenant: tenantId,
          role: { $in: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
          status: UserStatus.ACTIVE
        }).populate('tenant');

        return admins;
      } catch (error) {
        logger.error('Error getting tenant admins:', error);
        throw new Error('Failed to fetch tenant admins');
      }
    },

    getUserInvitations: async (_: any, { tenantId, status }: { tenantId?: string; status?: string }, context: any) => {
      try {
        // This would need to be implemented with a separate invitations collection
        // For now, return empty array
        return [];
      } catch (error) {
        logger.error('Error getting user invitations:', error);
        throw new Error('Failed to fetch user invitations');
      }
    },
  },

  Mutation: {
    registerUser: async (_: any, { input }: { input: any }, context: any) => {
      try {
        const result = await UserRegistrationService.registerUser(input);
        return result;
      } catch (error) {
        logger.error('Error registering user:', error);
        return {
          success: false,
          message: 'Registration failed',
          errors: { general: 'Internal server error' }
        };
      }
    },

    inviteUser: async (_: any, { input }: { input: any }, context: any) => {
      try {
        // Generate temporary password
        const tempPassword = Math.random().toString(36).slice(-8);
        
        const registrationResult = await UserRegistrationService.registerUser({
          ...input,
          password: tempPassword
        });

        if (!registrationResult.success) {
          return {
            success: false,
            message: registrationResult.message,
            errors: registrationResult.errors
          };
        }

        return {
          success: true,
          message: 'User invited successfully',
          invitation: {
            id: registrationResult.user!._id,
            email: registrationResult.user!.email,
            firstName: registrationResult.user!.firstName,
            lastName: registrationResult.user!.lastName,
            role: registrationResult.user!.role,
            tenant: registrationResult.user!.tenant,
            invitedBy: input.invitedBy || context.user?._id,
            invitedAt: new Date().toISOString(),
            status: 'pending',
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
          },
          tempPassword
        };
      } catch (error) {
        logger.error('Error inviting user:', error);
        return {
          success: false,
          message: 'User invitation failed',
          errors: { general: 'Internal server error' }
        };
      }
    },

    updateUserRole: async (_: any, { input }: { input: any }, context: any) => {
      try {
        const result = await UserRegistrationService.updateUserRole(
          input.userId,
          input.newRole,
          context.user?._id,
          context.tenant
        );

        if (!result.success) {
          return {
            success: false,
            message: result.message,
            errors: result.errors
          };
        }

        return {
          success: true,
          message: 'User role updated successfully',
          assignment: {
            id: `${input.userId}-${Date.now()}`,
            user: result.user,
            newRole: input.newRole,
            previousRole: result.user!.role,
            assignedBy: context.user?._id,
            assignedAt: new Date().toISOString(),
            reason: input.reason || 'Role update'
          }
        };
      } catch (error) {
        logger.error('Error updating user role:', error);
        return {
          success: false,
          message: 'Role update failed',
          errors: { general: 'Internal server error' }
        };
      }
    },

    activateUser: async (_: any, { userId }: { userId: string }, context: any) => {
      try {
        const result = await UserRegistrationService.activateUser(userId, context.user?._id);
        return result;
      } catch (error) {
        logger.error('Error activating user:', error);
        return {
          success: false,
          message: 'User activation failed',
          errors: { general: 'Internal server error' }
        };
      }
    },

    deactivateUser: async (_: any, { userId }: { userId: string }, context: any) => {
      try {
        const user = await User.findById(userId);
        if (!user) {
          return {
            success: false,
            message: 'User not found',
            errors: { user: 'User does not exist' }
          };
        }

        user.status = UserStatus.INACTIVE;
        await user.save();

        return {
          success: true,
          message: 'User deactivated successfully',
          user
        };
      } catch (error) {
        logger.error('Error deactivating user:', error);
        return {
          success: false,
          message: 'User deactivation failed',
          errors: { general: 'Internal server error' }
        };
      }
    },

    suspendUser: async (_: any, { userId, reason }: { userId: string; reason?: string }, context: any) => {
      try {
        const user = await User.findById(userId);
        if (!user) {
          return {
            success: false,
            message: 'User not found',
            errors: { user: 'User does not exist' }
          };
        }

        user.status = UserStatus.SUSPENDED;
        await user.save();

        return {
          success: true,
          message: 'User suspended successfully',
          user
        };
      } catch (error) {
        logger.error('Error suspending user:', error);
        return {
          success: false,
          message: 'User suspension failed',
          errors: { general: 'Internal server error' }
        };
      }
    },

    updateUserPermissions: async (_: any, { userId, permissions }: { userId: string; permissions: any }, context: any) => {
      try {
        const user = await User.findById(userId);
        if (!user) {
          return {
            success: false,
            message: 'User not found',
            errors: { user: 'User does not exist' }
          };
        }

        user.metadata.permissions = { ...user.metadata.permissions, ...permissions };
        await user.save();

        return {
          success: true,
          message: 'User permissions updated successfully',
          user
        };
      } catch (error) {
        logger.error('Error updating user permissions:', error);
        return {
          success: false,
          message: 'Permission update failed',
          errors: { general: 'Internal server error' }
        };
      }
    },

    assignTenantRole: async (_: any, { userId, tenantId, role }: { userId: string; tenantId: string; role: UserRole }, context: any) => {
      try {
        const user = await User.findById(userId);
        if (!user) {
          return {
            success: false,
            message: 'User not found',
            errors: { user: 'User does not exist' }
          };
        }

        // Add or update tenant role
        const existingRoleIndex = user.metadata.tenantRoles.findIndex(
          tr => tr.tenantId.toString() === tenantId
        );

        if (existingRoleIndex >= 0) {
          user.metadata.tenantRoles[existingRoleIndex].role = role;
          user.metadata.tenantRoles[existingRoleIndex].assignedBy = context.user?._id;
          user.metadata.tenantRoles[existingRoleIndex].assignedAt = new Date();
        } else {
          user.metadata.tenantRoles.push({
            tenantId: tenantId as any,
            role,
            assignedBy: context.user?._id,
            assignedAt: new Date()
          });
        }

        await user.save();

        return {
          success: true,
          message: 'Tenant role assigned successfully',
          assignment: {
            id: `${userId}-${tenantId}`,
            user,
            newRole: role,
            previousRole: role,
            assignedBy: context.user?._id,
            assignedAt: new Date().toISOString(),
            reason: 'Tenant role assignment'
          }
        };
      } catch (error) {
        logger.error('Error assigning tenant role:', error);
        return {
          success: false,
          message: 'Tenant role assignment failed',
          errors: { general: 'Internal server error' }
        };
      }
    },

    removeTenantRole: async (_: any, { userId, tenantId }: { userId: string; tenantId: string }, context: any) => {
      try {
        const user = await User.findById(userId);
        if (!user) {
          return {
            success: false,
            message: 'User not found',
            errors: { user: 'User does not exist' }
          };
        }

        user.metadata.tenantRoles = user.metadata.tenantRoles.filter(
          tr => tr.tenantId.toString() !== tenantId
        );

        await user.save();

        return {
          success: true,
          message: 'Tenant role removed successfully',
          user
        };
      } catch (error) {
        logger.error('Error removing tenant role:', error);
        return {
          success: false,
          message: 'Tenant role removal failed',
          errors: { general: 'Internal server error' }
        };
      }
    },

    bulkUpdateUserRoles: async (_: any, { updates }: { updates: any[] }, context: any) => {
      try {
        const results = [];
        
        for (const update of updates) {
          const result = await UserRegistrationService.updateUserRole(
            update.userId,
            update.newRole,
            context.user?._id,
            context.tenant
          );
          results.push(result);
        }

        return results;
      } catch (error) {
        logger.error('Error bulk updating user roles:', error);
        return updates.map(() => ({
          success: false,
          message: 'Bulk role update failed',
          errors: { general: 'Internal server error' }
        }));
      }
    },
  },
};
