import { Context } from '../context';
import { ObjectId } from 'mongodb';

export class GroupService {
  // Get groups with pagination and filtering
  static async getGroups(
    context: Context,
    args: {
      first?: number;
      after?: string;
      last?: number;
      before?: string;
      search?: string;
      isActive?: boolean;
      createdBy?: string;
    }
  ) {
    const { db } = context;
    const { tenant } = context;

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const collection = db.collection('groups');
    let query: any = { tenant: tenant.id };

    // Apply filters
    if (args.search) {
      query.$or = [
        { name: { $regex: args.search, $options: 'i' } },
        { description: { $regex: args.search, $options: 'i' } },
      ];
    }

    if (args.isActive !== undefined) {
      query.isActive = args.isActive;
    }

    if (args.createdBy) {
      query.createdBy = new ObjectId(args.createdBy);
    }

    // Get total count
    const totalCount = await collection.countDocuments(query);

    // Apply pagination
    let cursor = args.after || args.before;
    if (cursor) {
      const cursorObj = await collection.findOne({ _id: new ObjectId(cursor) });
      if (cursorObj) {
        if (args.after) {
          query._id = { $gt: cursorObj._id };
        } else {
          query._id = { $lt: cursorObj._id };
        }
      }
    }

    // Apply sorting
    const sort = args.before ? { _id: -1 } : { _id: 1 };
    const limit = args.first || args.last || 10;

    const groups = await collection
      .find(query)
      .sort(sort)
      .limit(limit)
      .toArray();

    // Reverse if using before cursor
    if (args.before) {
      groups.reverse();
    }

    const edges = groups.map((group) => ({
      node: {
        id: group._id.toString(),
        name: group.name,
        description: group.description,
        color: group.color,
        icon: group.icon,
        isActive: group.isActive,
        settings: group.settings,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
      },
      cursor: group._id.toString(),
    }));

    return {
      edges,
      pageInfo: {
        hasNextPage: groups.length === limit,
        hasPreviousPage: !!cursor,
        startCursor: edges[0]?.cursor,
        endCursor: edges[edges.length - 1]?.cursor,
      },
      totalCount,
    };
  }

  // Get group by ID
  static async getGroupById(context: Context, id: string) {
    const { db } = context;
    const { tenant } = context;

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const collection = db.collection('groups');
    const group = await collection.findOne({
      _id: new ObjectId(id),
      tenant: tenant.id,
    });

    if (!group) {
      throw new Error('Group not found');
    }

    return {
      id: group._id.toString(),
      name: group.name,
      description: group.description,
      color: group.color,
      icon: group.icon,
      isActive: group.isActive,
      settings: group.settings,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
    };
  }

  // Get group members
  static async getGroupMembers(
    context: Context,
    args: {
      groupId: string;
      first?: number;
      after?: string;
      last?: number;
      before?: string;
      role?: string;
      isActive?: boolean;
    }
  ) {
    const { db } = context;
    const { tenant } = context;

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const collection = db.collection('groupMembers');
    let query: any = {
      groupId: new ObjectId(args.groupId),
      tenant: tenant.id,
    };

    if (args.role) {
      query.role = args.role;
    }

    if (args.isActive !== undefined) {
      query.isActive = args.isActive;
    }

    const totalCount = await collection.countDocuments(query);

    // Apply pagination
    let cursor = args.after || args.before;
    if (cursor) {
      const cursorObj = await collection.findOne({ _id: new ObjectId(cursor) });
      if (cursorObj) {
        if (args.after) {
          query._id = { $gt: cursorObj._id };
        } else {
          query._id = { $lt: cursorObj._id };
        }
      }
    }

    const sort = args.before ? { _id: -1 } : { _id: 1 };
    const limit = args.first || args.last || 10;

    const members = await collection
      .find(query)
      .sort(sort)
      .limit(limit)
      .toArray();

    if (args.before) {
      members.reverse();
    }

    const edges = members.map((member) => ({
      node: {
        id: member._id.toString(),
        role: member.role,
        joinedAt: member.joinedAt,
        isActive: member.isActive,
        permissions: member.permissions,
      },
      cursor: member._id.toString(),
    }));

    return {
      edges,
      pageInfo: {
        hasNextPage: members.length === limit,
        hasPreviousPage: !!cursor,
        startCursor: edges[0]?.cursor,
        endCursor: edges[edges.length - 1]?.cursor,
      },
      totalCount,
    };
  }

