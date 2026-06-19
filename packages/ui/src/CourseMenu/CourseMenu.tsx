import React from 'react';
import { CourseMenuProps } from './types';
import { courseMenuSections, getMenuItemsForRole } from './config';
import { Chip } from '../Chip';

export const CourseMenu: React.FC<CourseMenuProps> = ({ userRole, courseId, onNavigate, className = '' }) => {
  const handleItemClick = (item: any) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.href && onNavigate) {
      onNavigate(item.href);
    }
  };

  const getFilteredSections = () => {
    return courseMenuSections.filter((section) => section.visibility.includes(userRole));
  };

  const getFilteredItems = (items: any[]) => {
    return items.filter((item) => item.visible.includes(userRole));
  };

  return (
    <div className={`course-menu ${className}`}>
      <div className="mb-6">
        <h2 className="ios-large-title mb-1">Course Menu</h2>
        <p className="text-secondary text-sm">
          Navigate through course-related features based on your role: <strong>{userRole}</strong>
        </p>
      </div>

      <div className="space-y-6">
        {getFilteredSections().map((section) => (
          <div key={section.id} className="surface p-6">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-primary mb-1">{section.title}</h3>
              <p className="text-secondary text-sm">{section.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getFilteredItems(section.items).map((item) => (
                <div
                  key={item.id}
                  className="stat-card p-4"
                  onClick={() => handleItemClick(item)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <span className="text-2xl">{item.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-primary">{item.label}</h4>
                        {item.badge && <Chip label={item.badge.toString()} variant="info" size="small" shape="pill" />}
                      </div>
                      {item.description && <p className="mt-1 text-xs text-secondary">{item.description}</p>}
                      {item.disabled && <Chip label="Coming Soon" variant="warning" size="small" shape="pill" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Role-specific quick actions */}
      <div className="surface-elevated p-6 mt-6" style={{ borderLeft: '4px solid var(--color-blue)' }}>
        <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--color-blue)' }}>
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {userRole === 'admin' || userRole === 'instructor' ? (
            <>
              <button onClick={() => onNavigate?.('/courses/create')} className="ios-btn-secondary text-sm">
                <span className="mr-2">➕</span>
                Create Course
              </button>
              <button onClick={() => onNavigate?.('/courses/analytics')} className="ios-btn-secondary text-sm">
                <span className="mr-2">📊</span>
                View Analytics
              </button>
              <button onClick={() => onNavigate?.('/courses/enrollments')} className="ios-btn-secondary text-sm">
                <span className="mr-2">👥</span>
                Manage Enrollments
              </button>
              <button onClick={() => onNavigate?.('/courses/settings')} className="ios-btn-secondary text-sm">
                <span className="mr-2">⚙️</span>
                Course Settings
              </button>
            </>
          ) : (
            <>
              <button onClick={() => onNavigate?.('/courses/my-courses')} className="ios-btn-secondary text-sm">
                <span className="mr-2">🎓</span>
                My Courses
              </button>
              <button onClick={() => onNavigate?.('/courses/progress')} className="ios-btn-secondary text-sm">
                <span className="mr-2">📈</span>
                My Progress
              </button>
              <button onClick={() => onNavigate?.('/courses/certificates')} className="ios-btn-secondary text-sm">
                <span className="mr-2">🏆</span>
                My Certificates
              </button>
              <button onClick={() => onNavigate?.('/courses/browse')} className="ios-btn-secondary text-sm">
                <span className="mr-2">🔍</span>
                Browse Courses
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
