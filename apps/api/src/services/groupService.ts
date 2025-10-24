import { Context } from '../context';
import { Group, GroupMember, IGroup, IGroupMember, Tenant } from '@luxgen/db';
import { Types } from 'mongoose';

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
    const { tenant } = context;

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    // Find tenant by subdomain or use default
    let tenantId: string | null = null;
    
    if (tenant && tenant !== 'demo') {
      const tenantDoc = await Tenant.findOne({ subdomain: tenant });
      if (tenantDoc) {
        tenantId = tenantDoc._id.toString();
      }
    } else {
      // Default to demo tenant
      const demoTenant = await Tenant.findOne({ subdomain: 'demo' });
      if (demoTenant) {
        tenantId = demoTenant._id.toString();
      }
    }
    
    let query: any = { isActive: true };
    if (tenantId) {
      query.tenant = tenantId;
    }
    
    console.log('🔍 GroupService query:', query);
    console.log('🔍 Tenant ID:', tenantId);

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
      query.createdBy = args.createdBy;
    }

    // Get total count
    const totalCount = await Group.countDocuments(query);

    // Apply pagination
    let cursor = args.after || args.before;
    if (cursor) {
      const cursorObj = await Group.findById(cursor);
      if (cursorObj) {
        if (args.after) {
          query._id = { $gt: new Types.ObjectId(cursor) };
        } else {
          query._id = { $lt: new Types.ObjectId(cursor) };
        }
      }
    }

    // Apply sorting
    const sort = args.before ? { _id: -1 } : { _id: 1 };
    const limit = args.first || args.last || 10;

    const groups = await Group.find(query)
      .sort(sort)
      .limit(limit)
      .lean();

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
    const { tenant } = context;

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const group = await Group.findOne({
      _id: new Types.ObjectId(id),
      tenant: tenant.id,
    }).lean();

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
    const { tenant } = context;

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    let query: any = { groupId: args.groupId };

    if (args.role) {
      query.role = args.role;
    }

    if (args.isActive !== undefined) {
      query.isActive = args.isActive;
    }

    const totalCount = await GroupMember.countDocuments(query);

    // Apply pagination
    let cursor = args.after || args.before;
    if (cursor) {
      const cursorObj = await GroupMember.findById(cursor);
      if (cursorObj) {
        if (args.after) {
          query._id = { $gt: new Types.ObjectId(cursor) };
        } else {
          query._id = { $lt: new Types.ObjectId(cursor) };
        }
      }
    }

    const sort = args.before ? { _id: -1 } : { _id: 1 };
    const limit = args.first || args.last || 10;

    const members = await GroupMember.find(query)
      .sort(sort)
      .limit(limit)
      .lean();

    if (args.before) {
      members.reverse();
    }

    const edges = members.map((member) => ({
      node: {
        id: member._id.toString(),
        groupId: member.groupId,
        userId: member.userId,
        role: member.role,
        joinedAt: member.joinedAt,
        isActive: member.isActive,
        permissions: member.permissions,
        createdAt: member.createdAt,
        updatedAt: member.updatedAt,
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
    const { tenant } = context;

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    let query: any = { userId: args.userId };

    if (args.role) {
      query.role = args.role;
    }

    if (args.isActive !== undefined) {
      query.isActive = args.isActive;
    }

    const totalCount = await GroupMember.countDocuments(query);

    // Apply pagination
    let cursor = args.after || args.before;
    if (cursor) {
      const cursorObj = await GroupMember.findById(cursor);
      if (cursorObj) {
        if (args.after) {
          query._id = { $gt: new Types.ObjectId(cursor) };
        } else {
          query._id = { $lt: new Types.ObjectId(cursor) };
        }
      }
    }

    const sort = args.before ? { _id: -1 } : { _id: 1 };
    const limit = args.first || args.last || 10;

    const members = await GroupMember.find(query)
      .sort(sort)
      .limit(limit)
      .lean();

    if (args.before) {
      members.reverse();
    }

    const edges = members.map((member) => ({
      node: {
        id: member._id.toString(),
        groupId: member.groupId,
        userId: member.userId,
        role: member.role,
        joinedAt: member.joinedAt,
        isActive: member.isActive,
        permissions: member.permissions,
        createdAt: member.createdAt,
        updatedAt: member.updatedAt,
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

  // Create group
  static async createGroup(context: Context, input: any) {
    const { tenant, user } = context;

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    if (!user) {
      throw new Error('User not found');
    }

    const group = new Group({
      name: input.name,
      description: input.description,
      color: input.color,
      icon: input.icon,
      tenant: tenant.id,
      createdBy: user._id.toString(),
      isActive: true,
      settings: {
        allowSelfJoin: input.settings?.allowSelfJoin || false,
        requireApproval: input.settings?.requireApproval || true,
        maxMembers: input.settings?.maxMembers,
        allowFileSharing: input.settings?.allowFileSharing || true,
        allowComments: input.settings?.allowComments || true,
        allowNudges: input.settings?.allowNudges || true,
        canSendNudges: input.settings?.canSendNudges || false,
      },
    });

    await group.save();

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

  // Update group
  static async updateGroup(context: Context, input: any) {
    const { tenant } = context;

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const group = await Group.findOneAndUpdate(
      { _id: new Types.ObjectId(input.id), tenant: tenant.id },
      {
        $set: {
          name: input.name,
          description: input.description,
          color: input.color,
          icon: input.icon,
          isActive: input.isActive,
          settings: input.settings,
        },
      },
      { new: true }
    );

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

  // Delete group
  static async deleteGroup(context: Context, id: string) {
    const { tenant } = context;

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const group = await Group.findOneAndDelete({
      _id: new Types.ObjectId(id),
      tenant: tenant.id,
    });

    if (!group) {
      throw new Error('Group not found');
    }

    // Also delete all group members
    await GroupMember.deleteMany({ groupId: id });

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

  // Add group member
  static async addGroupMember(context: Context, input: any) {
    const { tenant } = context;

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const member = new GroupMember({
      groupId: input.groupId,
      userId: input.userId,
      role: input.role || 'member',
      isActive: true,
      permissions: {
        canInvite: input.permissions?.canInvite || false,
        canRemove: input.permissions?.canRemove || false,
        canEdit: input.permissions?.canEdit || false,
        canDelete: input.permissions?.canDelete || false,
      },
    });

    await member.save();

    return {
      id: member._id.toString(),
      groupId: member.groupId,
      userId: member.userId,
      role: member.role,
      joinedAt: member.joinedAt,
      isActive: member.isActive,
      permissions: member.permissions,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
    };
  }

  // Remove group member
  static async removeGroupMember(context: Context, input: any) {
    const { tenant } = context;

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const member = await GroupMember.findOneAndDelete({
      groupId: input.groupId,
      userId: input.userId,
    });

    if (!member) {
      throw new Error('Group member not found');
    }

    return {
      id: member._id.toString(),
      groupId: member.groupId,
      userId: member.userId,
      role: member.role,
      joinedAt: member.joinedAt,
      isActive: member.isActive,
      permissions: member.permissions,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
    };
  }

  // Update group member
  static async updateGroupMember(context: Context, input: any) {
    const { tenant } = context;

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const member = await GroupMember.findOneAndUpdate(
      { _id: new Types.ObjectId(input.id) },
      {
        $set: {
          role: input.role,
          isActive: input.isActive,
          permissions: input.permissions,
        },
      },
      { new: true }
    );

    if (!member) {
      throw new Error('Group member not found');
    }

    return {
      id: member._id.toString(),
      groupId: member.groupId,
      userId: member.userId,
      role: member.role,
      joinedAt: member.joinedAt,
      isActive: member.isActive,
      permissions: member.permissions,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
    };
  }

  // Join group
  static async joinGroup(context: Context, groupId: string) {
    const { tenant, user } = context;

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    if (!user) {
      throw new Error('User not found');
    }

    // Check if user is already a member
    const existingMember = await GroupMember.findOne({
      groupId,
      userId: user._id.toString(),
    });

    if (existingMember) {
      throw new Error('User is already a member of this group');
    }

    const member = new GroupMember({
      groupId,
      userId: user._id.toString(),
      role: 'member',
      isActive: true,
      permissions: {
        canInvite: false,
        canRemove: false,
        canEdit: false,
        canDelete: false,
      },
    });

    await member.save();

    return {
      id: member._id.toString(),
      groupId: member.groupId,
      userId: member.userId,
      role: member.role,
      joinedAt: member.joinedAt,
      isActive: member.isActive,
      permissions: member.permissions,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
    };
  }

  // Leave group
  static async leaveGroup(context: Context, groupId: string) {
    const { tenant, user } = context;

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    if (!user) {
      throw new Error('User not found');
    }

    const member = await GroupMember.findOneAndDelete({
      groupId,
      userId: user._id.toString(),
    });

    if (!member) {
      throw new Error('User is not a member of this group');
    }

    return {
      id: member._id.toString(),
      groupId: member.groupId,
      userId: member.userId,
      role: member.role,
      joinedAt: member.joinedAt,
      isActive: member.isActive,
      permissions: member.permissions,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
    };
  }

  // Bulk add group members
  static async bulkAddGroupMembers(
    context: Context,
    groupId: string,
    userIds: string[],
    role: string = 'member'
  ) {
    const { tenant } = context;

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const members = userIds.map((userId) => ({
      groupId,
      userId,
      role,
      isActive: true,
      permissions: {
        canInvite: false,
        canRemove: false,
        canEdit: false,
        canDelete: false,
      },
    }));

    await GroupMember.insertMany(members);

    return {
      success: true,
      addedCount: userIds.length,
    };
  }

  // Bulk remove group members
  static async bulkRemoveGroupMembers(
    context: Context,
    groupId: string,
    userIds: string[]
  ) {
    const { tenant } = context;

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const result = await GroupMember.deleteMany({
      groupId,
      userId: { $in: userIds },
    });

    return {
      success: true,
      removedCount: result.deletedCount,
    };
  }

  // Get group tenant
  static async getGroupTenant(context: Context, groupId: string) {
    const group = await Group.findById(groupId).lean();
    if (!group) {
      throw new Error('Group not found');
    }
    return { id: group.tenant };
  }

  // Get group creator
  static async getGroupCreator(context: Context, groupId: string) {
    const group = await Group.findById(groupId).lean();
    if (!group) {
      throw new Error('Group not found');
    }
    return { id: group.createdBy };
  }

  // Get group members list
  static async getGroupMembersList(context: Context, groupId: string) {
    const members = await GroupMember.find({ groupId, isActive: true }).lean();
    return members.map((member) => ({
      id: member._id.toString(),
      groupId: member.groupId,
      userId: member.userId,
      role: member.role,
      joinedAt: member.joinedAt,
      isActive: member.isActive,
      permissions: member.permissions,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
    }));
  }

  // Get group member count
  static async getGroupMemberCount(context: Context, groupId: string) {
    return await GroupMember.countDocuments({ groupId, isActive: true });
  }

  // Get group member user
  static async getGroupMemberUser(context: Context, memberId: string) {
    const member = await GroupMember.findById(memberId).lean();
    if (!member) {
      throw new Error('Group member not found');
    }
    return { id: member.userId };
  }

  // Get group member group
  static async getGroupMemberGroup(context: Context, memberId: string) {
    const member = await GroupMember.findById(memberId).lean();
    if (!member) {
      throw new Error('Group member not found');
    }
    return { id: member.groupId };
  }
}