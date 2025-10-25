import React from 'react';
import { BaseComponentProps, TenantTheme } from '../types';
import { withSSR } from '../ssr';
import { defaultTheme } from '../theme';
import { 
  getEngagementTrendsStyles, 
  engagementTrendsClasses,
  engagementTrendsCSS 
} from './styles';

export interface EngagementDataPoint {
  label: string;
  interactions: number;
  completions: number;
}

export interface EngagementTrendsProps extends BaseComponentProps {
  tenantTheme?: TenantTheme;
  title?: string;
  data: EngagementDataPoint[];
  height?: number;
  showLegend?: boolean;
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
  onDataPointClick?: (point: EngagementDataPoint) => void;
}

const EngagementTrendsComponent: React.FC<EngagementTrendsProps> = ({
  tenantTheme = defaultTheme,
  title = 'Engagement Trends',
  data,
  height = 300,
  showLegend = true,
  className = '',
  variant = 'default',
  onDataPointClick,
  ...props
}) => {
  const styles = getEngagementTrendsStyles(tenantTheme, variant);

  // Calculate chart dimensions
  const maxValue = Math.max(
    ...data.flatMap(d => [d.interactions, d.completions])
  );
  const padding = 40;
  const chartWidth = 500;
  const chartHeight = height - padding * 2;
  const barWidth = (chartWidth - padding * 2) / (data.length * 3); // 3 units per data point (2 bars + 1 gap)

  // Generate bars for each data point
  const generateBars = () => {
    return data.map((point, index) => {
      const x = padding + index * (chartWidth - padding * 2) / data.length;
      const interactionsHeight = (point.interactions / maxValue) * (chartHeight);
      const completionsHeight = (point.completions / maxValue) * (chartHeight);
      
      const interactionsY = chartHeight - interactionsHeight + padding;
      const completionsY = chartHeight - completionsHeight + padding;

      return (
        <g key={index}>
          {/* Interactions bar */}
          <rect
            x={x + barWidth * 0.1}
            y={interactionsY}
            width={barWidth * 0.8}
            height={interactionsHeight}
            fill={styles.interactionsColor}
            rx="2"
            style={{ cursor: 'pointer' }}
            onClick={() => onDataPointClick?.(point)}
          />
          
          {/* Completions bar */}
          <rect
            x={x + barWidth * 1.1}
            y={completionsY}
            width={barWidth * 0.8}
            height={completionsHeight}
            fill={styles.completionsColor}
            rx="2"
            style={{ cursor: 'pointer' }}
            onClick={() => onDataPointClick?.(point)}
          />
        </g>
      );
    });
  };

  if (data.length === 0) {
    return (
      <>
        <style>{engagementTrendsCSS}</style>
        <div className={`${engagementTrendsClasses.container} ${className}`} style={styles.container}>
          <h3 className={engagementTrendsClasses.title} style={styles.title}>
            {title}
          </h3>
          <div className={engagementTrendsClasses.emptyState} style={styles.emptyState}>
            <p>No data available</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{engagementTrendsCSS}</style>
      <div className={`${engagementTrendsClasses.container} ${className}`} style={styles.container} {...props}>
        <h3 className={engagementTrendsClasses.title} style={styles.title}>
          {title}
        </h3>
        <div className={engagementTrendsClasses.chart} style={{ ...styles.chart, height }}>
          <svg
            width="100%"
            height={height}
            viewBox={`0 0 ${chartWidth} ${height}`}
            style={{ overflow: 'visible' }}
          >
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
              const y = padding + (chartHeight - padding * 2) * ratio;
              const value = Math.round(maxValue * (1 - ratio));
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
                    {value}
                  </text>
                </g>
              );
            })}

            {/* Bars */}
            {generateBars()}

            {/* X-axis labels */}
            {data.map((point, index) => {
              const x = padding + index * (chartWidth - padding * 2) / data.length + (chartWidth - padding * 2) / (data.length * 2);
              return (
                <text
                  key={index}
                  x={x}
                  y={chartHeight - padding + 20}
                  fontSize="12"
                  fill={tenantTheme.colors.textSecondary || '#64748B'}
                  textAnchor="middle"
                >
                  {point.label}
                </text>
              );
            })}
          </svg>

          {/* Legend */}
          {showLegend && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '24px',
              marginTop: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: styles.interactionsColor,
                  borderRadius: '2px'
                }} />
                <span style={{
                  fontSize: '0.875rem',
                  color: tenantTheme.colors.textSecondary || '#64748B'
                }}>
                  Interactions
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: styles.completionsColor,
                  borderRadius: '2px'
                }} />
                <span style={{
                  fontSize: '0.875rem',
                  color: tenantTheme.colors.textSecondary || '#64748B'
                }}>
                  Completions
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export const EngagementTrends = withSSR(EngagementTrendsComponent);
