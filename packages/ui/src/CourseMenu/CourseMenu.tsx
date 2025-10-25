import React from 'react';
import { CourseMenuProps } from './types';
import { courseMenuSections, getMenuItemsForRole } from './config';
import { Chip } from '../Chip';

export const CourseMenu: React.FC<CourseMenuProps> = ({
  userRole,
  courseId,
  onNavigate,
  className = ''
}) => {
  const handleItemClick = (item: any) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.href && onNavigate) {
      onNavigate(item.href);
    }
  };

  const getFilteredSections = () => {
    return courseMenuSections.filter(section => 
      section.visibility.includes(userRole)
    );
  };

  const getFilteredItems = (items: any[]) => {
    return items.filter(item => item.visible.includes(userRole));
  };

  return (
    <div className={`course-menu ${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Menu</h2>
        <p className="text-gray-600">
          Navigate through course-related features based on your role: <strong>{userRole}</strong>
        </p>
      </div>

      <div className="space-y-8">
        {getFilteredSections().map((section) => (
          <div key={section.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{section.title}</h3>
              <p className="text-gray-600 text-sm">{section.description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getFilteredItems(section.items).map((item) => (
                <div
                  key={item.id}
                  className="group p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer"
                  onClick={() => handleItemClick(item)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <span className="text-2xl">{item.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                          {item.label}
                        </h4>
                        {item.badge && (
                          <Chip
                            label={item.badge.toString()}
                            variant="info"
                            size="small"
                            shape="pill"
                          />
                        )}
                      </div>
                      {item.description && (
                        <p className="mt-1 text-xs text-gray-500">{item.description}</p>
                      )}
                      {item.disabled && (
                        <Chip
                          label="Coming Soon"
                          variant="warning"
                          size="small"
                          shape="pill"
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Role-specific quick actions */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {userRole === 'admin' || userRole === 'instructor' ? (
            <>
              <button
                onClick={() => onNavigate?.('/courses/create')}
                className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <span className="text-xl">➕</span>
                <span className="text-sm font-medium text-blue-900">Create Course</span>
              </button>
              <button
                onClick={() => onNavigate?.('/courses/analytics')}
                className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <span className="text-xl">📊</span>
                <span className="text-sm font-medium text-blue-900">View Analytics</span>
              </button>
              <button
                onClick={() => onNavigate?.('/courses/enrollments')}
                className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <span className="text-xl">👥</span>
                <span className="text-sm font-medium text-blue-900">Manage Enrollments</span>
              </button>
              <button
                onClick={() => onNavigate?.('/courses/settings')}
                className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <span className="text-xl">⚙️</span>
                <span className="text-sm font-medium text-blue-900">Course Settings</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onNavigate?.('/courses/my-courses')}
                className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <span className="text-xl">🎓</span>
                <span className="text-sm font-medium text-blue-900">My Courses</span>
              </button>
              <button
                onClick={() => onNavigate?.('/courses/progress')}
                className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <span className="text-xl">📈</span>
                <span className="text-sm font-medium text-blue-900">My Progress</span>
              </button>
              <button
                onClick={() => onNavigate?.('/courses/certificates')}
                className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <span className="text-xl">🏆</span>
                <span className="text-sm font-medium text-blue-900">My Certificates</span>
              </button>
              <button
                onClick={() => onNavigate?.('/courses/browse')}
                className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <span className="text-xl">🔍</span>
                <span className="text-sm font-medium text-blue-900">Browse Courses</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
