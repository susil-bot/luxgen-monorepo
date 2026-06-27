import React from 'react';
import { render } from '@testing-library/react';
import { AIStudioLogo } from './AIStudioLogo';

describe('AIStudioLogo', () => {
  it('renders without crashing', () => {
    const { container } = render(<AIStudioLogo />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders an SVG icon', () => {
    const { container } = render(<AIStudioLogo />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('applies custom size (wrapper uses size + 12px padding)', () => {
    const { container } = render(<AIStudio size={32} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.width).toBe('44px');
    expect(wrapper.style.height).toBe('44px');
  });

  it('applies custom className', () => {
    const { container } = render(<AIStudio className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
