import React from 'react';
import { CourseAnalyticsProps } from './types';
import { Chip } from '../Chip';

export const CourseAnalytics: React.FC<CourseAnalyticsProps> = ({
  courseId,
  userRole,
  metrics
}) => {
  const getEngagementColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getCompletionColor = (rate: number) => {
    if (rate >= 80) return 'success';
    if (rate >= 60) return 'warning';
    return 'error';
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'success';
    if (rating >= 3) return 'warning';
    return 'error';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Course Analytics</h3>
        <p className="text-gray-600 text-sm">
          Performance metrics and engagement data for course: <strong>{courseId}</strong>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Enrollments */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900">Total Enrollments</p>
              <p className="text-2xl font-bold text-blue-900">{metrics.totalEnrollments}</p>
            </div>
            <div className="text-2xl">👥</div>
          </div>
          <div className="mt-2">
            <Chip
              label="Active"
              variant="info"
              size="small"
              shape="pill"
            />
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-900">Completion Rate</p>
              <p className="text-2xl font-bold text-green-900">{metrics.completionRate}%</p>
            </div>
            <div className="text-2xl">📊</div>
          </div>
          <div className="mt-2">
            <Chip
              label={metrics.completionRate >= 80 ? 'Excellent' : 
                     metrics.completionRate >= 60 ? 'Good' : 'Needs Improvement'}
              variant={getCompletionColor(metrics.completionRate)}
              size="small"
              shape="pill"
            />
          </div>
        </div>

        {/* Average Rating */}
        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-900">Average Rating</p>
              <p className="text-2xl font-bold text-yellow-900">{metrics.averageRating.toFixed(1)}</p>
            </div>
            <div className="text-2xl">⭐</div>
          </div>
          <div className="mt-2">
            <Chip
              label={metrics.averageRating >= 4 ? 'Excellent' : 
                     metrics.averageRating >= 3 ? 'Good' : 'Needs Improvement'}
              variant={getRatingColor(metrics.averageRating)}
              size="small"
              shape="pill"
            />
          </div>
        </div>

        {/* Engagement Score */}
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-900">Engagement Score</p>
              <p className="text-2xl font-bold text-purple-900">{metrics.engagementScore}%</p>
            </div>
            <div className="text-2xl">📈</div>
          </div>
          <div className="mt-2">
            <Chip
              label={metrics.engagementScore >= 80 ? 'High' : 
                     metrics.engagementScore >= 60 ? 'Medium' : 'Low'}
              variant={getEngagementColor(metrics.engagementScore)}
              size="small"
              shape="pill"
            />
          </div>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="mt-8">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Detailed Metrics</h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-3">Enrollment Trends</h5>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">This Month</span>
                <span className="text-sm font-medium">+12%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Last Month</span>
                <span className="text-sm font-medium">+8%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Growth Rate</span>
                <span className="text-sm font-medium text-green-600">+4%</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-3">Completion Breakdown</h5>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Completed</span>
                <span className="text-sm font-medium">{Math.round(metrics.totalEnrollments * metrics.completionRate / 100)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">In Progress</span>
                <span className="text-sm font-medium">{Math.round(metrics.totalEnrollments * (100 - metrics.completionRate) / 100)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Not Started</span>
                <span className="text-sm font-medium">0</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Role-specific Actions */}
      {(userRole === 'admin' || userRole === 'instructor') && (
        <div className="mt-8 bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-3">Management Actions</h4>
          <div className="flex flex-wrap gap-2">
            <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors">
              Export Data
            </button>
            <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors">
              Generate Report
            </button>
            <button className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 transition-colors">
              View Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
