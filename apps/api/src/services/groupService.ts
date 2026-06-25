import { GraphQLError } from 'graphql';
import { GraphQLContext as Context } from '../context';
import { Group, GroupMember, IGroup, IGroupMember } from '@luxgen/db';
import { Types, FilterQuery, SortOrder } from 'mongoose';
import mongoose from 'mongoose';

// ─── Shared pagination helper (Relay-spec compliant) ────────────────────────

interface PageArgs {
  first?: number;
  after?: string;
  last?: number;
  before?: string;
}

function buildCursorFilter(args: PageArgs): FilterQuery<any> {
  const cursor = args.after ?? args.before;
  if (!cursor) return {};

  if (!Types.ObjectId.isValid(cursor)) {
    throw new GraphQLError('Invalid pagination cursor', { extensions: { code: 'BAD_USER_INPUT' } });
  }

  return args.after ? { _id: { $gt: new Types.ObjectId(cursor) } } : { _id: { $lt: new Types.ObjectId(cursor) } };
}

async function paginate<T extends { _id: unknown }>(
  model: mongoose.Model<T>,
  baseQuery: FilterQuery<T>,
  args: PageArgs,
  mapNode: (doc: T) => Record<string, unknown>,
) {
  const totalCount = await model.countDocuments(baseQuery);

  const cursorFilter = buildCursorFilter(args);
  const query: FilterQuery<T> = { ...baseQuery, ...cursorFilter };
  const sortDir: SortOrder = args.before ? -1 : 1;
  const limit = args.first ?? args.last ?? 10;

  const docs = await model
    .find(query)
    .sort({ _id: sortDir })
    .limit(limit + 1)
    .lean<T[]>();
  const hasMore = docs.length > limit;
  const page = hasMore ? docs.slice(0, limit) : [...docs];
  if (args.before) page.reverse();

  const edges = page.map((doc) => ({ node: mapNode(doc), cursor: (doc._id as any).toString() }));
  const hasCursor = Boolean(args.after ?? args.before);

  return {
    edges,
    pageInfo: {
      hasNextPage: (args.before ?? args.last) ? hasCursor : hasMore,
      hasPreviousPage: (args.before ?? args.last) ? hasMore : Boolean(args.after),
      startCursor: edges[0]?.cursor ?? null,
      endCursor: edges[edges.length - 1]?.cursor ?? null,
    },
    totalCount,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mapGroup(g: Partial<IGroup> & { _id: unknown }) {
  return {
    id: (g._id as any).toString(),
    name: g.name,
    description: g.description,
    color: g.color,
    icon: g.icon,
    isActive: g.isActive,
    settings: g.settings,
    createdAt: g.createdAt,
    updatedAt: g.updatedAt,
  };
}

function mapMember(m: Partial<IGroupMember> & { _id: unknown }) {
  return {
    id: (m._id as any).toString(),
    groupId: m.groupId,
    userId: m.userId,
    role: m.role,
    joinedAt: m.joinedAt,
    isActive: m.isActive,
    permissions: m.permissions,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
  };
}

function requireTenantId(context: Context): string {
  if (!context.tenantId) {
    throw new GraphQLError('Tenant not found', { extensions: { code: 'BAD_REQUEST' } });
  }
  return context.tenantId;
}

/** Verify a group belongs to the current tenant. Throws NOT_FOUND if not. */
async function assertGroupBelongsToTenant(groupId: string, tenantId: string): Promise<void> {
  if (!Types.ObjectId.isValid(groupId)) {
    throw new GraphQLError('Invalid group ID', { extensions: { code: 'BAD_USER_INPUT' } });
  }
  const group = await Group.findOne({ _id: new Types.ObjectId(groupId), tenant: tenantId }).lean();
  if (!group) {
    throw new GraphQLError('Group not found', { extensions: { code: 'NOT_FOUND' } });
  }
}

// ─── GroupService ─────────────────────────────────────────────────────────────

export class GroupService {
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
    },
  ) {
    const tenantId = requireTenantId(context);
    const baseQuery: FilterQuery<IGroup> = { tenant: tenantId, isActive: true };

    if (args.search) {
      baseQuery.$or = [
        { name: { $regex: args.search, $options: 'i' } },
        { description: { $regex: args.search, $options: 'i' } },
      ];
    }
    if (args.isActive !== undefined) baseQuery.isActive = args.isActive;
    if (args.createdBy) baseQuery.createdBy = args.createdBy;

    return paginate(Group, baseQuery, args, mapGroup as any);
  }

  static async getGroupById(context: Context, id: string) {
    const tenantId = requireTenantId(context);

    if (!Types.ObjectId.isValid(id)) {
      throw new GraphQLError('Invalid group ID', { extensions: { code: 'BAD_USER_INPUT' } });
    }

    const group = await Group.findOne({ _id: new Types.ObjectId(id), tenant: tenantId }).lean();
    if (!group) throw new GraphQLError('Group not found', { extensions: { code: 'NOT_FOUND' } });
    return mapGroup(group);
  }

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
    },
  ) {
    const tenantId = requireTenantId(context);
    await assertGroupBelongsToTenant(args.groupId, tenantId);

    const baseQuery: FilterQuery<IGroupMember> = { groupId: args.groupId };
    if (args.role) baseQuery.role = args.role as IGroupMember['role'];
    if (args.isActive !== undefined) baseQuery.isActive = args.isActive;

    return paginate(GroupMember, baseQuery, args, mapMember as any);
  }

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
    },
  ) {
    requireTenantId(context);
    const baseQuery: FilterQuery<IGroupMember> = { userId: args.userId };
    if (args.role) baseQuery.role = args.role as IGroupMember['role'];
    if (args.isActive !== undefined) baseQuery.isActive = args.isActive;

    return paginate(GroupMember, baseQuery, args, mapMember as any);
  }

  static async createGroup(context: Context, input: any) {
    const tenantId = requireTenantId(context);
    if (!context.user) throw new GraphQLError('User not found', { extensions: { code: 'UNAUTHENTICATED' } });

    const group = new Group({
      name: input.name,
      description: input.description,
      color: input.color,
      icon: input.icon,
      tenant: tenantId,
      createdBy: (context.user as any)._id.toString(),
      isActive: true,
      settings: {
        allowSelfJoin: input.settings?.allowSelfJoin ?? false,
        requireApproval: input.settings?.requireApproval ?? true,
        maxMembers: input.settings?.maxMembers,
        allowFileSharing: input.settings?.allowFileSharing ?? true,
        allowComments: input.settings?.allowComments ?? true,
        allowNudges: input.settings?.allowNudges ?? true,
        canSendNudges: input.settings?.canSendNudges ?? false,
      },
    });

    await group.save();
    return mapGroup(group);
  }

  static async updateGroup(context: Context, input: any) {
    const tenantId = requireTenantId(context);
    if (!Types.ObjectId.isValid(input.id)) {
      throw new GraphQLError('Invalid group ID', { extensions: { code: 'BAD_USER_INPUT' } });
    }

    const group = await Group.findOneAndUpdate(
      { _id: new Types.ObjectId(input.id), tenant: tenantId },
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
      { new: true },
    );

    if (!group) throw new GraphQLError('Group not found', { extensions: { code: 'NOT_FOUND' } });
    return mapGroup(group);
  }

  static async deleteGroup(context: Context, id: string) {
    const tenantId = requireTenantId(context);
    if (!Types.ObjectId.isValid(id)) {
      throw new GraphQLError('Invalid group ID', { extensions: { code: 'BAD_USER_INPUT' } });
    }

    const session = await mongoose.startSession();
    let deleted: IGroup | null = null;
    try {
      await session.withTransaction(async () => {
        deleted = await Group.findOneAndDelete(
          { _id: new Types.ObjectId(id), tenant: tenantId },
          { session },
        ).lean<IGroup>();
        if (!deleted) throw new GraphQLError('Group not found', { extensions: { code: 'NOT_FOUND' } });
        await GroupMember.deleteMany({ groupId: id }, { session });
      });
    } finally {
      await session.endSession();
    }

    return mapGroup(deleted!);
  }

  static async addGroupMember(context: Context, input: any) {
    requireTenantId(context);
    const member = new GroupMember({
      groupId: input.groupId,
      userId: input.userId,
      role: input.role || 'member',
      isActive: true,
      permissions: {
        canInvite: input.permissions?.canInvite ?? false,
        canRemove: input.permissions?.canRemove ?? false,
        canEdit: input.permissions?.canEdit ?? false,
        canDelete: input.permissions?.canDelete ?? false,
      },
    });

    try {
      await member.save();
    } catch (e: any) {
      if (e.code === 11000)
        throw new GraphQLError('User is already a member of this group', { extensions: { code: 'BAD_USER_INPUT' } });
      throw e;
    }

    return mapMember(member);
  }

  static async removeGroupMember(context: Context, input: any) {
    const tenantId = requireTenantId(context);
    await assertGroupBelongsToTenant(input.groupId, tenantId);

    const member = await GroupMember.findOneAndDelete({
      groupId: input.groupId,
      userId: input.userId,
    }).lean<IGroupMember>();
    if (!member) throw new GraphQLError('Group member not found', { extensions: { code: 'NOT_FOUND' } });
    return mapMember(member);
  }

  static async updateGroupMember(context: Context, input: any) {
    const tenantId = requireTenantId(context);
    if (!Types.ObjectId.isValid(input.id)) {
      throw new GraphQLError('Invalid member ID', { extensions: { code: 'BAD_USER_INPUT' } });
    }

    const existingMember = await GroupMember.findById(input.id).lean<IGroupMember>();
    if (!existingMember) throw new GraphQLError('Group member not found', { extensions: { code: 'NOT_FOUND' } });
    await assertGroupBelongsToTenant(existingMember.groupId, tenantId);

    const member = await GroupMember.findOneAndUpdate(
      { _id: new Types.ObjectId(input.id) },
      { $set: { role: input.role, isActive: input.isActive, permissions: input.permissions } },
      { new: true },
    ).lean<IGroupMember>();

    if (!member) throw new GraphQLError('Group member not found', { extensions: { code: 'NOT_FOUND' } });
    return mapMember(member);
  }

  static async joinGroup(context: Context, groupId: string) {
    const tenantId = requireTenantId(context);
    if (!context.user) throw new GraphQLError('User not found', { extensions: { code: 'UNAUTHENTICATED' } });
    await assertGroupBelongsToTenant(groupId, tenantId);

    const member = new GroupMember({
      groupId,
      userId: (context.user as any)._id.toString(),
      role: 'member',
      isActive: true,
      permissions: { canInvite: false, canRemove: false, canEdit: false, canDelete: false },
    });

    try {
      await member.save();
    } catch (e: any) {
      if (e.code === 11000)
        throw new GraphQLError('User is already a member of this group', { extensions: { code: 'BAD_USER_INPUT' } });
      throw e;
    }

    return mapMember(member);
  }

  static async leaveGroup(context: Context, groupId: string) {
    const tenantId = requireTenantId(context);
    if (!context.user) throw new GraphQLError('User not found', { extensions: { code: 'UNAUTHENTICATED' } });
    await assertGroupBelongsToTenant(groupId, tenantId);

    const member = await GroupMember.findOneAndDelete({
      groupId,
      userId: (context.user as any)._id.toString(),
    }).lean<IGroupMember>();
    if (!member) throw new GraphQLError('User is not a member of this group', { extensions: { code: 'NOT_FOUND' } });
    return mapMember(member);
  }

  static async bulkAddGroupMembers(context: Context, groupId: string, userIds: string[], role: string = 'member') {
    const tenantId = requireTenantId(context);
    await assertGroupBelongsToTenant(groupId, tenantId);

    const members = userIds.map((userId) => ({
      groupId,
      userId,
      role,
      isActive: true,
      permissions: { canInvite: false, canRemove: false, canEdit: false, canDelete: false },
    }));

    // ordered:false continues past duplicate key errors (existing members are silently skipped)
    let insertedCount = 0;
    try {
      const result = await GroupMember.insertMany(members, { ordered: false });
      insertedCount = result.length;
    } catch (e: any) {
      if (e.code === 11000 || e.writeErrors) {
        insertedCount = e.insertedDocs?.length ?? 0;
      } else {
        throw e;
      }
    }

    return { success: true, addedCount: insertedCount };
  }

  static async bulkRemoveGroupMembers(context: Context, groupId: string, userIds: string[]) {
    const tenantId = requireTenantId(context);
    await assertGroupBelongsToTenant(groupId, tenantId);

    const result = await GroupMember.deleteMany({ groupId, userId: { $in: userIds } });
    return { success: true, removedCount: result.deletedCount };
  }

  static async getGroupTenant(_context: Context, groupId: string) {
    const group = await Group.findById(groupId).lean();
    if (!group) throw new GraphQLError('Group not found', { extensions: { code: 'NOT_FOUND' } });
    return { id: group.tenant };
  }

  static async getGroupCreator(_context: Context, groupId: string) {
    const group = await Group.findById(groupId).lean();
    if (!group) throw new GraphQLError('Group not found', { extensions: { code: 'NOT_FOUND' } });
    return { id: group.createdBy };
  }

  static async getGroupMembersList(_context: Context, groupId: string) {
    const members = await GroupMember.find({ groupId, isActive: true }).lean<IGroupMember[]>();
    return members.map(mapMember);
  }

  static async getGroupMemberCount(_context: Context, groupId: string) {
    return GroupMember.countDocuments({ groupId, isActive: true });
  }

  static async getGroupMemberUser(_context: Context, memberId: string) {
    const member = await GroupMember.findById(memberId).lean<IGroupMember>();
    if (!member) throw new GraphQLError('Group member not found', { extensions: { code: 'NOT_FOUND' } });
    return { id: member.userId };
  }

  static async getGroupMemberGroup(_context: Context, memberId: string) {
    const member = await GroupMember.findById(memberId).lean<IGroupMember>();
    if (!member) throw new GraphQLError('Group member not found', { extensions: { code: 'NOT_FOUND' } });
    return { id: member.groupId };
  }
}
