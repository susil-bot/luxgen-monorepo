import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchBar } from './SearchBar';

describe('SearchBar', () => {
  it('renders the search input with default placeholder', () => {
    render(<SearchBar />);
    expect(screen.getByRole('textbox', { name: 'Search' })).toBeInTheDocument();
  });

  it('renders a custom placeholder', () => {
    render(<SearchBar placeholder="Find courses" />);
    expect(screen.getByRole('textbox', { name: 'Find courses' })).toBeInTheDocument();
  });

  it('calls onChange when the user types', () => {
    const onChange = jest.fn();
    render(<SearchBar onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Search' }), { target: { value: 'react' } });
    expect(onChange).toHaveBeenCalledWith('react');
  });

  it('calls onSearch when form is submitted', () => {
    const onSearch = jest.fn();
    const { container } = render(<SearchBar onSearch={onSearch} />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Search' }), { target: { value: 'query' } });
    fireEvent.submit(container.querySelector('form')!);
    expect(onSearch).toHaveBeenCalledWith('query');
  });

  it('is disabled when disabled=true', () => {
    render(<SearchBar disabled />);
    expect(screen.getByRole('textbox', { name: 'Search' })).toBeDisabled();
  });

  it('shows suggestions when input matches and suggestions are provided', () => {
    render(<SearchBar suggestions={['React', 'Redux', 'Vue']} value="Re" />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Search' }), { target: { value: 'Re' } });
    fireEvent.focus(screen.getByRole('textbox', { name: 'Search' }));
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Redux')).toBeInTheDocument();
  });

  it('calls onSuggestionClick when a suggestion is clicked', () => {
    const onSuggestionClick = jest.fn();
    render(<SearchBar suggestions={['React', 'Redux']} value="Re" onSuggestionClick={onSuggestionClick} />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Search' }), { target: { value: 'Re' } });
    fireEvent.focus(screen.getByRole('textbox', { name: 'Search' }));
    fireEvent.click(screen.getByText('React'));
    expect(onSuggestionClick).toHaveBeenCalledWith('React');
  });

  it('calls onFocus when input is focused', () => {
    const onFocus = jest.fn();
    render(<SearchBar onFocus={onFocus} />);
    fireEvent.focus(screen.getByRole('textbox', { name: 'Search' }));
    expect(onFocus).toHaveBeenCalledTimes(1);
  });
});
