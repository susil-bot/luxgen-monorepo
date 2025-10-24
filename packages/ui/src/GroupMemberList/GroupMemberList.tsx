import React, { useState } from 'react';
import { withSSR } from '../ssr';
import { defaultTheme, TenantTheme } from '../theme';
import { Button } from '../Button';
import { Input } from '../Input';
import { Select } from '../Select';

export interface GroupMember {
  id: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  role: 'ADMIN' | 'MODERATOR' | 'MEMBER';
  joinedAt: string;
  isActive: boolean;
  permissions?: {
    canInviteMembers: boolean;
    canRemoveMembers: boolean;
    canEditGroup: boolean;
    canViewReports: boolean;
    canManageTraining: boolean;
    canSendNudges: boolean;
  };
}

export interface GroupMemberListProps {
  tenantTheme?: TenantTheme;
  members: GroupMember[];
  onRoleChange?: (memberId: string, role: string) => void;
  onRemoveMember?: (memberId: string) => void;
  onUpdatePermissions?: (memberId: string, permissions: any) => void;
  onAddMembers?: () => void;
  onBulkAction?: (action: string, memberIds: string[]) => void;
  className?: string;
  showActions?: boolean;
  showPermissions?: boolean;
  allowRoleChange?: boolean;
  allowMemberRemoval?: boolean;
  currentUserRole?: string;
}

const GroupMemberListComponent: React.FC<GroupMemberListProps> = ({
  tenantTheme = defaultTheme,
  members,
  onRoleChange,
  onRemoveMember,
  onUpdatePermissions,
  onAddMembers,
  onBulkAction,
  className = '',
  showActions = true,
  showPermissions = true,
  allowRoleChange = true,
  allowMemberRemoval = true,
  currentUserRole = 'MEMBER',
  ...props
}) => {
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const filteredMembers = members.filter((member) => {
    const matchesSearch = 
      member.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = !roleFilter || member.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const handleSelectMember = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSelectAll = () => {
    if (selectedMembers.length === filteredMembers.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(filteredMembers.map(member => member.id));
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'MODERATOR':
        return 'bg-yellow-100 text-yellow-800';
      case 'MEMBER':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const canManageMembers = ['ADMIN', 'SUPER_ADMIN'].includes(currentUserRole);

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`} {...props}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Group Members ({members.length})
            </h3>
            <p className="text-sm text-gray-600">
              Manage group members and their permissions
            </p>
          </div>
          
          {onAddMembers && canManageMembers && (
            <Button onClick={onAddMembers} size="sm">
              Add Members
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <Input
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          
          <Select
            value={roleFilter}
            onChange={setRoleFilter}
            options={[
              { value: '', label: 'All Roles' },
              { value: 'ADMIN', label: 'Admin' },
              { value: 'MODERATOR', label: 'Moderator' },
              { value: 'MEMBER', label: 'Member' },
            ]}
            className="w-40"
          />
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedMembers.length > 0 && onBulkAction && (
        <div className="px-6 py-3 bg-blue-50 border-b border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-800">
              {selectedMembers.length} member(s) selected
            </span>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onBulkAction('changeRole', selectedMembers)}
              >
                Change Role
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onBulkAction('remove', selectedMembers)}
              >
                Remove
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Members List */}
      <div className="divide-y divide-gray-200">
        {filteredMembers.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <div className="text-gray-500">
              {searchTerm || roleFilter ? 'No members found matching your criteria' : 'No members in this group'}
            </div>
          </div>
        ) : (
          filteredMembers.map((member) => (
            <div key={member.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Checkbox */}
                  {canManageMembers && (
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(member.id)}
                      onChange={() => handleSelectMember(member.id)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  )}

                  {/* Avatar */}
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700">
                      {member.user.firstName.charAt(0)}{member.user.lastName.charAt(0)}
                    </span>
                  </div>

                  {/* Member Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {member.user.firstName} {member.user.lastName}
                      </h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(member.role)}`}>
                        {member.role}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{member.user.email}</p>
                    <p className="text-xs text-gray-500">
                      Joined {new Date(member.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                {showActions && canManageMembers && (
                  <div className="flex items-center space-x-2">
                    {allowRoleChange && onRoleChange && (
                      <Select
                        value={member.role}
                        onChange={(role) => onRoleChange(member.id, role)}
                        options={[
                          { value: 'MEMBER', label: 'Member' },
                          { value: 'MODERATOR', label: 'Moderator' },
                          { value: 'ADMIN', label: 'Admin' },
                        ]}
                        size="sm"
                        className="w-32"
                      />
                    )}
                    
                    {allowMemberRemoval && onRemoveMember && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onRemoveMember(member.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Permissions */}
              {showPermissions && member.permissions && (
                <div className="mt-3 ml-14">
                  <div className="text-xs text-gray-500 mb-2">Permissions:</div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(member.permissions).map(([key, value]) => (
                      <span
                        key={key}
                        className={`px-2 py-1 text-xs rounded ${
                          value 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {filteredMembers.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {filteredMembers.length} of {members.length} members
            </span>
            {canManageMembers && (
              <button
                onClick={handleSelectAll}
                className="text-blue-600 hover:text-blue-700"
              >
                {selectedMembers.length === filteredMembers.length ? 'Deselect All' : 'Select All'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const GroupMemberList = withSSR(GroupMemberListComponent);
