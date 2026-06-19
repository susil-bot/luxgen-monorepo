import React from 'react';
import { CourseOverviewProps } from './types';

export const CourseOverview: React.FC<CourseOverviewProps> = ({
  course,
  userRole,
  enrollmentStatus = 'not_enrolled',
}) => {
  const renderActionButton = () => {
    switch (enrollmentStatus) {
      case 'enrolled':
        return <button className="ios-btn-primary">Continue Learning</button>;
      case 'completed':
        return <button className="ios-btn-primary">View Certificate</button>;
      default:
        return <button className="ios-btn-primary">Enroll Now</button>;
    }
  };

  const renderManagementActions = () => {
    if (userRole === 'admin' || userRole === 'instructor') {
      return (
        <div className="flex gap-3 mt-3">
          <button className="ios-btn-secondary text-sm">Edit Course</button>
          <button className="ios-btn-secondary text-sm">View Analytics</button>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="surface overflow-hidden">
      {/* Course Header */}
      <div
        className="p-6"
        style={{
          background: 'linear-gradient(135deg, var(--color-blue) 0%, var(--color-purple) 100%)',
        }}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-white/20 text-white text-xs">{course.level}</span>
              <span className="badge badge-white/20 text-white text-xs">{course.duration}</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{course.title}</h2>
            <p className="text-white/80 text-sm">{course.description}</p>
          </div>
        </div>
      </div>

      {/* Course Stats */}
      <div className="px-6 py-4 grid grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-xl font-bold text-primary">{course.rating}</div>
          <div className="text-xs text-secondary mt-0.5">Rating</div>
          <div className="flex justify-center mt-1 gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <span
                key={i}
                className="text-xs"
                style={{
                  color: i < Math.floor(course.rating) ? 'var(--color-orange)' : 'var(--color-fill-quaternary)',
                }}
              >
                ★
              </span>
            ))}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-primary">{course.enrolledCount.toLocaleString()}</div>
          <div className="text-xs text-secondary mt-0.5">Enrolled</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-primary">{course.duration}</div>
          <div className="text-xs text-secondary mt-0.5">Duration</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-primary">{course.instructor}</div>
          <div className="text-xs text-secondary mt-0.5">Instructor</div>
        </div>
      </div>

      {/* Course Actions */}
      <div
        className="px-6 py-4 flex items-center justify-between"
        style={{ borderTop: '1px solid var(--color-separator)' }}
      >
        <div className="flex items-center gap-3">
          {renderActionButton()}
          {renderManagementActions()}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-secondary">
            {userRole === 'admin' || userRole === 'instructor' ? 'Management Access' : 'Learning Access'}
          </span>
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-green)' }} />
        </div>
      </div>
    </div>
  );
};
