import React from 'react';
import { BaseComponentProps, TenantTheme } from '../types';
import { withSSR } from '../ssr';
import { defaultTheme } from '../theme';
import { 
  getUserRetentionStyles, 
  userRetentionClasses,
  userRetentionCSS 
} from './styles';

export interface RetentionDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface UserRetentionProps extends BaseComponentProps {
  tenantTheme?: TenantTheme;
  title?: string;
  data: RetentionDataPoint[];
  height?: number;
  color?: string;
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
  onDataPointClick?: (point: RetentionDataPoint) => void;
}

const UserRetentionComponent: React.FC<UserRetentionProps> = ({
  tenantTheme = defaultTheme,
  title = 'User Retention Trends',
  data,
  height = 300,
  color,
  showGrid = true,
  showTooltip = true,
  showLegend = true,
  className = '',
  variant = 'default',
  onDataPointClick,
  ...props
}) => {
  const styles = getUserRetentionStyles(tenantTheme, variant, color);

  // Calculate chart dimensions and scaling
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const valueRange = maxValue - minValue;
  const padding = 40;
  const chartWidth = 500;
  const chartHeight = height - padding * 2;

  // Generate SVG path for the line
  const generatePath = () => {
    if (data.length < 2) return '';
    
    const points = data.map((point, index) => {
      const x = (index / (data.length - 1)) * (chartWidth - padding * 2) + padding;
      const y = chartHeight - ((point.value - minValue) / valueRange) * (chartHeight - padding * 2) + padding;
      return `${x},${y}`;
    });
    
    return `M ${points.join(' L ')}`;
  };

  // Generate area path for gradient fill
  const generateAreaPath = () => {
    if (data.length < 2) return '';
    
    const linePath = generatePath();
    const firstPoint = data[0];
    const lastPoint = data[data.length - 1];
    const firstX = padding;
    const lastX = chartWidth - padding;
    const firstY = chartHeight - ((firstPoint.value - minValue) / valueRange) * (chartHeight - padding * 2) + padding;
    const lastY = chartHeight - ((lastPoint.value - minValue) / valueRange) * (chartHeight - padding * 2) + padding;
    
    return `${linePath} L ${lastX},${chartHeight} L ${firstX},${chartHeight} Z`;
  };

  if (data.length === 0) {
    return (
      <>
        <style>{userRetentionCSS}</style>
        <div className={`${userRetentionClasses.container} ${className}`} style={styles.container}>
          <h3 className={userRetentionClasses.title} style={styles.title}>
            {title}
          </h3>
          <div className={userRetentionClasses.emptyState} style={styles.emptyState}>
            <p>No data available</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{userRetentionCSS}</style>
      <div className={`${userRetentionClasses.container} ${className}`} style={styles.container} {...props}>
        <h3 className={userRetentionClasses.title} style={styles.title}>
          {title}
        </h3>
        <div className={userRetentionClasses.chart} style={{ ...styles.chart, height }}>
          <svg
            width="100%"
            height={height}
            viewBox={`0 0 ${chartWidth} ${height}`}
            style={{ overflow: 'visible' }}
          >
            {/* Grid lines */}
            {showGrid && (
              <g>
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                  const y = padding + (chartHeight - padding * 2) * ratio;
                  const value = minValue + valueRange * (1 - ratio);
                  return (
                    <g key={index}>
                      <line
                        x1={padding}
                        y1={y}
                        x2={chartWidth - padding}
                        y2={y}
                        stroke={tenantTheme.colors.border || '#E2E8F0'}
                        strokeWidth="1"
                        strokeDasharray="2,2"
                      />
                      <text
                        x={padding - 10}
                        y={y + 4}
                        fontSize="12"
                        fill={tenantTheme.colors.textSecondary || '#64748B'}
                        textAnchor="end"
                      >
                        {Math.round(value)}
                      </text>
                    </g>
                  );
                })}
              </g>
            )}

            {/* Gradient definition */}
            <defs>
              <linearGradient id="retentionGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={styles.lineColor} stopOpacity="0.3" />
                <stop offset="100%" stopColor={styles.lineColor} stopOpacity="0.05" />
              </linearGradient>
            </defs>

            {/* Area fill */}
            <path
              d={generateAreaPath()}
              fill="url(#retentionGradient)"
            />

            {/* Line */}
            <path
              d={generatePath()}
              fill="none"
              stroke={styles.lineColor}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points */}
            {data.map((point, index) => {
              const x = (index / (data.length - 1)) * (chartWidth - padding * 2) + padding;
              const y = chartHeight - ((point.value - minValue) / valueRange) * (chartHeight - padding * 2) + padding;
              
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="4"
                  fill={styles.lineColor}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  style={{ cursor: 'pointer' }}
                  onClick={() => onDataPointClick?.(point)}
                />
              );
            })}

            {/* X-axis labels */}
            {data.map((point, index) => {
              const x = (index / (data.length - 1)) * (chartWidth - padding * 2) + padding;
              return (
                <text
                  key={index}
                  x={x}
                  y={chartHeight - padding + 20}
                  fontSize="12"
                  fill={tenantTheme.colors.textSecondary || '#64748B'}
                  textAnchor="middle"
                >
                  {point.date}
                </text>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        {showLegend && (
          <div className={userRetentionClasses.legend} style={styles.legend}>
            <div className={userRetentionClasses.legendItem} style={styles.legendItem}>
              <div 
                className={userRetentionClasses.legendColor} 
                style={{ ...styles.legendColor, backgroundColor: styles.lineColor }}
              />
              <span className={userRetentionClasses.legendText} style={styles.legendText}>
                User Retention
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export const UserRetention = withSSR(UserRetentionComponent);
