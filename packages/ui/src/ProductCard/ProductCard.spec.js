import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductCard } from './ProductCard';

describe('ProductCard Component', () => {
  const mockProduct = {
    id: '1',
    title: 'Role-Based Modules',
    tag: 'Tech talk',
    tagColor: '#8B5CF6',
    image: '/test-image.jpg',
    imageAlt: 'Product image',
    progress: {
      status: 'Completed',
      score: 50,
      scoreColor: '#F59E0B',
    },
    price: '$99.99',
    originalPrice: '$149.99',
    discount: 33,
  };

  const defaultProps = {
    product: mockProduct,
    onEdit: jest.fn(),
    onLike: jest.fn(),
    onAddToCart: jest.fn(),
    onViewDetails: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<ProductCard {...defaultProps} />);
      
      expect(screen.getByText('Role-Based Modules')).toBeInTheDocument();
      expect(screen.getByText('Tech talk')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('score: 50%')).toBeInTheDocument();
      expect(screen.getByText('$99.99')).toBeInTheDocument();
      expect(screen.getByText('$149.99')).toBeInTheDocument();
      expect(screen.getByText('-33%')).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      render(<ProductCard {...defaultProps} className="custom-class" />);
      const card = screen.getByText('Role-Based Modules').closest('.product-card');
      expect(card).toHaveClass('custom-class');
    });

    it('renders with minimal product data', () => {
      const minimalProduct = {
        id: '2',
        title: 'Basic Product',
        image: '/basic-image.jpg',
      };
      
      render(<ProductCard {...defaultProps} product={minimalProduct} />);
      
      expect(screen.getByText('Basic Product')).toBeInTheDocument();
      expect(screen.queryByText('Tech talk')).not.toBeInTheDocument();
      expect(screen.queryByText('Completed')).not.toBeInTheDocument();
    });
  });

  describe('Image Handling', () => {
    it('renders product image', () => {
      render(<ProductCard {...defaultProps} />);
      
      const image = screen.getByAltText('Product image');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', '/test-image.jpg');
    });

    it('shows placeholder when image fails to load', () => {
      render(<ProductCard {...defaultProps} />);
      
      const image = screen.getByAltText('Product image');
      fireEvent.error(image);
      
      expect(screen.getByText('📷')).toBeInTheDocument();
    });

    it('applies hover effect to image', () => {
      render(<ProductCard {...defaultProps} />);
      
      const image = screen.getByAltText('Product image');
      fireEvent.mouseEnter(image);
      
      expect(image).toHaveStyle('transform: scale(1.05)');
    });
  });

  describe('Like Functionality', () => {
    it('renders like button', () => {
      render(<ProductCard {...defaultProps} />);
      
      const likeButton = screen.getByRole('button');
      expect(likeButton).toBeInTheDocument();
    });

    it('toggles like state when clicked', async () => {
      const user = userEvent.setup();
      render(<ProductCard {...defaultProps} />);
      
      const likeButton = screen.getByRole('button');
      await user.click(likeButton);
      
      expect(defaultProps.onLike).toHaveBeenCalledWith('1', true);
    });

    it('shows liked state correctly', () => {
      render(<ProductCard {...defaultProps} liked={true} />);
      
      const likeButton = screen.getByRole('button');
      const heartIcon = likeButton.querySelector('svg');
      expect(heartIcon).toHaveAttribute('fill', '#EF4444');
    });

    it('prevents event propagation when like button is clicked', async () => {
      const user = userEvent.setup();
      render(<ProductCard {...defaultProps} />);
      
      const likeButton = screen.getByRole('button');
      await user.click(likeButton);
      
      expect(defaultProps.onLike).toHaveBeenCalled();
      expect(defaultProps.onViewDetails).not.toHaveBeenCalled();
    });
  });

  describe('Progress Indicators', () => {
    it('renders progress status', () => {
      render(<ProductCard {...defaultProps} />);
      
      expect(screen.getByText('Completed')).toBeInTheDocument();
    });

    it('renders progress score', () => {
      render(<ProductCard {...defaultProps} />);
      
      expect(screen.getByText('score: 50%')).toBeInTheDocument();
    });

    it('uses custom score color', () => {
      const productWithCustomColor = {
        ...mockProduct,
        progress: {
          ...mockProduct.progress,
          scoreColor: '#10B981',
        },
      };
      
      render(<ProductCard {...defaultProps} product={productWithCustomColor} />);
      
      const scoreIndicator = screen.getByText('score: 50%').previousElementSibling;
      expect(scoreIndicator).toHaveStyle('background-color: #10B981');
    });

    it('hides progress when showProgress is false', () => {
      render(<ProductCard {...defaultProps} showProgress={false} />);
      
      expect(screen.queryByText('Completed')).not.toBeInTheDocument();
      expect(screen.queryByText('score: 50%')).not.toBeInTheDocument();
    });
  });

  describe('Price Display', () => {
    it('renders current price', () => {
      render(<ProductCard {...defaultProps} />);
      
      expect(screen.getByText('$99.99')).toBeInTheDocument();
    });

    it('renders original price with strikethrough', () => {
      render(<ProductCard {...defaultProps} />);
      
      const originalPrice = screen.getByText('$149.99');
      expect(originalPrice).toHaveStyle('text-decoration: line-through');
    });

    it('renders discount percentage', () => {
      render(<ProductCard {...defaultProps} />);
      
      expect(screen.getByText('-33%')).toBeInTheDocument();
    });

    it('hides price when showPrice is false', () => {
      render(<ProductCard {...defaultProps} showPrice={false} />);
      
      expect(screen.queryByText('$99.99')).not.toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('renders edit button', () => {
      render(<ProductCard {...defaultProps} />);
      
      expect(screen.getByText('Edit Product')).toBeInTheDocument();
    });

    it('calls onEdit when edit button is clicked', async () => {
      const user = userEvent.setup();
      render(<ProductCard {...defaultProps} />);
      
      const editButton = screen.getByText('Edit Product');
      await user.click(editButton);
      
      expect(defaultProps.onEdit).toHaveBeenCalledWith('1');
    });

    it('renders add to cart button when onAddToCart is provided', () => {
      render(<ProductCard {...defaultProps} />);
      
      expect(screen.getByText('Add to Cart')).toBeInTheDocument();
    });

    it('calls onAddToCart when add to cart button is clicked', async () => {
      const user = userEvent.setup();
      render(<ProductCard {...defaultProps} />);
      
      const addToCartButton = screen.getByText('Add to Cart');
      await user.click(addToCartButton);
      
      expect(defaultProps.onAddToCart).toHaveBeenCalledWith('1');
    });

    it('hides actions when showActions is false', () => {
      render(<ProductCard {...defaultProps} showActions={false} />);
      
      expect(screen.queryByText('Edit Product')).not.toBeInTheDocument();
      expect(screen.queryByText('Add to Cart')).not.toBeInTheDocument();
    });
  });

  describe('Card Interactions', () => {
    it('calls onViewDetails when card is clicked', async () => {
      const user = userEvent.setup();
      render(<ProductCard {...defaultProps} />);
      
      const card = screen.getByText('Role-Based Modules').closest('.product-card');
      await user.click(card);
      
      expect(defaultProps.onViewDetails).toHaveBeenCalledWith('1');
    });

    it('applies hover effects', () => {
      render(<ProductCard {...defaultProps} />);
      
      const card = screen.getByText('Role-Based Modules').closest('.product-card');
      expect(card).toHaveStyle('cursor: pointer');
    });
  });

  describe('Variants', () => {
    it('renders default variant', () => {
      render(<ProductCard {...defaultProps} variant="default" />);
      
      const card = screen.getByText('Role-Based Modules').closest('.product-card');
      expect(card).toHaveClass('product-card-default');
    });

    it('renders compact variant', () => {
      render(<ProductCard {...defaultProps} variant="compact" />);
      
      const card = screen.getByText('Role-Based Modules').closest('.product-card');
      expect(card).toHaveClass('product-card-compact');
    });

    it('renders detailed variant', () => {
      render(<ProductCard {...defaultProps} variant="detailed" />);
      
      const card = screen.getByText('Role-Based Modules').closest('.product-card');
      expect(card).toHaveClass('product-card-detailed');
    });
  });

  describe('Tag Styling', () => {
    it('uses custom tag color', () => {
      const productWithCustomTag = {
        ...mockProduct,
        tagColor: '#10B981',
      };
      
      render(<ProductCard {...defaultProps} product={productWithCustomTag} />);
      
      const tag = screen.getByText('Tech talk');
      expect(tag).toHaveStyle('background-color: #10B981');
    });

    it('uses default tag color when not provided', () => {
      const productWithoutTagColor = {
        ...mockProduct,
        tagColor: undefined,
      };
      
      render(<ProductCard {...defaultProps} product={productWithoutTagColor} />);
      
      const tag = screen.getByText('Tech talk');
      expect(tag).toHaveStyle('background-color: #8B5CF6');
    });
  });

  describe('Accessibility', () => {
    it('has proper alt text for image', () => {
      render(<ProductCard {...defaultProps} />);
      
      const image = screen.getByAltText('Product image');
      expect(image).toBeInTheDocument();
    });

    it('has clickable buttons with proper roles', () => {
      render(<ProductCard {...defaultProps} />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2); // like button and edit button
    });

    it('has proper heading structure', () => {
      render(<ProductCard {...defaultProps} />);
      
      const title = screen.getByRole('heading', { level: 3 });
      expect(title).toHaveTextContent('Role-Based Modules');
    });
  });

  describe('Edge Cases', () => {
    it('handles product without tag', () => {
      const productWithoutTag = {
        ...mockProduct,
        tag: undefined,
      };
      
      render(<ProductCard {...defaultProps} product={productWithoutTag} />);
      
      expect(screen.queryByText('Tech talk')).not.toBeInTheDocument();
    });

    it('handles product without progress', () => {
      const productWithoutProgress = {
        ...mockProduct,
        progress: undefined,
      };
      
      render(<ProductCard {...defaultProps} product={productWithoutProgress} />);
      
      expect(screen.queryByText('Completed')).not.toBeInTheDocument();
    });

    it('handles product without price', () => {
      const productWithoutPrice = {
        ...mockProduct,
        price: undefined,
        originalPrice: undefined,
      };
      
      render(<ProductCard {...defaultProps} product={productWithoutPrice} />);
      
      expect(screen.queryByText('$99.99')).not.toBeInTheDocument();
    });
  });
});
