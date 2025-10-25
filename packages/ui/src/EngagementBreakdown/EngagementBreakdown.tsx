import React from 'react';
import { BaseComponentProps, TenantTheme } from '../types';
import { withSSR } from '../ssr';
import { defaultTheme } from '../theme';
import { 
  getEngagementBreakdownStyles, 
  engagementBreakdownClasses,
  engagementBreakdownCSS 
} from './styles';

export interface EngagementSegment {
  id: string;
  label: string;
  value: number;
  color: string;
  percentage: number;
}

export interface EngagementBreakdownProps extends BaseComponentProps {
  tenantTheme?: TenantTheme;
  title?: string;
  data: EngagementSegment[];
  size?: number;
  showLegend?: boolean;
  showPercentages?: boolean;
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
  onSegmentClick?: (segment: EngagementSegment) => void;
}

const EngagementBreakdownComponent: React.FC<EngagementBreakdownProps> = ({
  tenantTheme = defaultTheme,
  title = 'Engagement Breakdown',
  data,
  size = 200,
  showLegend = true,
  showPercentages = true,
  className = '',
  variant = 'default',
  onSegmentClick,
  ...props
}) => {
  const styles = getEngagementBreakdownStyles(tenantTheme, variant, size);

  // Calculate total value
  const total = data.reduce((sum, segment) => sum + segment.value, 0);

  // Generate SVG path for each segment
  const generateSegmentPath = (segment: EngagementSegment, startAngle: number, endAngle: number) => {
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = (size - 40) / 2;

    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;

    const x1 = centerX + radius * Math.cos(startAngleRad);
    const y1 = centerY + radius * Math.sin(startAngleRad);
    const x2 = centerX + radius * Math.cos(endAngleRad);
    const y2 = centerY + radius * Math.sin(endAngleRad);

    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  // Calculate angles for each segment
  let currentAngle = 0;
  const segments = data.map(segment => {
    const segmentAngle = (segment.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + segmentAngle;
    
    const result = {
      ...segment,
      startAngle,
      endAngle,
      path: generateSegmentPath(segment, startAngle, endAngle)
    };
    
    currentAngle += segmentAngle;
    return result;
  });

  if (data.length === 0) {
    return (
      <>
        <style>{engagementBreakdownCSS}</style>
        <div className={`${engagementBreakdownClasses.container} ${className}`} style={styles.container}>
          <h3 className={engagementBreakdownClasses.title} style={styles.title}>
            {title}
          </h3>
          <div className={engagementBreakdownClasses.emptyState} style={styles.emptyState}>
            <p>No data available</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{engagementBreakdownCSS}</style>
      <div className={`${engagementBreakdownClasses.container} ${className}`} style={styles.container} {...props}>
        <h3 className={engagementBreakdownClasses.title} style={styles.title}>
          {title}
        </h3>
        <div className={engagementBreakdownClasses.chart} style={{ ...styles.chart, height: size + 60 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            {/* Pie Chart */}
            <svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              style={{ flexShrink: 0 }}
            >
              {segments.map((segment, index) => (
                <path
                  key={segment.id}
                  d={segment.path}
                  fill={segment.color}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  style={{ cursor: 'pointer' }}
                  onClick={() => onSegmentClick?.(segment)}
                />
              ))}
            </svg>

            {/* Legend */}
            {showLegend && (
              <div style={{ flex: 1 }}>
                {segments.map((segment, index) => (
                  <div
                    key={segment.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '12px',
                      cursor: 'pointer'
                    }}
                    onClick={() => onSegmentClick?.(segment)}
                  >
                    <div
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '2px',
                        backgroundColor: segment.color,
                        flexShrink: 0
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: tenantTheme.colors.text,
                        marginBottom: '2px'
                      }}>
                        {segment.label}
                      </div>
                      {showPercentages && (
                        <div style={{
                          fontSize: '0.75rem',
                          color: tenantTheme.colors.textSecondary || '#64748B'
                        }}>
                          {segment.percentage}%
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export const EngagementBreakdown = withSSR(EngagementBreakdownComponent);
