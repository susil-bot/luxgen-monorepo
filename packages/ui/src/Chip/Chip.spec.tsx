import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Chip } from './Chip';

describe('Chip', () => {
  it('renders the chip label', () => {
    render(<Chip label="Design" />);
    expect(screen.getByText('Design')).toBeInTheDocument();
  });

  it('renders with a custom variant', () => {
    const { container } = render(<Chip label="Success" variant="success" />);
    expect(container.firstChild).toHaveClass('badge-green');
  });

  it('calls onClick when chip is clicked', () => {
    const onClick = jest.fn();
    render(<Chip label="Clickable" onClick={onClick} />);
    fireEvent.click(screen.getByText('Clickable'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    const onClick = jest.fn();
    render(<Chip label="Disabled" onClick={onClick} disabled />);
    fireEvent.click(screen.getByText('Disabled'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders a close button when closable=true', () => {
    render(<Chip label="Closable" closable onClose={jest.fn()} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', () => {
    const onClose = jest.fn();
    render(<Chip label="Close me" closable onClose={onClose} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when disabled and close button is clicked', () => {
    const onClose = jest.fn();
    render(<Chip label="Disabled close" closable onClose={onClose} disabled />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('renders with a role of button when onClick is provided', () => {
    render(<Chip label="Clickable" onClick={jest.fn()} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
