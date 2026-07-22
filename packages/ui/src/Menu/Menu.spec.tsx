import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Menu } from './Menu';
import type { MenuItem } from './Menu';

const items: MenuItem[] = [
  { id: 'home', label: 'Home', onClick: jest.fn() },
  { id: 'courses', label: 'Courses', badge: 5, onClick: jest.fn() },
  { id: 'settings', label: 'Settings', onClick: jest.fn() },
  { id: 'disabled', label: 'Disabled Item', onClick: jest.fn(), disabled: true },
];

describe('Menu', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders all menu item labels', () => {
    render(<Menu items={items} />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Courses')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders a badge when item has a badge value', () => {
    render(<Menu items={items} showBadges />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('calls onItemClick when a menu item is clicked', () => {
    const onItemClick = jest.fn();
    render(<Menu items={items} onItemClick={onItemClick} />);
    fireEvent.click(screen.getByText('Home'));
    expect(onItemClick).toHaveBeenCalledWith(expect.objectContaining({ id: 'home' }));
  });

  it('calls item.onClick when a menu item is clicked', () => {
    render(<Menu items={items} />);
    fireEvent.click(screen.getByText('Home'));
    expect(items[0].onClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick for a disabled item', () => {
    render(<Menu items={items} />);
    fireEvent.click(screen.getByText('Disabled Item'));
    expect(items[3].onClick).not.toHaveBeenCalled();
  });

  it('calls onActiveChange when a menu item is clicked', () => {
    const onActiveChange = jest.fn();
    render(<Menu items={items} onActiveChange={onActiveChange} />);
    fireEvent.click(screen.getByText('Settings'));
    expect(onActiveChange).toHaveBeenCalledWith('settings');
  });

  it('renders an empty list with no items', () => {
    const { container } = render(<Menu items={[]} />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
