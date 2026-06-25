import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Arrow } from './Arrow';

describe('Arrow', () => {
  it('renders a button with the default aria-label', () => {
    render(<Arrow direction="left" />);
    expect(screen.getByRole('button', { name: 'Navigate left' })).toBeInTheDocument();
  });

  it('renders a custom aria-label', () => {
    render(<Arrow direction="right" aria-label="Next slide" />);
    expect(screen.getByRole('button', { name: 'Next slide' })).toBeInTheDocument();
  });

  it('calls onClick when the button is clicked', () => {
    const onClick = jest.fn();
    render(<Arrow direction="right" onClick={onClick} />);
    fireEvent.click(screen.getByRole('button', { name: 'Navigate right' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled=true', () => {
    render(<Arrow direction="up" disabled />);
    expect(screen.getByRole('button', { name: 'Navigate up' })).toBeDisabled();
  });

  it('renders an SVG icon', () => {
    const { container } = render(<Arrow direction="down" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
