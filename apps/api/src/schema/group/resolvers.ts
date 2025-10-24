import { Context } from '../../context';
import { GroupService } from '../../services/groupService';

export const groupResolvers = {
  Query: {
    groups: async (
      _: any,
      args: {
        first?: number;
        after?: string;
        last?: number;
        before?: string;
        search?: string;
        isActive?: boolean;
        createdBy?: string;
      },
      context: Context
    ) => {
      return await GroupService.getGroups(context, args);
    },

    group: async (_: any, { id }: { id: string }, context: Context) => {
      return await GroupService.getGroupById(context, id);
    },

    groupMembers: async (
      _: any,
      args: {
        groupId: string;
        first?: number;
        after?: string;
        last?: number;
        before?: string;
        role?: string;
        isActive?: boolean;
      },
      context: Context
    ) => {
      return await GroupService.getGroupMembers(context, args);
    },

    userGroups: async (
      _: any,
      args: {
        userId: string;
        first?: number;
        after?: string;
        last?: number;
        before?: string;
        role?: string;
        isActive?: boolean;
      },
      context: Context
    ) => {
      return await GroupService.getUserGroups(context, args);
    },
  },

  Mutation: {
    createGroup: async (
      _: any,
      { input }: { input: any },
      context: Context
    ) => {
      return await GroupService.createGroup(context, input);
    },

    updateGroup: async (
      _: any,
      { input }: { input: any },
      context: Context
    ) => {
      return await GroupService.updateGroup(context, input);
    },

    deleteGroup: async (_: any, { id }: { id: string }, context: Context) => {
      return await GroupService.deleteGroup(context, id);
    },

    addGroupMember: async (
      _: any,
      { input }: { input: any },
      context: Context
    ) => {
      return await GroupService.addGroupMember(context, input);
    },

    removeGroupMember: async (
      _: any,
      { input }: { input: any },
      context: Context
    ) => {
      return await GroupService.removeGroupMember(context, input);
    },

    updateGroupMember: async (
      _: any,
      { input }: { input: any },
      context: Context
    ) => {
      return await GroupService.updateGroupMember(context, input);
    },

    joinGroup: async (
      _: any,
      { groupId }: { groupId: string },
      context: Context
    ) => {
      return await GroupService.joinGroup(context, groupId);
    },

    leaveGroup: async (
      _: any,
      { groupId }: { groupId: string },
      context: Context
    ) => {
      return await GroupService.leaveGroup(context, groupId);
    },

    bulkAddGroupMembers: async (
      _: any,
      { groupId, userIds, role }: { groupId: string; userIds: string[]; role?: string },
      context: Context
    ) => {
      return await GroupService.bulkAddGroupMembers(context, groupId, userIds, role);
    },

    bulkRemoveGroupMembers: async (
      _: any,
      { groupId, userIds }: { groupId: string; userIds: string[] },
      context: Context
    ) => {
      return await GroupService.bulkRemoveGroupMembers(context, groupId, userIds);
    },
  },

  Group: {
    tenant: async (parent: any, _: any, context: Context) => {
      return await GroupService.getGroupTenant(context, parent.id);
    },

    createdBy: async (parent: any, _: any, context: Context) => {
      return await GroupService.getGroupCreator(context, parent.id);
    },

    members: async (parent: any, _: any, context: Context) => {
      return await GroupService.getGroupMembersList(context, parent.id);
    },

    memberCount: async (parent: any, _: any, context: Context) => {
      return await GroupService.getGroupMemberCount(context, parent.id);
    },
  },

  GroupMember: {
    user: async (parent: any, _: any, context: Context) => {
      return await GroupService.getGroupMemberUser(context, parent.id);
    },

    group: async (parent: any, _: any, context: Context) => {
      return await GroupService.getGroupMemberGroup(context, parent.id);
    },
  },
};
