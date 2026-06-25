import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BannerCarousel } from './BannerCarousel';

const slides = [
  { id: '1', title: 'Welcome Slide', subtitle: 'First slide content', ctaText: 'Get started' },
  { id: '2', title: 'Features Slide', subtitle: 'Second slide content', ctaText: 'Learn more' },
];

describe('BannerCarousel', () => {
  it('renders the first slide title', () => {
    render(<BannerCarousel slides={slides} autoPlay={false} />);
    expect(screen.getByText('Welcome Slide')).toBeInTheDocument();
  });

  it('renders the CTA button for the first slide', () => {
    render(<BannerCarousel slides={slides} autoPlay={false} />);
    expect(screen.getByText('Get started')).toBeInTheDocument();
  });

  it('navigates to next slide when right arrow is clicked', () => {
    render(<BannerCarousel slides={slides} autoPlay={false} showArrows />);
    fireEvent.click(screen.getByRole('button', { name: 'Next slide' }));
    expect(screen.getByText('Features Slide')).toBeInTheDocument();
  });

  it('renders dot navigation when showDots=true', () => {
    const { container } = render(<BannerCarousel slides={slides} autoPlay={false} showDots />);
    const dots = container.querySelectorAll('button[aria-label]');
    expect(dots.length).toBeGreaterThan(0);
  });

  it('calls onCtaClick when CTA button is clicked', () => {
    const onCtaClick = jest.fn();
    render(<BannerCarousel slides={slides} autoPlay={false} onCtaClick={onCtaClick} />);
    fireEvent.click(screen.getByText('Get started'));
    expect(onCtaClick).toHaveBeenCalledWith(expect.objectContaining({ id: '1' }));
  });

  it('renders nothing when slides array is empty', () => {
    const { container } = render(<BannerCarousel slides={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
