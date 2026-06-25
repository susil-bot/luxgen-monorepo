import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CountryLanguageDropdown } from './CountryLanguageDropdown';

const uk = { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' };
const us = { code: 'US', name: 'United States', flag: '🇺🇸' };
const english = { code: 'en', name: 'English', nativeName: 'English' };
const spanish = { code: 'es', name: 'Spanish', nativeName: 'Español' };

describe('CountryLanguageDropdown', () => {
  const baseProps = {
    selectedCountry: uk,
    selectedLanguage: english,
    countries: [uk, us],
    languages: [english, spanish],
    onCountryChange: jest.fn(),
    onLanguageChange: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it('renders the selected language name in the trigger', () => {
    render(<CountryLanguageDropdown {...baseProps} />);
    expect(screen.getByText('English')).toBeInTheDocument();
  });

  it('renders the selected country flag in the trigger', () => {
    render(<CountryLanguageDropdown {...baseProps} />);
    expect(screen.getByText('🇬🇧')).toBeInTheDocument();
  });

  it('opens the dropdown when trigger is clicked', () => {
    render(<CountryLanguageDropdown {...baseProps} />);
    fireEvent.click(screen.getByText('English'));
    expect(screen.getByRole('button', { name: 'Country' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Language' })).toBeInTheDocument();
  });

  it('shows country list by default when dropdown is open', () => {
    render(<CountryLanguageDropdown {...baseProps} />);
    fireEvent.click(screen.getByText('English'));
    expect(screen.getByText('United Kingdom')).toBeInTheDocument();
    expect(screen.getByText('United States')).toBeInTheDocument();
  });

  it('calls onCountryChange when a country is selected', () => {
    render(<CountryLanguageDropdown {...baseProps} />);
    fireEvent.click(screen.getByText('English'));
    fireEvent.click(screen.getByText('United States'));
    expect(baseProps.onCountryChange).toHaveBeenCalledWith(us);
  });

  it('shows language list when Language tab is clicked', () => {
    render(<CountryLanguageDropdown {...baseProps} />);
    fireEvent.click(screen.getByText('English'));
    fireEvent.click(screen.getByRole('button', { name: 'Language' }));
    expect(screen.getByText('Spanish')).toBeInTheDocument();
  });

  it('calls onLanguageChange when a language is selected', () => {
    render(<CountryLanguageDropdown {...baseProps} />);
    fireEvent.click(screen.getByText('English'));
    fireEvent.click(screen.getByRole('button', { name: 'Language' }));
    fireEvent.click(screen.getByText('Spanish'));
    expect(baseProps.onLanguageChange).toHaveBeenCalledWith(spanish);
  });

  it('is disabled when disabled=true', () => {
    render(<CountryLanguageDropdown {...baseProps} disabled />);
    const trigger = screen.getByRole('button');
    expect(trigger).toBeDisabled();
  });
});
