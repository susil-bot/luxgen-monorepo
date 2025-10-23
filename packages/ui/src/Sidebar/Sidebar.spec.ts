import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from './Sidebar';
import { sidebarFixtures } from './fixture';

describe('Sidebar', () => {
  it('renders with default props', () => {
    render(<Sidebar {...sidebarFixtures.default} />);
    
    expect(screen.getByRole('complementary')).toBeInTheDocument();
    expect(screen.getByText('Navigation')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Courses')).toBeInTheDocument();
    expect(screen.getByText('Students')).toBeInTheDocument();
  });

  it('renders in collapsed state', () => {
    render(<Sidebar {...sidebarFixtures.collapsed} />);
    
    const sidebar = screen.getByRole('complementary');
    expect(sidebar).toHaveClass('collapsed');
    expect(sidebar).toHaveStyle('width: 4rem');
  });

  it('renders with custom theme', () => {
    render(<Sidebar {...sidebarFixtures.withCustomTheme} />);
    
    const sidebar = screen.getByRole('complementary');
    expect(sidebar).toHaveStyle('background-color: #F3F4F6');
  });

  it('renders with many menu items', () => {
    render(<Sidebar {...sidebarFixtures.withManyItems} />);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Courses')).toBeInTheDocument();
    expect(screen.getByText('Students')).toBeInTheDocument();
    expect(screen.getByText('Instructors')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
    expect(screen.getByText('Help')).toBeInTheDocument();
  });

  it('calls onToggle when toggle button is clicked', () => {
    const mockOnToggle = jest.fn();
    const fixture = {
      ...sidebarFixtures.withToggle,
      onToggle: mockOnToggle,
    };
    
    render(<Sidebar {...fixture} />);
    
    const toggleButton = screen.getByLabelText('Collapse sidebar');
    fireEvent.click(toggleButton);
    
    expect(mockOnToggle).toHaveBeenCalledWith(true);
  });

  it('toggles collapsed state when toggle button is clicked', () => {
    render(<Sidebar {...sidebarFixtures.default} />);
    
    const sidebar = screen.getByRole('complementary');
    const toggleButton = screen.getByLabelText('Collapse sidebar');
    
    expect(sidebar).not.toHaveClass('collapsed');
    expect(sidebar).toHaveStyle('width: 16rem');
    
    fireEvent.click(toggleButton);
    
    expect(sidebar).toHaveClass('collapsed');
    expect(sidebar).toHaveStyle('width: 4rem');
  });

  it('shows tooltips when collapsed', () => {
    render(<Sidebar {...sidebarFixtures.collapsed} />);
    
    const dashboardLink = screen.getByTitle('Dashboard');
    expect(dashboardLink).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Sidebar {...sidebarFixtures.default} className="custom-sidebar" />);
    
    const sidebar = screen.getByRole('complementary');
    expect(sidebar).toHaveClass('custom-sidebar');
  });
});
