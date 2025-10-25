import React from 'react';
import { CourseOverviewProps } from './types';
import { Chip } from '../Chip';

export const CourseOverview: React.FC<CourseOverviewProps> = ({
  course,
  userRole,
  enrollmentStatus = 'not_enrolled'
}) => {
  const getEnrollmentButton = () => {
    switch (enrollmentStatus) {
      case 'enrolled':
        return (
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
            Continue Learning
          </button>
        );
      case 'completed':
        return (
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            View Certificate
          </button>
        );
      default:
        return (
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Enroll Now
          </button>
        );
    }
  };

  const getRoleActions = () => {
    if (userRole === 'admin' || userRole === 'instructor') {
      return (
        <div className="flex space-x-2">
          <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
            Edit Course
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            View Analytics
          </button>
        </div>
      );
    }
    return getEnrollmentButton();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Course Header */}
      <div className="relative">
        <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
            <p className="text-lg opacity-90">{course.description}</p>
          </div>
        </div>
        <div className="absolute top-4 right-4">
          <Chip
            label={course.level}
            variant="outline"
            size="small"
            shape="pill"
          />
        </div>
      </div>

      {/* Course Info */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{course.rating}</div>
            <div className="text-sm text-gray-600">Rating</div>
            <div className="flex justify-center mt-1">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={`text-sm ${
                    i < Math.floor(course.rating) ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{course.enrolledCount}</div>
            <div className="text-sm text-gray-600">Enrolled</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{course.duration}</div>
            <div className="text-sm text-gray-600">Duration</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{course.instructor}</div>
            <div className="text-sm text-gray-600">Instructor</div>
          </div>
        </div>

        {/* Course Thumbnail */}
        <div className="mb-6">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-48 object-cover rounded-lg"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex items-center space-x-4">
            <Chip
              label={enrollmentStatus === 'enrolled' ? 'Enrolled' : 
                     enrollmentStatus === 'completed' ? 'Completed' : 'Available'}
              variant={enrollmentStatus === 'enrolled' ? 'success' : 
                       enrollmentStatus === 'completed' ? 'info' : 'outline'}
              size="medium"
              shape="pill"
            />
            <span className="text-sm text-gray-600">
              {userRole === 'admin' || userRole === 'instructor' ? 'Management Access' : 'Learning Access'}
            </span>
          </div>
          
          <div className="flex space-x-2">
            {getRoleActions()}
          </div>
        </div>
      </div>
    </div>
  );
};
