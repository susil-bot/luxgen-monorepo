import { GraphQLContext } from '../../context';
import { GroupService } from '../../services/groupService';
import type {
  AddGroupMemberInput,
  CreateGroupInput,
  GroupMemberParent,
  GroupMembersQueryArgs,
  GroupMemberRole,
  GroupParent,
  GroupsQueryArgs,
  RemoveGroupMemberInput,
  UpdateGroupInput,
  UpdateGroupMemberInput,
  UserGroupsQueryArgs,
} from './types';

export const groupResolvers = {
  Query: {
    groups: async (_: unknown, args: GroupsQueryArgs, context: GraphQLContext) => {
      return await GroupService.getGroups(context, args);
    },

    group: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
      return await GroupService.getGroupById(context, id);
    },

    groupMembers: async (_: unknown, args: GroupMembersQueryArgs, context: GraphQLContext) => {
      return await GroupService.getGroupMembers(context, args);
    },

    userGroups: async (_: unknown, args: UserGroupsQueryArgs, context: GraphQLContext) => {
      return await GroupService.getUserGroups(context, args);
    },
  },

  Mutation: {
    createGroup: async (_: unknown, { input }: { input: CreateGroupInput }, context: GraphQLContext) => {
      return await GroupService.createGroup(context, input);
    },

    updateGroup: async (_: unknown, { input }: { input: UpdateGroupInput }, context: GraphQLContext) => {
      return await GroupService.updateGroup(context, input);
    },

    deleteGroup: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
      return await GroupService.deleteGroup(context, id);
    },

    addGroupMember: async (_: unknown, { input }: { input: AddGroupMemberInput }, context: GraphQLContext) => {
      return await GroupService.addGroupMember(context, input);
    },

    removeGroupMember: async (_: unknown, { input }: { input: RemoveGroupMemberInput }, context: GraphQLContext) => {
      return await GroupService.removeGroupMember(context, input);
    },

    updateGroupMember: async (_: unknown, { input }: { input: UpdateGroupMemberInput }, context: GraphQLContext) => {
      return await GroupService.updateGroupMember(context, input);
    },

    joinGroup: async (_: unknown, { groupId }: { groupId: string }, context: GraphQLContext) => {
      return await GroupService.joinGroup(context, groupId);
    },

    leaveGroup: async (_: unknown, { groupId }: { groupId: string }, context: GraphQLContext) => {
      return await GroupService.leaveGroup(context, groupId);
    },

    bulkAddGroupMembers: async (
      _: unknown,
      { groupId, userIds, role }: { groupId: string; userIds: string[]; role?: GroupMemberRole },
      context: GraphQLContext,
    ) => {
      return await GroupService.bulkAddGroupMembers(context, groupId, userIds, role);
    },

    bulkRemoveGroupMembers: async (
      _: unknown,
      { groupId, userIds }: { groupId: string; userIds: string[] },
      context: GraphQLContext,
    ) => {
      return await GroupService.bulkRemoveGroupMembers(context, groupId, userIds);
    },
  },

  Group: {
    tenant: async (parent: GroupParent, _: unknown, context: GraphQLContext) => {
      return await GroupService.getGroupTenant(context, parent.id);
    },

    createdBy: async (parent: GroupParent, _: unknown, context: GraphQLContext) => {
      return await GroupService.getGroupCreator(context, parent.id);
    },

    members: async (parent: GroupParent, _: unknown, context: GraphQLContext) => {
      return await GroupService.getGroupMembersList(context, parent.id);
    },

    memberCount: async (parent: GroupParent, _: unknown, context: GraphQLContext) => {
      return await GroupService.getGroupMemberCount(context, parent.id);
    },
  },

  GroupMember: {
    user: async (parent: GroupMemberParent, _: unknown, context: GraphQLContext) => {
      return await GroupService.getGroupMemberUser(context, parent.id);
    },

    group: async (parent: GroupMemberParent, _: unknown, context: GraphQLContext) => {
      return await GroupService.getGroupMemberGroup(context, parent.id);
    },
  },
};
