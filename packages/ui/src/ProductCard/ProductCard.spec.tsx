import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProductCard } from './ProductCard';

const sampleProduct = {
  id: 'p1',
  title: 'Introduction to UX Design',
  tag: 'Bestseller',
  image: 'https://example.com/course.jpg',
  imageAlt: 'UX Design course cover',
  progress: { status: 'In progress', score: 70 },
  price: '$49.99',
};

describe('ProductCard', () => {
  const baseProps = {
    product: sampleProduct,
    onViewDetails: jest.fn(),
    onLike: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it('renders the product title', () => {
    render(<ProductCard {...baseProps} />);
    expect(screen.getByText('Introduction to UX Design')).toBeInTheDocument();
  });

  it('renders the product tag', () => {
    render(<ProductCard {...baseProps} />);
    expect(screen.getByText('Bestseller')).toBeInTheDocument();
  });

  it('renders the product price', () => {
    render(<ProductCard {...baseProps} />);
    expect(screen.getByText('$49.99')).toBeInTheDocument();
  });

  it('renders without crashing with minimal props', () => {
    const { container } = render(<ProductCard product={{ id: 'p2', title: 'Test', image: '' }} />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
