import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CourseMenu } from './CourseMenu';

describe('CourseMenu', () => {
  const baseProps = {
    userRole: 'admin' as const,
    courseId: 'course-123',
    onNavigate: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it('renders the Course Menu heading', () => {
    render(<CourseMenu {...baseProps} />);
    expect(screen.getByText('Course Menu')).toBeInTheDocument();
  });

  it('displays the current user role', () => {
    render(<CourseMenu {...baseProps} />);
    expect(screen.getByText('admin')).toBeInTheDocument();
  });

  it('renders course catalog section for admin role', () => {
    render(<CourseMenu {...baseProps} />);
    expect(screen.getByText('Course Catalog')).toBeInTheDocument();
  });

  it('renders All Courses item for admin role', () => {
    render(<CourseMenu {...baseProps} />);
    expect(screen.getByText('All Courses')).toBeInTheDocument();
  });

  it('calls onNavigate when a nav item with href is clicked', () => {
    render(<CourseMenu {...baseProps} />);
    fireEvent.click(screen.getByText('All Courses'));
    expect(baseProps.onNavigate).toHaveBeenCalledWith('/courses');
  });

  it('renders menu for learner role', () => {
    render(<CourseMenu {...baseProps} userRole="learner" />);
    expect(screen.getByText('Course Menu')).toBeInTheDocument();
    expect(screen.getByText('All Courses')).toBeInTheDocument();
  });
});
