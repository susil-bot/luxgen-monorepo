import React from 'react';
import { withSSR } from '../ssr';

export interface GroupMemberListProps {
  members: Array<{
    id: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
    role: string;
    joinedAt: string;
    permissions: string[];
  }>;
  selectedMembers?: string[];
  onSelectMember?: (memberId: string) => void;
  onSelectAll?: () => void;
  onBulkAction?: (action: string, memberIds: string[]) => void;
  onManagePermissions?: (memberId: string) => void;
  onRemoveMember?: (memberId: string) => void;
  className?: string;
  showFilters?: boolean;
  showBulkActions?: boolean;
}

const GroupMemberListComponent: React.FC<GroupMemberListProps> = ({
  members,
  selectedMembers = [],
  onSelectMember,
  onSelectAll,
  onBulkAction,
  onManagePermissions,
  onRemoveMember,
  className = '',
  showFilters = true,
  showBulkActions = true,
  ...props
}) => {
  const getRoleBadgeVariant = (role: string) => {
    switch (role.toLowerCase()) {
      case 'super admin':
        return 'badge-purple';
      case 'admin':
        return 'badge-blue';
      case 'instructor':
        return 'badge-green';
      default:
        return 'badge-gray';
    }
  };

  const getPermissionBadgeVariant = (permission: string) => {
    switch (permission.toLowerCase()) {
      case 'admin':
        return 'badge-red';
      case 'edit':
        return 'badge-blue';
      case 'view':
        return 'badge-gray';
      default:
        return 'badge-gray';
    }
  };

  return (
    <div className={`surface ${className}`} {...props}>
      {/* Header */}
      <div
        className="px-6 py-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--color-separator)' }}
      >
        <div>
          <h3 className="text-base font-semibold text-primary">Group Members ({members.length})</h3>
          <p className="text-xs text-secondary mt-0.5">Manage group members and their permissions</p>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="px-6 py-3" style={{ backgroundColor: 'var(--color-fill-quaternary)' }}>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input type="text" placeholder="Search members..." className="input-field text-sm" />
            </div>
            <select className="input-field text-sm w-40">
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="instructor">Instructor</option>
              <option value="learner">Learner</option>
            </select>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {showBulkActions && selectedMembers.length > 0 && (
        <div
          className="px-6 py-3"
          style={{ backgroundColor: 'rgba(10, 132, 255, 0.08)', borderBottom: '1px solid rgba(10, 132, 255, 0.2)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: 'var(--color-blue)' }}>
              {selectedMembers.length} member{selectedMembers.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <button className="ios-btn-plain text-xs">Change Role</button>
              <button className="ios-btn-plain text-xs" style={{ color: 'var(--color-red)' }}>
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Members List */}
      <div className="divide-y" style={{ borderColor: 'var(--color-separator)' }}>
        {members.map((member) => (
          <div key={member.id} className="px-6 py-4 hover:bg-[var(--color-fill-quaternary)] transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {onSelectMember && (
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(member.id)}
                    onChange={() => onSelectMember(member.id)}
                    className="h-4 w-4 rounded"
                    style={{ accentColor: 'var(--color-blue)' }}
                  />
                )}
                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium"
                  style={{ backgroundColor: 'var(--color-blue)', color: 'white' }}
                >
                  {member.user.firstName.charAt(0)}
                  {member.user.lastName.charAt(0)}
                </div>

                {/* Member Info */}
                <div>
                  <h4 className="text-sm font-medium text-primary truncate">
                    {member.user.firstName} {member.user.lastName}
                  </h4>
                  <p className="text-xs text-secondary">{member.user.email}</p>
                  <p className="text-xs text-secondary mt-0.5">
                    Joined {new Date(member.joinedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Permissions */}
                <div className="flex flex-wrap gap-1.5">
                  {member.permissions.slice(0, 2).map((permission) => (
                    <span key={permission} className={`badge ${getPermissionBadgeVariant(permission)} text-xs`}>
                      {permission}
                    </span>
                  ))}
                  {member.permissions.length > 2 && (
                    <span className="badge badge-gray text-xs">+{member.permissions.length - 2}</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onManagePermissions?.(member.id)}
                    className="p-2 rounded-lg transition-colors"
                    style={{ color: 'var(--color-label-tertiary)' }}
                    title="Manage Permissions"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => onRemoveMember?.(member.id)}
                    className="p-2 rounded-lg transition-colors"
                    style={{ color: 'var(--color-label-tertiary)' }}
                    title="Remove Member"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        className="px-6 py-3 flex items-center justify-between text-xs text-secondary"
        style={{ borderTop: '1px solid var(--color-separator)' }}
      >
        <span>
          Showing {members.length} of {members.length} members
        </span>
        <div className="flex items-center gap-4">
          <button className="ios-btn-plain text-xs">Export</button>
          <button className="ios-btn-plain text-xs">Invite Members</button>
        </div>
      </div>
    </div>
  );
};

export const GroupMemberList = withSSR(GroupMemberListComponent);
