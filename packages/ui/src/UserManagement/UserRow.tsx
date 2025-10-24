import React from 'react';
import { UserRowProps } from './types';
import { Chip } from '../Chip';

export const UserRow: React.FC<UserRowProps> = ({
  user,
  selected = false,
  onSelect,
  onAction,
  showCheckbox = true
}) => {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'inactive': return 'error';
      default: return 'info';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Admin': return '🔴';
      case 'Editor': return '✏️';
      case 'Author': return '⚙️';
      case 'Maintainer': return '🔄';
      case 'Subscriber': return '👤';
      default: return '👤';
    }
  };

  const handleSelect = () => {
    if (onSelect) {
      onSelect(user.id);
    }
  };

  const handleAction = (action: string) => {
    if (onAction) {
      onAction(user.id, action);
    }
  };

  return (
    <tr className="hover:bg-gray-50">
      {showCheckbox && (
        <td className="px-6 py-4">
          <input
            type="checkbox"
            checked={selected}
            onChange={handleSelect}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </td>
      )}
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
            {user.name.charAt(0)}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{user.name}</div>
            <div className="text-sm text-gray-500">@{user.username}</div>
          </div>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <span className="mr-2">{getRoleIcon(user.role)}</span>
          <span className="text-sm text-gray-900">{user.role}</span>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.plan}</td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <Chip
          label={user.status.charAt(0).toUpperCase() + user.status.slice(1)}
          variant={getStatusVariant(user.status)}
          size="small"
          shape="pill"
        />
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <button 
          onClick={() => handleAction('view')}
          className="text-blue-600 hover:text-blue-900"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
      </td>
    </tr>
  );
};
