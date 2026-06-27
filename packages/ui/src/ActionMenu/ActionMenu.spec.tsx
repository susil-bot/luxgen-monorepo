import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActionMenu } from './ActionMenu';
import type { ActionMenuItem } from './ActionMenu';

const items: ActionMenuItem[] = [
  { id: 'edit', label: 'Edit', onClick: jest.fn() },
  { id: 'duplicate', label: 'Duplicate', onClick: jest.fn() },
  { id: 'delete', label: 'Delete', onClick: jest.fn(), destructive: true },
  { id: 'archive', label: 'Archive', onClick: jest.fn(), disabled: true },
];

describe('ActionMenu', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the trigger button with default aria-label', () => {
    render(<ActionMenu items={items} />);
    expect(screen.getByRole('button', { name: 'More actions' })).toBeInTheDocument();
  });

  it('renders with a custom triggerLabel', () => {
    render(<ActionMenu items={items} triggerLabel="Open menu" />);
    expect(screen.getByRole('button', { name: 'Open menu' })).toBeInTheDocument();
  });

  it('menu items are hidden before the trigger is clicked', () => {
    render(<ActionMenu items={items} />);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('trigger has aria-expanded=false initially', () => {
    render(<ActionMenu items={items} />);
    expect(screen.getByRole('button', { name: 'More actions' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens the menu and shows items on trigger click', () => {
    render(<ActionMenu items={items} />);
    fireEvent.click(screen.getByRole('button', { name: 'More actions' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Duplicate' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toBeInTheDocument();
  });

  it('trigger has aria-expanded=true when menu is open', () => {
    render(<ActionMenu items={items} />);
    fireEvent.click(screen.getByRole('button', { name: 'More actions' }));
    expect(screen.getByRole('button', { name: 'More actions' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('calls onClick and closes menu when a menu item is clicked', () => {
    render(<ActionMenu items={items} />);
    fireEvent.click(screen.getByRole('button', { name: 'More actions' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Edit' }));
    expect(items[0].onClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('does not call onClick for disabled items', () => {
    render(<ActionMenu items={items} />);
    fireEvent.click(screen.getByRole('button', { name: 'More actions' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Archive' }));
    expect(items[3].onClick).not.toHaveBeenCalled();
  });

  it('disabled menu items have the disabled attribute', () => {
    render(<ActionMenu items={items} />);
    fireEvent.click(screen.getByRole('button', { name: 'More actions' }));
    expect(screen.getByRole('menuitem', { name: 'Archive' })).toBeDisabled();
  });

  it('closes menu when Escape key is pressed', () => {
    render(<ActionMenu items={items} />);
    fireEvent.click(screen.getByRole('button', { name: 'More actions' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('second click on trigger closes the menu', () => {
    render(<ActionMenu items={items} />);
    const trigger = screen.getByRole('button', { name: 'More actions' });
    fireEvent.click(trigger);
    expect(screen.getByRole('menu')).toBeInTheDocument();
    fireEvent.click(trigger);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('renders a custom trigger node', () => {
    render(<ActionMenu items={items} triggerLabel="Options" trigger={<span>⚙</span>} />);
    expect(screen.getByText('⚙')).toBeInTheDocument();
  });
});
