import React from 'react';
import { withSSR } from '../ssr';

export interface GroupDashboardCardProps {
  group: {
    id: string;
    name: string;
    totalUsers: number;
    activeUsers: number;
    maxUsers?: number;
    role: 'Super Admin' | 'Admin' | 'Moderator' | 'Member';
    progress: number;
    maxProgress: number;
    status: 'Active' | 'Inactive' | 'Pending' | 'Backlog';
    members: Array<{
      id: string;
      name: string;
      avatar?: string;
    }>;
    tasks?: number;
    comments?: number;
  };
  onEdit?: () => void;
  onViewDetails?: () => void;
  onManageUsers?: () => void;
  className?: string;
  showActions?: boolean;
}

const GroupDashboardCardComponent: React.FC<GroupDashboardCardProps> = ({
  group,
  onEdit,
  onViewDetails,
  onManageUsers,
  className = '',
  showActions = true,
  ...props
}) => {
  const progressPercentage = group.maxProgress > 0 ? (group.progress / group.maxProgress) * 100 : 0;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'backlog':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'super admin':
        return 'bg-blue-100 text-blue-800';
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'moderator':
        return 'bg-yellow-100 text-yellow-800';
      case 'member':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`} {...props}>
      {/* Header Section */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Total {group.totalUsers} User{group.totalUsers !== 1 ? 's' : ''}
          </h3>
        </div>
        
        {/* Member Avatars */}
        <div className="flex items-center -space-x-2">
          {group.members.slice(0, 3).map((member, index) => (
            <div
              key={member.id}
              className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600"
              style={{ zIndex: 10 - index }}
            >
              {member.avatar ? (
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                member.name.charAt(0).toUpperCase()
              )}
            </div>
          ))}
          {group.members.length > 3 && (
            <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
              +{group.members.length - 3}
            </div>
          )}
        </div>
      </div>

      {/* Role Badge */}
      <div className="flex justify-center mb-4">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(group.role)}`}>
          {group.role}
        </span>
      </div>

      {/* Active Users Section */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-base text-gray-700">Active Users</span>
          <span className="text-base font-medium text-gray-900">
            {group.activeUsers}/{group.maxUsers || group.totalUsers}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="flex items-center space-x-3">
          <div className="flex-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-3 bg-purple-500 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          
          {/* Document Icon */}
          <div className="flex items-center space-x-1 text-purple-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Status Section */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 text-purple-600">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </div>
          <span className="text-base text-gray-700">Edit User</span>
        </div>
        
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(group.status)}`}>
          {group.status}
        </span>
      </div>

      {/* Footer Section */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-4">
          {/* User Avatar */}
          <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          
          {/* Add User Icon */}
          <button
            onClick={onManageUsers}
            className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors duration-200"
            title="Add User"
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>

        <div className="flex items-center space-x-4">
          {/* Tasks Count */}
          {group.tasks !== undefined && (
            <div className="flex items-center space-x-1 text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm font-medium">{group.tasks}</span>
            </div>
          )}
          
          {/* Comments Count */}
          {group.comments !== undefined && (
            <div className="flex items-center space-x-1 text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-sm font-medium">{group.comments}</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <button
              onClick={onViewDetails}
              className="text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              View Details
            </button>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={onEdit}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200"
                title="Edit Group"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const GroupDashboardCard = withSSR(GroupDashboardCardComponent);