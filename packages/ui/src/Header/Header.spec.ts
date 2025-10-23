import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from './Header';
import { headerFixtures } from './fixture';

describe('Header', () => {
  it('renders with default props', () => {
    render(<Header {...headerFixtures.default} />);
    
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByAltText('Logo')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Courses')).toBeInTheDocument();
  });

  it('renders without logo', () => {
    render(<Header {...headerFixtures.withoutLogo} />);
    
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.queryByAltText('Logo')).not.toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders with custom theme', () => {
    render(<Header {...headerFixtures.withCustomTheme} />);
    
    const header = screen.getByRole('banner');
    expect(header).toHaveStyle('background-color: #F3F4F6');
  });

  it('renders with many menu items', () => {
    render(<Header {...headerFixtures.withManyMenuItems} />);
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Courses')).toBeInTheDocument();
    expect(screen.getByText('Students')).toBeInTheDocument();
    expect(screen.getByText('Instructors')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('calls onMenuClick when menu item is clicked', () => {
    const mockOnMenuClick = jest.fn();
    const fixture = {
      ...headerFixtures.withMenuClick,
      onMenuClick: mockOnMenuClick,
    };
    
    render(<Header {...fixture} />);
    
    const homeLink = screen.getByText('Home');
    fireEvent.click(homeLink);
    
    expect(mockOnMenuClick).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'home',
        label: 'Home',
        href: '/',
      })
    );
  });

  it('applies custom className', () => {
    render(<Header {...headerFixtures.default} className="custom-header" />);
    
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('custom-header');
  });

  it('applies custom style', () => {
    const customStyle = { border: '2px solid red' };
    render(<Header {...headerFixtures.default} style={customStyle} />);
    
    const header = screen.getByRole('banner');
    expect(header).toHaveStyle('border: 2px solid red');
  });
});
