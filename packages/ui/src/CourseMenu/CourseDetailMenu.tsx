import React from 'react';
import { UserRole } from './types';
import { getCourseDetailMenu, getCourseManagementMenu } from './config';
import { Chip } from '../Chip';

interface CourseDetailMenuProps {
  courseId: string;
  userRole: UserRole;
  currentPath?: string;
  onNavigate?: (path: string) => void;
  className?: string;
}

export const CourseDetailMenu: React.FC<CourseDetailMenuProps> = ({
  courseId,
  userRole,
  currentPath,
  onNavigate,
  className = ''
}) => {
  const learnerMenuItems = getCourseDetailMenu(courseId, userRole);
  const adminMenuItems = getCourseManagementMenu(courseId, userRole);

  const handleItemClick = (href: string) => {
    if (onNavigate) {
      onNavigate(href);
    }
  };

  const isActive = (href: string) => {
    return currentPath === href;
  };

  return (
    <div className={`course-detail-menu ${className}`}>
      {/* Learner/User Menu */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Navigation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {learnerMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.href || '')}
              className={`p-3 rounded-lg border text-left transition-all duration-200 ${
                isActive(item.href || '')
                  ? 'border-blue-500 bg-blue-50 text-blue-900'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                </div>
                {item.badge && (
                  <Chip
                    label={item.badge.toString()}
                    variant="info"
                    size="small"
                    shape="pill"
                  />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Admin/Instructor Management Menu */}
      {(userRole === 'admin' || userRole === 'instructor') && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Management</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {adminMenuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.href || '')}
                className={`p-3 rounded-lg border text-left transition-all duration-200 ${
                  isActive(item.href || '')
                    ? 'border-green-500 bg-green-50 text-green-900'
                    : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{item.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                  </div>
                  {item.badge && (
                    <Chip
                      label={item.badge.toString()}
                      variant="success"
                      size="small"
                      shape="pill"
                    />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Role Information */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <span className="text-2xl">
              {userRole === 'admin' ? '👑' : userRole === 'instructor' ? '👨‍🏫' : '👨‍🎓'}
            </span>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900">
              {userRole === 'admin' ? 'Administrator' : 
               userRole === 'instructor' ? 'Instructor' : 'Learner'}
            </h4>
            <p className="text-xs text-gray-600 mt-1">
              {userRole === 'admin' || userRole === 'instructor' 
                ? 'Full course management and analytics access'
                : 'Course enrollment and learning access'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
