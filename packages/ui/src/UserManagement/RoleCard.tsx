import React from 'react';
import { RoleCardProps } from './types';

export const RoleCard: React.FC<RoleCardProps> = ({
  role,
  onEdit,
  onCopy,
  onViewUsers
}) => {
  const handleEdit = () => {
    if (onEdit) {
      onEdit(role.id);
    }
  };

  const handleCopy = () => {
    if (onCopy) {
      onCopy(role.id);
    }
  };

  const handleViewUsers = () => {
    if (onViewUsers) {
      onViewUsers(role.id);
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">{role.name}</h3>
        <button
          onClick={handleEdit}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          Edit Role
        </button>
      </div>
      
      <div className="mb-3">
        <p className="text-sm text-gray-600 mb-2">Total {role.userCount} users</p>
        <div className="flex -space-x-2">
          {role.users.slice(0, 4).map((user, index) => (
            <div
              key={user.id}
              className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white text-xs font-medium"
              title={user.name}
            >
              {user.name.charAt(0)}
            </div>
          ))}
          {role.userCount > 4 && (
            <div 
              className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-gray-600 text-xs font-medium cursor-pointer hover:bg-gray-400"
              title={`+${role.userCount - 4} more users`}
              onClick={handleViewUsers}
            >
              +{role.userCount - 4}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">{role.name}</span>
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleCopy}
            className="text-gray-400 hover:text-gray-600"
            title="Copy role"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
              <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
