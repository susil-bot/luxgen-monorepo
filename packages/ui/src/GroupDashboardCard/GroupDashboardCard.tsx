import React from 'react';
import { withSSR } from '../ssr';

export interface GroupDashboardCardProps {
  group: {
    id: string;
    name: string;
    totalUsers: number;
    activeUsers: number;
    maxUsers?: number;
    members: Array<{
      id: string;
      name: string;
      role: string;
      avatarUrl?: string;
    }>;
    tasks?: number;
    comments?: number;
  };
  onManageUsers?: (groupId: string) => void;
  onViewDetails?: (groupId: string) => void;
  onEdit?: (groupId: string) => void;
  className?: string;
}

const GroupDashboardCardComponent: React.FC<GroupDashboardCardProps> = ({
  group,
  onManageUsers,
  onViewDetails,
  onEdit,
  className = '',
  ...props
}) => {
  const getRoleBadgeVariant = (role: string) => {
    switch (role.toLowerCase()) {
      case 'super admin':
        return 'badge-purple';
      case 'admin':
        return 'badge-blue';
      default:
        return 'badge-gray';
    }
  };

  const progressPercentage = group.maxUsers
    ? Math.round((group.activeUsers / group.maxUsers) * 100)
    : Math.round((group.activeUsers / group.totalUsers) * 100);

  return (
    <div className={`surface p-6 ${className}`} {...props}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-primary">Total {group.totalUsers} Users</h3>
          <p className="text-xs text-secondary mt-0.5">{group.activeUsers} active members</p>
        </div>
        <span className={`badge ${getRoleBadgeVariant('admin')}`}>Admin</span>
      </div>

      {/* Member Avatars */}
      <div className="flex items-center mb-4">
        <div className="flex -space-x-2">
          {group.members.slice(0, 3).map((member, index) => (
            <div
              key={member.id}
              className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-medium"
              style={{
                borderColor: 'var(--color-bg-secondary)',
                backgroundColor: 'var(--color-blue)',
                color: 'white',
                zIndex: 10 - index,
              }}
            >
              {member.name.charAt(0).toUpperCase()}
            </div>
          ))}
          {group.members.length > 3 && (
            <div
              className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-medium"
              style={{
                borderColor: 'var(--color-bg-secondary)',
                backgroundColor: 'var(--color-fill-quaternary)',
                color: 'var(--color-label-secondary)',
              }}
            >
              +{group.members.length - 3}
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-secondary">Active Users</span>
          <span className="text-xs font-medium text-primary">
            {group.activeUsers}/{group.maxUsers || group.totalUsers}
          </span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-fill-quaternary)' }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${progressPercentage}%`,
              backgroundColor: 'var(--color-blue)',
            }}
          />
        </div>
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {group.tasks !== undefined && (
          <div className="flex items-center gap-2 text-secondary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
            <span className="text-xs">{group.tasks} tasks</span>
          </div>
        )}
        {group.comments !== undefined && (
          <div className="flex items-center gap-2 text-secondary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span className="text-xs">{group.comments} comments</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid var(--color-separator)' }}>
        <div className="flex items-center gap-2">
          <button onClick={() => onViewDetails?.(group.id)} className="ios-btn-plain text-sm">
            View Details
          </button>
          <button onClick={() => onEdit?.(group.id)} className="ios-btn-plain text-sm">
            Edit
          </button>
        </div>
        <button onClick={() => onManageUsers?.(group.id)} className="ios-btn-secondary text-sm">
          Manage Users
        </button>
      </div>
    </div>
  );
};

export const GroupDashboardCard = withSSR(GroupDashboardCardComponent);
