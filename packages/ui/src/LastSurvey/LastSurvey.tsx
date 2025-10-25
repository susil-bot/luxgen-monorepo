import React from 'react';
import { BaseComponentProps, TenantTheme } from '../types';
import { withSSR } from '../ssr';
import { defaultTheme } from '../theme';
import { 
  getLastSurveyStyles, 
  lastSurveyClasses,
  lastSurveyCSS 
} from './styles';

export interface Survey {
  id: string;
  title: string;
  status: 'active' | 'completed' | 'draft' | 'closed';
  progress: number;
  totalResponses: number;
  targetResponses?: number;
  createdAt: string;
  expiresAt?: string;
  description?: string;
}

export interface LastSurveyProps extends BaseComponentProps {
  tenantTheme?: TenantTheme;
  title?: string;
  survey: Survey;
  showProgress?: boolean;
  showActions?: boolean;
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
  onViewSurvey?: (survey: Survey) => void;
  onEditSurvey?: (survey: Survey) => void;
  onShareSurvey?: (survey: Survey) => void;
}

const LastSurveyComponent: React.FC<LastSurveyProps> = ({
  tenantTheme = defaultTheme,
  title = 'Last Survey',
  survey,
  showProgress = true,
  showActions = true,
  className = '',
  variant = 'default',
  onViewSurvey,
  onEditSurvey,
  onShareSurvey,
  ...props
}) => {
  const styles = getLastSurveyStyles(tenantTheme, variant);

  const getStatusColor = (status: Survey['status']) => {
    switch (status) {
      case 'active':
        return '#10B981';
      case 'completed':
        return '#3B82F6';
      case 'draft':
        return '#F59E0B';
      case 'closed':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status: Survey['status']) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'completed':
        return 'Completed';
      case 'draft':
        return 'Draft';
      case 'closed':
        return 'Closed';
      default:
        return 'Unknown';
    }
  };

  return (
    <>
      <style>{lastSurveyCSS}</style>
      <div className={`${lastSurveyClasses.container} ${className}`} style={styles.container} {...props}>
        <div className={lastSurveyClasses.header} style={styles.header}>
          <h3 className={lastSurveyClasses.title} style={styles.title}>
            {title}
          </h3>
          <span
            className={lastSurveyClasses.status}
            style={{
              ...styles.status,
              backgroundColor: getStatusColor(survey.status),
              color: '#FFFFFF'
            }}
          >
            {getStatusText(survey.status)}
          </span>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <h4 style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: tenantTheme.colors.text,
            margin: 0,
            marginBottom: '8px'
          }}>
            {survey.title}
          </h4>
          {survey.description && (
            <p style={{
              fontSize: '0.875rem',
              color: tenantTheme.colors.textSecondary || '#64748B',
              margin: 0,
              marginBottom: '8px'
            }}>
              {survey.description}
            </p>
          )}
          <div style={{
            fontSize: '0.75rem',
            color: tenantTheme.colors.textSecondary || '#64748B'
          }}>
            Created: {survey.createdAt}
            {survey.expiresAt && ` • Expires: ${survey.expiresAt}`}
          </div>
        </div>

        {showProgress && (
          <div className={lastSurveyClasses.progress} style={styles.progress}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{
                fontSize: '0.875rem',
                fontWeight: '500',
                color: tenantTheme.colors.text
              }}>
                Progress
              </span>
              <span style={{
                fontSize: '0.875rem',
                color: tenantTheme.colors.textSecondary || '#64748B'
              }}>
                {survey.totalResponses}{survey.targetResponses ? ` / ${survey.targetResponses}` : ''} responses
              </span>
            </div>
            <div className={lastSurveyClasses.progressBar} style={styles.progressBar}>
              <div
                className={lastSurveyClasses.progressFill}
                style={{
                  ...styles.progressFill,
                  width: `${survey.progress}%`
                }}
              />
            </div>
            <p className={lastSurveyClasses.progressText} style={styles.progressText}>
              {survey.progress}% complete
            </p>
          </div>
        )}

        {showActions && (
          <div style={{
            display: 'flex',
            gap: '8px',
            marginTop: '16px'
          }}>
            <button
              onClick={() => onViewSurvey?.(survey)}
              style={{
                flex: 1,
                padding: '8px 16px',
                backgroundColor: tenantTheme.colors.primary,
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              View Survey
            </button>
            <button
              onClick={() => onEditSurvey?.(survey)}
              style={{
                padding: '8px 12px',
                backgroundColor: '#F3F4F6',
                color: tenantTheme.colors.text,
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Edit
            </button>
            <button
              onClick={() => onShareSurvey?.(survey)}
              style={{
                padding: '8px 12px',
                backgroundColor: '#F3F4F6',
                color: tenantTheme.colors.text,
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Share
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export const LastSurvey = withSSR(LastSurveyComponent);