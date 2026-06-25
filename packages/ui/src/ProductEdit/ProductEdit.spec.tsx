import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductEditForm } from './ProductEditForm';
import { productEditFixtures } from './fixture';

describe('ProductEditForm', () => {
  const baseProps = {
    ...productEditFixtures.default,
    onTitleChange: jest.fn(),
    onBodyChange: jest.fn(),
    onSeoChange: jest.fn(),
    onMetaChange: jest.fn(),
    onStatusChange: jest.fn(),
    onSave: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it('renders the product title in the header', () => {
    render(<ProductEditForm {...baseProps} />);
    expect(screen.getByRole('heading', { name: 'Introduction to Product Design' })).toBeInTheDocument();
  });

  it('renders the status badge', () => {
    render(<ProductEditForm {...baseProps} />);
    expect(screen.getAllByText('Active')[0]).toBeInTheDocument();
  });

  it('renders the save button', () => {
    render(<ProductEditForm {...baseProps} />);
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('calls onSave when save button is clicked', () => {
    render(<ProductEditForm {...baseProps} />);
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(baseProps.onSave).toHaveBeenCalledTimes(1);
  });

  it('disables save button when saving=true', () => {
    render(<ProductEditForm {...baseProps} saving />);
    expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled();
  });

  it('renders "Untitled product" when title is empty', () => {
    render(
      <ProductEditForm
        {...productEditFixtures.draft}
        onTitleChange={jest.fn()}
        onBodyChange={jest.fn()}
        onSeoChange={jest.fn()}
        onMetaChange={jest.fn()}
        onStatusChange={jest.fn()}
        onSave={jest.fn()}
      />,
    );
    expect(screen.getByText('Untitled product')).toBeInTheDocument();
  });

  it('renders Draft badge for draft products', () => {
    render(
      <ProductEditForm
        {...productEditFixtures.draft}
        onTitleChange={jest.fn()}
        onBodyChange={jest.fn()}
        onSeoChange={jest.fn()}
        onMetaChange={jest.fn()}
        onStatusChange={jest.fn()}
        onSave={jest.fn()}
      />,
    );
    expect(screen.getAllByText('Draft')[0]).toBeInTheDocument();
  });

  it('renders back link to products page', () => {
    render(<ProductEditForm {...baseProps} />);
    expect(screen.getByRole('link', { name: /products/i })).toHaveAttribute('href', '/products');
  });

  it('calls onTitleChange when title input changes', () => {
    render(<ProductEditForm {...baseProps} />);
    const titleInput = screen.getByLabelText('Title');
    fireEvent.change(titleInput, { target: { value: 'New Course Title' } });
    expect(baseProps.onTitleChange).toHaveBeenCalledWith('New Course Title');
  });
});
