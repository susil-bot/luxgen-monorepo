import React from 'react';
import { render, screen } from '@testing-library/react';
import { RegisterVisual } from './RegisterVisual';

describe('RegisterVisual', () => {
  it('renders the default testimonial author (Join Our Community)', () => {
    render(<RegisterVisual />);
    expect(screen.getByText('Join Our Community')).toBeInTheDocument();
  });

  it('renders the default stats text', () => {
    render(<RegisterVisual />);
    expect(screen.getByText('Over 10,000+ successful placements')).toBeInTheDocument();
  });

  it('renders a custom testimonial quote', () => {
    const testimonial = {
      quote: 'Best platform ever!',
      author: 'Alice Smith',
      stats: '10k happy users',
    };
    render(<RegisterVisual testimonial={testimonial} />);
    expect(screen.getByText('"Best platform ever!"')).toBeInTheDocument();
  });

  it('renders a custom testimonial author', () => {
    const testimonial = {
      quote: 'Amazing!',
      author: 'Bob Jones',
      stats: '5k users',
    };
    render(<RegisterVisual testimonial={testimonial} />);
    expect(screen.getByText('Bob Jones')).toBeInTheDocument();
  });

  it('renders without crashing with default props', () => {
    const { container } = render(<RegisterVisual />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
