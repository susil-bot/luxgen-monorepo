import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Toolkit } from './Toolkit';
import { toolkitFixtures } from './fixture';
import { toolkitClasses, toolkitStyles } from './styles';

describe('Toolkit', () => {
  it('renders all item labels', () => {
    render(<Toolkit {...toolkitFixtures.default} />);
    expect(screen.getByText('Add')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('has role="toolbar" and correct aria-label', () => {
    render(<Toolkit {...toolkitFixtures.default} />);
    expect(screen.getByRole('toolbar', { name: 'Page actions' })).toBeInTheDocument();
  });

  it('renders buttons with aria-label and title', () => {
    render(<Toolkit {...toolkitFixtures.default} />);
    const addBtn = screen.getByRole('button', { name: 'Add' });
    expect(addBtn).toHaveAttribute('title', 'Add');
  });

  it('calls onClick when a button is clicked', () => {
    const handleClick = jest.fn();
    render(<Toolkit items={[{ id: 'run', label: 'Run', onClick: handleClick }]} ariaLabel="Test toolbar" />);
    fireEvent.click(screen.getByRole('button', { name: 'Run' }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when item is disabled', () => {
    const handleClick = jest.fn();
    render(
      <Toolkit
        items={[{ id: 'del', label: 'Delete', onClick: handleClick, disabled: true }]}
        ariaLabel="Test toolbar"
      />,
    );
    const btn = screen.getByRole('button', { name: 'Delete' });
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('sets aria-pressed on active items', () => {
    render(<Toolkit {...toolkitFixtures.withActive} />);
    const editBtn = screen.getByRole('button', { name: 'Edit' });
    expect(editBtn).toHaveAttribute('aria-pressed', 'true');
    const addBtn = screen.getByRole('button', { name: 'Add' });
    expect(addBtn).toHaveAttribute('aria-pressed', 'false');
  });

  it('applies semantic modifier classes on active and destructive items', () => {
    const { rerender } = render(<Toolkit {...toolkitFixtures.withActive} />);
    expect(screen.getByRole('button', { name: 'Edit' }).className).toContain(toolkitClasses.itemActive);

    rerender(<Toolkit items={[{ id: 'del', label: 'Delete', destructive: true }]} ariaLabel="Destructive toolbar" />);
    expect(screen.getByRole('button', { name: 'Delete' }).className).toContain(toolkitClasses.itemDestructive);
  });

  it('applies emotion root styles directly on the toolbar element', () => {
    render(<Toolkit {...toolkitFixtures.default} />);
    const toolbar = screen.getByRole('toolbar');
    expect(toolbar.className).toContain(toolkitStyles.root);
  });

  it('renders compact size with small item style class', () => {
    render(<Toolkit {...toolkitFixtures.compact} />);
    const btn = screen.getByRole('button', { name: 'Add' });
    expect(btn.className).toContain(toolkitStyles.itemSmall);
  });

  it('renders medium size without small item style class', () => {
    render(<Toolkit {...toolkitFixtures.default} />);
    const btn = screen.getByRole('button', { name: 'Add' });
    expect(btn.className).toContain(toolkitStyles.item);
    expect(btn.className).not.toContain(toolkitStyles.itemSmall);
  });

  it('renders icon wrapper when icon is provided', () => {
    render(<Toolkit {...toolkitFixtures.withIcons} />);
    const iconSpans = document.querySelectorAll('[aria-hidden="true"]');
    expect(iconSpans.length).toBeGreaterThan(0);
  });

  it('forwards id and data-testid to the toolbar root', () => {
    render(
      <Toolkit items={toolkitFixtures.default.items} ariaLabel="Test" id="my-toolbar" dataTestId="toolbar-test" />,
    );
    const toolbar = screen.getByRole('toolbar');
    expect(toolbar).toHaveAttribute('id', 'my-toolbar');
    expect(toolbar).toHaveAttribute('data-testid', 'toolbar-test');
  });

  it('merges custom className onto root element', () => {
    render(<Toolkit {...toolkitFixtures.default} className="my-custom-class" />);
    expect(screen.getByRole('toolbar').className).toContain('my-custom-class');
  });

  it('merges custom style onto root element', () => {
    render(<Toolkit {...toolkitFixtures.default} style={{ marginTop: 16 }} />);
    expect(screen.getByRole('toolbar').style.marginTop).toBe('16px');
  });

  it('renders nothing inside toolbar when items list is empty', () => {
    render(<Toolkit {...toolkitFixtures.empty} />);
    const toolbar = screen.getByRole('toolbar');
    expect(toolbar.querySelectorAll('button')).toHaveLength(0);
  });
});
