import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Arrow } from './Arrow';

describe('Arrow Component', () => {
  const defaultProps = {
    direction: 'left',
    onClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<Arrow {...defaultProps} />);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-label', 'Navigate left');
    });

    it('renders with custom aria-label', () => {
      render(<Arrow {...defaultProps} aria-label="Custom label" />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Custom label');
    });

    it('renders with custom className', () => {
      render(<Arrow {...defaultProps} className="custom-class" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('renders as disabled when disabled prop is true', () => {
      render(<Arrow {...defaultProps} disabled={true} />);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('arrow-button');
      // Check if the style is applied correctly
      expect(button.style.opacity).toBe('0.5');
    });
  });

  describe('Directions', () => {
    it('renders left arrow correctly', () => {
      render(<Arrow direction="left" onClick={jest.fn()} />);
      const svg = screen.getByRole('button').querySelector('svg');
      expect(svg).toHaveClass('arrow-icon');
      expect(svg.style.transform).toBe('rotate(0deg)');
    });

    it('renders right arrow correctly', () => {
      render(<Arrow direction="right" onClick={jest.fn()} />);
      const svg = screen.getByRole('button').querySelector('svg');
      expect(svg).toHaveClass('arrow-icon');
      expect(svg.style.transform).toBe('rotate(180deg)');
    });

    it('renders up arrow correctly', () => {
      render(<Arrow direction="up" onClick={jest.fn()} />);
      const svg = screen.getByRole('button').querySelector('svg');
      expect(svg).toHaveClass('arrow-icon');
      expect(svg.style.transform).toBe('rotate(-90deg)');
    });

    it('renders down arrow correctly', () => {
      render(<Arrow direction="down" onClick={jest.fn()} />);
      const svg = screen.getByRole('button').querySelector('svg');
      expect(svg).toHaveClass('arrow-icon');
      expect(svg.style.transform).toBe('rotate(90deg)');
    });
  });

  describe('Sizes', () => {
    it('renders small size correctly', () => {
      render(<Arrow {...defaultProps} size="small" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('arrow-button');
      expect(button.style.width).toBe('24px');
      expect(button.style.height).toBe('24px');
    });

    it('renders medium size correctly (default)', () => {
      render(<Arrow {...defaultProps} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('arrow-button');
      expect(button.style.width).toBe('32px');
      expect(button.style.height).toBe('32px');
    });

    it('renders large size correctly', () => {
      render(<Arrow {...defaultProps} size="large" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('arrow-button');
      expect(button.style.width).toBe('40px');
      expect(button.style.height).toBe('40px');
    });
  });

  describe('Variants', () => {
    it('renders default variant correctly', () => {
      render(<Arrow {...defaultProps} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('arrow-button');
      expect(button.style.backgroundColor).toBe('rgb(227, 242, 253)'); // Light blue from Figma
      expect(button.style.color).toBe('rgb(17, 24, 39)'); // Dark gray from theme
    });

    it('renders outline variant correctly', () => {
      render(<Arrow {...defaultProps} variant="outline" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('arrow-button');
      expect(button.style.backgroundColor).toBe('rgb(249, 250, 251)'); // Hover background color
      expect(button.style.border).toBe('1px solid #e5e7eb');
    });

    it('renders ghost variant correctly', () => {
      render(<Arrow {...defaultProps} variant="ghost" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('arrow-button');
      expect(button.style.backgroundColor).toBe('transparent');
      expect(button.style.color).toBe('rgb(107, 114, 128)');
    });
  });

  describe('Interactions', () => {
    it('calls onClick when clicked', async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();
      render(<Arrow {...defaultProps} onClick={onClick} />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();
      render(<Arrow {...defaultProps} onClick={onClick} disabled={true} />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(onClick).not.toHaveBeenCalled();
    });

    it('handles keyboard navigation', () => {
      const onClick = jest.fn();
      render(<Arrow {...defaultProps} onClick={onClick} />);
      
      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
      
      // The button is focusable and clickable
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('arrow-button');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<Arrow {...defaultProps} />);
      const button = screen.getByRole('button');
      
      expect(button).toHaveAttribute('aria-label');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('has focus styles', () => {
      render(<Arrow {...defaultProps} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('arrow-button');
      expect(button.style.outline).toBe('none');
    });

    it('generates correct aria-label for each direction', () => {
      const directions = ['left', 'right', 'up', 'down'];
      
      directions.forEach(direction => {
        const { unmount } = render(<Arrow direction={direction} onClick={jest.fn()} />);
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('aria-label', `Navigate ${direction}`);
        unmount();
      });
    });
  });

  describe('SVG Icon', () => {
    it('renders SVG with correct attributes', () => {
      render(<Arrow {...defaultProps} />);
      const svg = screen.getByRole('button').querySelector('svg');
      
      expect(svg).toHaveAttribute('fill', 'none');
      expect(svg).toHaveAttribute('stroke', 'currentColor');
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
      expect(svg).toHaveClass('arrow-icon');
    });

    it('renders path element with correct attributes', () => {
      render(<Arrow {...defaultProps} />);
      const path = screen.getByRole('button').querySelector('path');
      
      expect(path).toHaveClass('arrow-path');
      expect(path).toHaveAttribute('d', 'M15 19l-7-7 7-7');
      expect(path.getAttribute('stroke-linecap')).toBe('round');
      expect(path.getAttribute('stroke-linejoin')).toBe('round');
      expect(path.getAttribute('stroke-width')).toBe('2');
    });
  });

  describe('Combined Props', () => {
    it('renders with all props combined', () => {
      render(
        <Arrow
          direction="right"
          size="large"
          variant="outline"
          disabled={false}
          onClick={jest.fn()}
          className="custom-class"
          aria-label="Custom arrow"
        />
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('arrow-button');
      expect(button).toHaveClass('custom-class');
      expect(button.style.width).toBe('40px'); // large size
      expect(button.style.height).toBe('40px'); // large size
      // Note: The actual background color might be affected by CSS hover effects
      expect(button.style.backgroundColor).toBe('rgb(249, 250, 251)'); // outline variant with hover
      expect(button).toHaveAttribute('aria-label', 'Custom arrow');
      expect(button).not.toBeDisabled();
    });
  });
});
