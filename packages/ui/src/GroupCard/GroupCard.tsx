import React from 'react';
import { withSSR } from '../ssr';
import { defaultTheme, TenantTheme } from '../theme';

export interface GroupCardProps {
  tenantTheme?: TenantTheme;
  group: {
    id: string;
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    memberCount: number;
    isActive: boolean;
    settings?: {
      trainingEnabled: boolean;
      nudgeEnabled: boolean;
      reportingEnabled: boolean;
    };
    createdAt: string;
    updatedAt: string;
  };
  onEdit?: (group: any) => void;
  onDelete?: (groupId: string) => void;
  onViewMembers?: (groupId: string) => void;
  onManageSettings?: (groupId: string) => void;
  className?: string;
  variant?: 'default' | 'compact' | 'minimal';
  showActions?: boolean;
  showStats?: boolean;
}

const GroupCardComponent: React.FC<GroupCardProps> = ({
  tenantTheme = defaultTheme,
  group,
  onEdit,
  onDelete,
  onViewMembers,
  onManageSettings,
  className = '',
  variant = 'default',
  showActions = true,
  showStats = true,
  ...props
}) => {
  const colors = tenantTheme?.colors || defaultTheme.colors;
  const groupColor = group.color || colors.primary;

  const getVariantStyles = () => {
    switch (variant) {
      case 'compact':
        return {
          container: 'p-4',
          header: 'mb-2',
          title: 'text-lg',
          description: 'text-sm',
          stats: 'text-xs',
        };
      case 'minimal':
        return {
          container: 'p-3',
          header: 'mb-1',
          title: 'text-base',
          description: 'text-xs',
          stats: 'text-xs',
        };
      case 'default':
      default:
        return {
          container: 'p-6',
          header: 'mb-4',
          title: 'text-xl',
          description: 'text-base',
          stats: 'text-sm',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div
      className={`
        ${styles.container}
        bg-white rounded-lg shadow-sm border border-gray-200
        hover:shadow-md transition-shadow duration-200
        ${className}
      `}
      {...props}
    >
      {/* Header */}
      <div className={styles.header}>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {/* Group Icon */}
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-semibold"
              style={{ backgroundColor: groupColor }}
            >
              {group.icon ? (
                <span className="text-xl">{group.icon}</span>
              ) : (
                <span className="text-xl">
                  {group.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {/* Group Info */}
            <div className="flex-1 min-w-0">
              <h3 className={`${styles.title} font-semibold text-gray-900 truncate`}>
                {group.name}
              </h3>
              {group.description && (
                <p className={`${styles.description} text-gray-600 mt-1 line-clamp-2`}>
                  {group.description}
                </p>
              )}
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center space-x-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                group.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {group.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      {showStats && (
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className={`${styles.stats} font-semibold text-gray-900`}>
              {group.memberCount}
            </div>
            <div className="text-xs text-gray-500">Members</div>
          </div>
          
          {group.settings?.trainingEnabled && (
            <div className="text-center">
              <div className={`${styles.stats} font-semibold text-blue-600`}>
                Training
              </div>
              <div className="text-xs text-gray-500">Enabled</div>
            </div>
          )}
          
          {group.settings?.nudgeEnabled && (
            <div className="text-center">
              <div className={`${styles.stats} font-semibold text-purple-600`}>
                Nudges
              </div>
              <div className="text-xs text-gray-500">Enabled</div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onViewMembers?.(group.id)}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors duration-200"
            >
              View Members
            </button>
            
            {group.settings?.reportingEnabled && (
              <button
                onClick={() => onManageSettings?.(group.id)}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors duration-200"
              >
                Reports
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEdit?.(group)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200"
              title="Edit Group"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            
            <button
              onClick={() => onDelete?.(group.id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
              title="Delete Group"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Created {new Date(group.createdAt).toLocaleDateString()}</span>
          <span>Updated {new Date(group.updatedAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export const GroupCard = withSSR(GroupCardComponent);
