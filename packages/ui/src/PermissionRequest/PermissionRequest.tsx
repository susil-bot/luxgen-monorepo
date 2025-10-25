import React from 'react';
import { BaseComponentProps, TenantTheme } from '../types';
import { withSSR } from '../ssr';
import { defaultTheme } from '../theme';
import { 
  getPermissionRequestStyles, 
  permissionRequestClasses,
  permissionRequestCSS 
} from './styles';

export interface PermissionRequest {
  id: string;
  user: {
    name: string;
    email: string;
    avatar?: string;
    initials?: string;
  };
  permission: string;
  resource: string;
  requestedAt: string;
  reason?: string;
  status: 'pending' | 'approved' | 'denied';
  avatarColor?: string;
}

export interface PermissionRequestProps extends BaseComponentProps {
  tenantTheme?: TenantTheme;
  title?: string;
  requests: PermissionRequest[];
  maxItems?: number;
  showActions?: boolean;
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
  onApprove?: (request: PermissionRequest) => void;
  onDeny?: (request: PermissionRequest) => void;
  onViewDetails?: (request: PermissionRequest) => void;
}

const PermissionRequestComponent: React.FC<PermissionRequestProps> = ({
  tenantTheme = defaultTheme,
  title = 'Permission Requests',
  requests,
  maxItems = 5,
  showActions = true,
  className = '',
  variant = 'default',
  onApprove,
  onDeny,
  onViewDetails,
  ...props
}) => {
  const styles = getPermissionRequestStyles(tenantTheme, variant);

  const displayRequests = requests.slice(0, maxItems);
  const pendingRequests = displayRequests.filter(r => r.status === 'pending');

  const getAvatarColor = (request: PermissionRequest) => {
    if (request.avatarColor) return request.avatarColor;
    
    // Generate consistent color based on user name
    const colors = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
      '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'
    ];
    const hash = request.user.name.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStatusColor = (status: PermissionRequest['status']) => {
    switch (status) {
      case 'pending':
        return '#F59E0B';
      case 'approved':
        return '#10B981';
      case 'denied':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status: PermissionRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'approved':
        return 'Approved';
      case 'denied':
        return 'Denied';
      default:
        return 'Unknown';
    }
  };

  return (
    <>
      <style>{permissionRequestCSS}</style>
      <div className={`${permissionRequestClasses.container} ${className}`} style={styles.container} {...props}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 className={permissionRequestClasses.title} style={styles.title}>
            {title}
          </h3>
          {pendingRequests.length > 0 && (
            <span style={{
              padding: '4px 8px',
              backgroundColor: '#FEF3C7',
              color: '#92400E',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: '500'
            }}>
              {pendingRequests.length} pending
            </span>
          )}
        </div>

        <div style={{ marginBottom: '16px' }}>
          {displayRequests.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '24px',
              color: tenantTheme.colors.textSecondary || '#64748B',
              fontSize: '0.875rem'
            }}>
              No permission requests
            </div>
          ) : (
            displayRequests.map((request) => (
              <div
                key={request.id}
                className={permissionRequestClasses.requestItem}
                style={styles.requestItem}
              >
                <div className={permissionRequestClasses.requestUser} style={styles.requestUser}>
                  {/* Avatar */}
                  <div
                    className={permissionRequestClasses.requestAvatar}
                    style={{
                      ...styles.requestAvatar,
                      backgroundColor: getAvatarColor(request)
                    }}
                  >
                    {request.user.avatar ? (
                      <img
                        src={request.user.avatar}
                        alt={request.user.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: '50%',
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      request.user.initials || getInitials(request.user.name)
                    )}
                  </div>

                  {/* User Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: tenantTheme.colors.text,
                      marginBottom: '2px'
                    }}>
                      {request.user.name}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: tenantTheme.colors.textSecondary || '#64748B',
                      marginBottom: '4px'
                    }}>
                      {request.user.email}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: tenantTheme.colors.textSecondary || '#64748B'
                    }}>
                      {request.permission} access to {request.resource}
                    </div>
                    {request.reason && (
                      <div style={{
                        fontSize: '0.75rem',
                        color: tenantTheme.colors.textSecondary || '#64748B',
                        fontStyle: 'italic',
                        marginTop: '4px'
                      }}>
                        "{request.reason}"
                      </div>
                    )}
                    <div style={{
                      fontSize: '0.75rem',
                      color: tenantTheme.colors.textSecondary || '#64748B',
                      marginTop: '4px'
                    }}>
                      {request.requestedAt}
                    </div>
                  </div>

                  {/* Status */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: '8px'
                  }}>
                    <span style={{
                      padding: '2px 6px',
                      backgroundColor: getStatusColor(request.status),
                      color: '#FFFFFF',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}>
                      {getStatusText(request.status)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                {showActions && request.status === 'pending' && (
                  <div className={permissionRequestClasses.requestActions} style={styles.requestActions}>
                    <button
                      className={`${permissionRequestClasses.requestButton} ${permissionRequestClasses.approveButton}`}
                      style={{
                        ...styles.requestButton,
                        ...styles.approveButton
                      }}
                      onClick={() => onApprove?.(request)}
                    >
                      Approve
                    </button>
                    <button
                      className={`${permissionRequestClasses.requestButton} ${permissionRequestClasses.denyButton}`}
                      style={{
                        ...styles.requestButton,
                        ...styles.denyButton
                      }}
                      onClick={() => onDeny?.(request)}
                    >
                      Deny
                    </button>
                    <button
                      onClick={() => onViewDetails?.(request)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#F3F4F6',
                        color: tenantTheme.colors.text,
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Details
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export const PermissionRequest = withSSR(PermissionRequestComponent);