import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Accordion } from './Accordion';
import { accordionFixtures } from './fixture';

describe('Accordion', () => {
  it('renders with default props', () => {
    render(<Accordion {...accordionFixtures.default} />);
    
    expect(screen.getByText('Accordion Item 1')).toBeInTheDocument();
    expect(screen.getByText('Accordion Item 2')).toBeInTheDocument();
    expect(screen.getByText('Accordion Item 3')).toBeInTheDocument();
  });

  it('renders with multiple items open', () => {
    render(<Accordion {...accordionFixtures.withMultiple} />);
    
    expect(screen.getByText('Accordion Item 1')).toBeInTheDocument();
    expect(screen.getByText('Accordion Item 2')).toBeInTheDocument();
  });

  it('renders with none allowed', () => {
    render(<Accordion {...accordionFixtures.withNone} />);
    
    expect(screen.getByText('Accordion Item 1')).toBeInTheDocument();
  });

  it('renders with different variants', () => {
    render(<Accordion {...accordionFixtures.bordered} />);
    expect(screen.getByText('Accordion Item 1')).toBeInTheDocument();
    
    render(<Accordion {...accordionFixtures.filled} />);
    expect(screen.getByText('Accordion Item 1')).toBeInTheDocument();
    
    render(<Accordion {...accordionFixtures.minimal} />);
    expect(screen.getByText('Accordion Item 1')).toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    render(<Accordion {...accordionFixtures.small} />);
    const smallAccordion = screen.getByText('Accordion Item 1').closest('.accordion');
    expect(smallAccordion).toHaveClass('accordion-small');
    
    render(<Accordion {...accordionFixtures.medium} />);
    const mediumAccordion = screen.getByText('Accordion Item 1').closest('.accordion');
    expect(mediumAccordion).toHaveClass('accordion-medium');
    
    render(<Accordion {...accordionFixtures.large} />);
    const largeAccordion = screen.getByText('Accordion Item 1').closest('.accordion');
    expect(largeAccordion).toHaveClass('accordion-large');
  });

  it('renders with left icon', () => {
    render(<Accordion {...accordionFixtures.withLeftIcon} />);
    
    expect(screen.getByText('Accordion Item 1')).toBeInTheDocument();
  });

  it('renders with right icon', () => {
    render(<Accordion {...accordionFixtures.withRightIcon} />);
    
    expect(screen.getByText('Accordion Item 1')).toBeInTheDocument();
  });

  it('renders without icon', () => {
    render(<Accordion {...accordionFixtures.withoutIcon} />);
    
    expect(screen.getByText('Accordion Item 1')).toBeInTheDocument();
  });

  it('calls onToggle when item is clicked', () => {
    const onToggle = jest.fn();
    render(<Accordion {...accordionFixtures.withCallbacks} onToggle={onToggle} />);
    
    const trigger = screen.getByText('Accordion Item 1');
    fireEvent.click(trigger);
    
    expect(onToggle).toHaveBeenCalledWith('1', true);
  });

  it('calls onItemClick when content is clicked', () => {
    const onItemClick = jest.fn();
    render(<Accordion {...accordionFixtures.withCallbacks} onItemClick={onItemClick} />);
    
    // First open the accordion
    const trigger = screen.getByText('Accordion Item 1');
    fireEvent.click(trigger);
    
    // Then click the content
    const content = screen.getByText('Content for accordion item 1');
    fireEvent.click(content);
    
    expect(onItemClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: '1', title: 'Accordion Item 1' }),
      0
    );
  });

  it('renders with custom theme', () => {
    render(<Accordion {...accordionFixtures.withCustomTheme} />);
    
    expect(screen.getByText('Accordion Item 1')).toBeInTheDocument();
  });

  it('renders with single item', () => {
    render(<Accordion {...accordionFixtures.singleItem} />);
    
    expect(screen.getByText('Accordion Item 1')).toBeInTheDocument();
  });

  it('renders with empty items', () => {
    render(<Accordion {...accordionFixtures.emptyItems} />);
    
    expect(screen.getByText('Accordion Item 1')).not.toBeInTheDocument();
  });

  it('renders with all features', () => {
    render(<Accordion {...accordionFixtures.withAllFeatures} />);
    
    expect(screen.getByText('Accordion Item 1')).toBeInTheDocument();
    expect(screen.getByText('Accordion Item 2')).toBeInTheDocument();
    expect(screen.getByText('Accordion Item 3')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Accordion {...accordionFixtures.default} className="custom-accordion" />);
    
    const accordion = screen.getByText('Accordion Item 1').closest('.accordion');
    expect(accordion).toHaveClass('custom-accordion');
  });

  it('applies custom style', () => {
    const customStyle = { border: '2px solid red' };
    render(<Accordion {...accordionFixtures.default} style={customStyle} />);
    
    const accordion = screen.getByText('Accordion Item 1').closest('.accordion');
    expect(accordion).toHaveStyle('border: 2px solid red');
  });

  it('handles disabled items', () => {
    render(<Accordion {...accordionFixtures.default} />);
    
    const disabledItem = screen.getByText('Accordion Item 3');
    expect(disabledItem).toBeDisabled();
  });

  it('handles keyboard navigation', () => {
    render(<Accordion {...accordionFixtures.default} />);
    
    const trigger = screen.getByText('Accordion Item 1');
    fireEvent.keyDown(trigger, { key: 'Enter' });
    
    // Should toggle the accordion
    expect(screen.getByText('Content for accordion item 1')).toBeInTheDocument();
  });

  it('handles multiple selection', () => {
    render(<Accordion {...accordionFixtures.withMultiple} />);
    
    const trigger1 = screen.getByText('Accordion Item 1');
    const trigger2 = screen.getByText('Accordion Item 2');
    
    fireEvent.click(trigger1);
    fireEvent.click(trigger2);
    
    expect(screen.getByText('Content for accordion item 1')).toBeInTheDocument();
    expect(screen.getByText('Content for accordion item 2')).toBeInTheDocument();
  });
});
