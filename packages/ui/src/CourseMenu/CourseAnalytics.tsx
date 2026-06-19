import React from 'react';
import { CourseAnalyticsProps } from './types';

export const CourseAnalytics: React.FC<CourseAnalyticsProps> = ({ courseId, userRole, metrics }) => {
  return (
    <div className="surface p-6">
      <div className="mb-6">
        <h3 className="ios-card-row text-base font-semibold mb-1">Course Analytics</h3>
        <p className="text-secondary text-sm">
          Performance metrics and engagement data for course: <strong>{courseId}</strong>
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="ios-metric-tile p-4">
          <div className="text-xs text-secondary mb-1">Total Enrollments</div>
          <div className="text-2xl font-bold text-primary">{metrics.totalEnrollments.toLocaleString()}</div>
          <div className="text-xs text-green-500 mt-1">↑ +12% this month</div>
        </div>
        <div className="ios-metric-tile p-4">
          <div className="text-xs text-secondary mb-1">Completion Rate</div>
          <div className="text-2xl font-bold text-primary">{metrics.completionRate}%</div>
          <div className="text-xs text-green-500 mt-1">↑ +5% vs last month</div>
        </div>
        <div className="ios-metric-tile p-4">
          <div className="text-xs text-secondary mb-1">Average Rating</div>
          <div className="text-2xl font-bold text-primary">{metrics.averageRating}</div>
          <div className="text-xs text-secondary mt-1">★★★★☆ (4.8 avg)</div>
        </div>
        <div className="ios-metric-tile p-4">
          <div className="text-xs text-secondary mb-1">Engagement Score</div>
          <div className="text-2xl font-bold text-primary">{metrics.engagementScore}</div>
          <div className="text-xs text-green-500 mt-1">↑ +8% this week</div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div>
        <h4 className="text-sm font-semibold text-primary mb-4">Detailed Metrics</h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-[var(--color-fill-quaternary)] rounded-xl p-4">
            <h5 className="text-sm font-medium text-primary mb-3">Enrollment Trends</h5>
            <div className="space-y-3">
              <div className="ios-card-row">
                <span className="text-sm text-secondary">This Month</span>
                <span className="text-sm font-medium text-primary">+12%</span>
              </div>
              <div className="ios-card-row">
                <span className="text-sm text-secondary">Last Month</span>
                <span className="text-sm font-medium text-primary">+8%</span>
              </div>
              <div className="ios-card-row">
                <span className="text-sm text-secondary">Growth Rate</span>
                <span className="text-sm font-medium text-green-500">+4%</span>
              </div>
            </div>
          </div>

          <div className="bg-[var(--color-fill-quaternary)] rounded-xl p-4">
            <h5 className="text-sm font-medium text-primary mb-3">Completion Breakdown</h5>
            <div className="space-y-3">
              <div className="ios-card-row">
                <span className="text-sm text-secondary">Completed</span>
                <span className="text-sm font-medium text-primary">
                  {Math.round((metrics.totalEnrollments * metrics.completionRate) / 100)}
                </span>
              </div>
              <div className="ios-card-row">
                <span className="text-sm text-secondary">In Progress</span>
                <span className="text-sm font-medium text-primary">
                  {Math.round((metrics.totalEnrollments * (100 - metrics.completionRate)) / 100)}
                </span>
              </div>
              <div className="ios-card-row">
                <span className="text-sm text-secondary">Not Started</span>
                <span className="text-sm font-medium text-primary">0</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Management Actions */}
      {(userRole === 'admin' || userRole === 'instructor') && (
        <div className="ios-card mt-6 p-4" style={{ borderLeft: '4px solid var(--color-blue)' }}>
          <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--color-blue)' }}>
            Management Actions
          </h4>
          <div className="flex flex-wrap gap-2">
            <button className="ios-btn-secondary text-xs">Export Data</button>
            <button className="ios-btn-secondary text-xs">Generate Report</button>
            <button className="ios-btn-secondary text-xs">Share Analytics</button>
          </div>
        </div>
      )}
    </div>
  );
};