  // Get user groups
  static async getUserGroups(
    context: Context,
    args: {
      userId: string;
      first?: number;
      after?: string;
      last?: number;
      before?: string;
      role?: string;
      isActive?: boolean;
    }
  ) {
    const { db } = context;
    const { tenant } = context;

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    // First get group members for the user
    const groupMembersCollection = db.collection('groupMembers');
    const groupMembers = await groupMembersCollection
      .find({
        userId: new ObjectId(args.userId),
        tenant: tenant.id,
        ...(args.role && { role: args.role }),
        ...(args.isActive !== undefined && { isActive: args.isActive }),
      })
      .toArray();

    const groupIds = groupMembers.map((member) => member.groupId);

    if (groupIds.length === 0) {
      return {
        edges: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null,
        },
        totalCount: 0,
      };
    }

    // Get groups
    const groupsCollection = db.collection('groups');
    const groups = await groupsCollection
      .find({
        _id: { $in: groupIds },
        tenant: tenant.id,
      })
      .toArray();

    const edges = groups.map((group) => ({
      node: {
        id: group._id.toString(),
        name: group.name,
        description: group.description,
        color: group.color,
        icon: group.icon,
        isActive: group.isActive,
        settings: group.settings,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
      },
      cursor: group._id.toString(),
    }));

    return {
      edges,
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: edges[0]?.cursor,
        endCursor: edges[edges.length - 1]?.cursor,
      },
      totalCount: groups.length,
    };
  }

  // Create group
  static async createGroup(context: Context, input: any) {
    const { db } = context;
    const { tenant, user } = context;

    if (!tenant || !user) {
      throw new Error('Tenant or user not found');
    }

    // Check if user has permission to create groups
    if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      throw new Error('Insufficient permissions to create groups');
    }

    const collection = db.collection('groups');
    const now = new Date();

    const group = {
      name: input.name,
      description: input.description,
      color: input.color || '#3B82F6',
      icon: input.icon || 'users',
      tenant: tenant.id,
      createdBy: user.id,
      isActive: true,
      settings: {
        allowSelfJoin: input.settings?.allowSelfJoin || false,
        requireApproval: input.settings?.requireApproval || true,
        maxMembers: input.settings?.maxMembers || null,
        trainingEnabled: input.settings?.trainingEnabled || true,
        nudgeEnabled: input.settings?.nudgeEnabled || true,
        reportingEnabled: input.settings?.reportingEnabled || true,
        notifications: {
          onMemberJoin: input.settings?.notifications?.onMemberJoin || true,
          onMemberLeave: input.settings?.notifications?.onMemberLeave || true,
          onTrainingUpdate: input.settings?.notifications?.onTrainingUpdate || true,
          onNudgeSent: input.settings?.notifications?.onNudgeSent || true,
          onReportGenerated: input.settings?.notifications?.onReportGenerated || true,
        },
      },
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(group);
    const createdGroup = await collection.findOne({ _id: result.insertedId });

    return {
      id: createdGroup._id.toString(),
      name: createdGroup.name,
      description: createdGroup.description,
      color: createdGroup.color,
      icon: createdGroup.icon,
      isActive: createdGroup.isActive,
      settings: createdGroup.settings,
      createdAt: createdGroup.createdAt,
      updatedAt: createdGroup.updatedAt,
    };
  }

  // Update group
  static async updateGroup(context: Context, input: any) {
    const { db } = context;
    const { tenant, user } = context;

    if (!tenant || !user) {
      throw new Error('Tenant or user not found');
    }

    const collection = db.collection('groups');
    const group = await collection.findOne({
      _id: new ObjectId(input.id),
      tenant: tenant.id,
    });

    if (!group) {
      throw new Error('Group not found');
    }

    // Check permissions
    if (group.createdBy.toString() !== user.id && !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      throw new Error('Insufficient permissions to update group');
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (input.name) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.color) updateData.color = input.color;
    if (input.icon) updateData.icon = input.icon;
    if (input.settings) updateData.settings = { ...group.settings, ...input.settings };

    await collection.updateOne(
      { _id: new ObjectId(input.id) },
      { $set: updateData }
    );

    const updatedGroup = await collection.findOne({ _id: new ObjectId(input.id) });

    return {
      id: updatedGroup._id.toString(),
      name: updatedGroup.name,
      description: updatedGroup.description,
      color: updatedGroup.color,
      icon: updatedGroup.icon,
      isActive: updatedGroup.isActive,
      settings: updatedGroup.settings,
      createdAt: updatedGroup.createdAt,
      updatedAt: updatedGroup.updatedAt,
    };
  }

  // Delete group
  static async deleteGroup(context: Context, id: string) {
    const { db } = context;
    const { tenant, user } = context;

    if (!tenant || !user) {
      throw new Error('Tenant or user not found');
    }

    const collection = db.collection('groups');
    const group = await collection.findOne({
      _id: new ObjectId(id),
      tenant: tenant.id,
    });

    if (!group) {
      throw new Error('Group not found');
    }

    // Check permissions
    if (group.createdBy.toString() !== user.id && !['SUPER_ADMIN'].includes(user.role)) {
      throw new Error('Insufficient permissions to delete group');
    }

    // Remove group and all its members
    await collection.deleteOne({ _id: new ObjectId(id) });
    await db.collection('groupMembers').deleteMany({ groupId: new ObjectId(id) });

    return true;
  }

  // Add group member
  static async addGroupMember(context: Context, input: any) {
    const { db } = context;
    const { tenant, user } = context;

    if (!tenant || !user) {
      throw new Error('Tenant or user not found');
    }

    // Check if group exists
    const group = await db.collection('groups').findOne({
      _id: new ObjectId(input.groupId),
      tenant: tenant.id,
    });

    if (!group) {
      throw new Error('Group not found');
    }

    // Check permissions
    if (group.createdBy.toString() !== user.id && !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      throw new Error('Insufficient permissions to add members');
    }

    // Check if user is already a member
    const existingMember = await db.collection('groupMembers').findOne({
      groupId: new ObjectId(input.groupId),
      userId: new ObjectId(input.userId),
    });

    if (existingMember) {
      throw new Error('User is already a member of this group');
    }

    // Check max members limit
    if (group.settings.maxMembers) {
      const memberCount = await db.collection('groupMembers').countDocuments({
        groupId: new ObjectId(input.groupId),
        isActive: true,
      });

      if (memberCount >= group.settings.maxMembers) {
        throw new Error('Group has reached maximum member limit');
      }
    }

    const member = {
      groupId: new ObjectId(input.groupId),
      userId: new ObjectId(input.userId),
      role: input.role || 'MEMBER',
      joinedAt: new Date(),
      isActive: true,
      permissions: {
        canInviteMembers: input.role === 'ADMIN',
        canRemoveMembers: input.role === 'ADMIN',
        canEditGroup: input.role === 'ADMIN',
        canViewReports: true,
        canManageTraining: input.role === 'ADMIN',
        canSendNudges: input.role === 'ADMIN',
      },
    };

    const result = await db.collection('groupMembers').insertOne(member);
    const createdMember = await db.collection('groupMembers').findOne({ _id: result.insertedId });

    return {
      id: createdMember._id.toString(),
      role: createdMember.role,
      joinedAt: createdMember.joinedAt,
      isActive: createdMember.isActive,
      permissions: createdMember.permissions,
    };
  }

  // Remove group member
  static async removeGroupMember(context: Context, input: any) {
    const { db } = context;
    const { tenant, user } = context;

    if (!tenant || !user) {
      throw new Error('Tenant or user not found');
    }

    // Check if group exists
    const group = await db.collection('groups').findOne({
      _id: new ObjectId(input.groupId),
      tenant: tenant.id,
    });

    if (!group) {
      throw new Error('Group not found');
    }

    // Check permissions
    if (group.createdBy.toString() !== user.id && !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      throw new Error('Insufficient permissions to remove members');
    }

    await db.collection('groupMembers').deleteOne({
      groupId: new ObjectId(input.groupId),
      userId: new ObjectId(input.userId),
    });

    return true;
  }

  // Update group member
  static async updateGroupMember(context: Context, input: any) {
    const { db } = context;
    const { tenant, user } = context;

    if (!tenant || !user) {
      throw new Error('Tenant or user not found');
    }

    // Check if group exists
    const group = await db.collection('groups').findOne({
      _id: new ObjectId(input.groupId),
      tenant: tenant.id,
    });

    if (!group) {
      throw new Error('Group not found');
    }

    // Check permissions
    if (group.createdBy.toString() !== user.id && !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      throw new Error('Insufficient permissions to update members');
    }

    const updateData: any = {};
    if (input.role) updateData.role = input.role;
    if (input.permissions) updateData.permissions = input.permissions;

    await db.collection('groupMembers').updateOne(
      {
        groupId: new ObjectId(input.groupId),
        userId: new ObjectId(input.userId),
      },
      { $set: updateData }
    );

    const updatedMember = await db.collection('groupMembers').findOne({
      groupId: new ObjectId(input.groupId),
      userId: new ObjectId(input.userId),
    });

    return {
      id: updatedMember._id.toString(),
      role: updatedMember.role,
      joinedAt: updatedMember.joinedAt,
      isActive: updatedMember.isActive,
      permissions: updatedMember.permissions,
    };
  }

  // Join group
  static async joinGroup(context: Context, groupId: string) {
    const { db } = context;
    const { tenant, user } = context;

    if (!tenant || !user) {
      throw new Error('Tenant or user not found');
    }

    // Check if group exists
    const group = await db.collection('groups').findOne({
      _id: new ObjectId(groupId),
      tenant: tenant.id,
    });

    if (!group) {
      throw new Error('Group not found');
    }

    // Check if self-join is allowed
    if (!group.settings.allowSelfJoin) {
      throw new Error('Self-join is not allowed for this group');
    }

    // Check if user is already a member
    const existingMember = await db.collection('groupMembers').findOne({
      groupId: new ObjectId(groupId),
      userId: user.id,
    });

    if (existingMember) {
      throw new Error('You are already a member of this group');
    }

    // Check max members limit
    if (group.settings.maxMembers) {
      const memberCount = await db.collection('groupMembers').countDocuments({
        groupId: new ObjectId(groupId),
        isActive: true,
      });

      if (memberCount >= group.settings.maxMembers) {
        throw new Error('Group has reached maximum member limit');
      }
    }

    const member = {
      groupId: new ObjectId(groupId),
      userId: user.id,
      role: 'MEMBER',
      joinedAt: new Date(),
      isActive: true,
      permissions: {
        canInviteMembers: false,
        canRemoveMembers: false,
        canEditGroup: false,
        canViewReports: true,
        canManageTraining: false,
        canSendNudges: false,
      },
    };

    const result = await db.collection('groupMembers').insertOne(member);
    const createdMember = await db.collection('groupMembers').findOne({ _id: result.insertedId });

    return {
      id: createdMember._id.toString(),
      role: createdMember.role,
      joinedAt: createdMember.joinedAt,
      isActive: createdMember.isActive,
      permissions: createdMember.permissions,
    };
  }

  // Leave group
  static async leaveGroup(context: Context, groupId: string) {
    const { db } = context;
    const { tenant, user } = context;

    if (!tenant || !user) {
      throw new Error('Tenant or user not found');
    }

    await db.collection('groupMembers').deleteOne({
      groupId: new ObjectId(groupId),
      userId: user.id,
    });

    return true;
  }

  // Bulk add group members
  static async bulkAddGroupMembers(
    context: Context,
    groupId: string,
    userIds: string[],
    role?: string
  ) {
    const { db } = context;
    const { tenant, user } = context;

    if (!tenant || !user) {
      throw new Error('Tenant or user not found');
    }

    // Check if group exists
    const group = await db.collection('groups').findOne({
      _id: new ObjectId(groupId),
      tenant: tenant.id,
    });

    if (!group) {
      throw new Error('Group not found');
    }

    // Check permissions
    if (group.createdBy.toString() !== user.id && !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      throw new Error('Insufficient permissions to add members');
    }

    const members = userIds.map((userId) => ({
      groupId: new ObjectId(groupId),
      userId: new ObjectId(userId),
      role: role || 'MEMBER',
      joinedAt: new Date(),
      isActive: true,
      permissions: {
        canInviteMembers: role === 'ADMIN',
        canRemoveMembers: role === 'ADMIN',
        canEditGroup: role === 'ADMIN',
        canViewReports: true,
        canManageTraining: role === 'ADMIN',
        canSendNudges: role === 'ADMIN',
      },
    }));

    const result = await db.collection('groupMembers').insertMany(members);
    const createdMembers = await db.collection('groupMembers')
      .find({ _id: { $in: Object.values(result.insertedIds) } })
      .toArray();

    return createdMembers.map((member) => ({
      id: member._id.toString(),
      role: member.role,
      joinedAt: member.joinedAt,
      isActive: member.isActive,
      permissions: member.permissions,
    }));
  }

  // Bulk remove group members
  static async bulkRemoveGroupMembers(
    context: Context,
    groupId: string,
    userIds: string[]
  ) {
    const { db } = context;
    const { tenant, user } = context;

    if (!tenant || !user) {
      throw new Error('Tenant or user not found');
    }

    // Check if group exists
    const group = await db.collection('groups').findOne({
      _id: new ObjectId(groupId),
      tenant: tenant.id,
    });

    if (!group) {
      throw new Error('Group not found');
    }

    // Check permissions
    if (group.createdBy.toString() !== user.id && !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      throw new Error('Insufficient permissions to remove members');
    }

    await db.collection('groupMembers').deleteMany({
      groupId: new ObjectId(groupId),
      userId: { $in: userIds.map((id) => new ObjectId(id)) },
    });

    return true;
  }

  // Helper methods for GraphQL resolvers
  static async getGroupTenant(context: Context, groupId: string) {
    const { db } = context;
    const group = await db.collection('groups').findOne({ _id: new ObjectId(groupId) });
    if (!group) return null;

    const tenant = await db.collection('tenants').findOne({ _id: group.tenant });
    return tenant ? {
      id: tenant._id.toString(),
      name: tenant.name,
      subdomain: tenant.subdomain,
    } : null;
  }

  static async getGroupCreator(context: Context, groupId: string) {
    const { db } = context;
    const group = await db.collection('groups').findOne({ _id: new ObjectId(groupId) });
    if (!group) return null;

    const user = await db.collection('users').findOne({ _id: group.createdBy });
    return user ? {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    } : null;
  }

  static async getGroupMembersList(context: Context, groupId: string) {
    const { db } = context;
    const members = await db.collection('groupMembers')
      .find({ groupId: new ObjectId(groupId), isActive: true })
      .toArray();

    const userIds = members.map((member) => member.userId);
    const users = await db.collection('users')
      .find({ _id: { $in: userIds } })
      .toArray();

    return users.map((user) => ({
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    }));
  }

  static async getGroupMemberCount(context: Context, groupId: string) {
    const { db } = context;
    return await db.collection('groupMembers').countDocuments({
      groupId: new ObjectId(groupId),
      isActive: true,
    });
  }

  static async getGroupMemberUser(context: Context, memberId: string) {
    const { db } = context;
    const member = await db.collection('groupMembers').findOne({ _id: new ObjectId(memberId) });
    if (!member) return null;

    const user = await db.collection('users').findOne({ _id: member.userId });
    return user ? {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    } : null;
  }

  static async getGroupMemberGroup(context: Context, memberId: string) {
    const { db } = context;
    const member = await db.collection('groupMembers').findOne({ _id: new ObjectId(memberId) });
    if (!member) return null;

    const group = await db.collection('groups').findOne({ _id: member.groupId });
    return group ? {
      id: group._id.toString(),
      name: group.name,
      description: group.description,
      color: group.color,
      icon: group.icon,
      isActive: group.isActive,
    } : null;
  }
}
