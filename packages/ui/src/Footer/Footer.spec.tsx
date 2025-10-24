import React from 'react';
import { render, screen } from '@testing-library/react';
import { Footer } from './Footer';
import { footerFixtures } from './fixture';

describe('Footer', () => {
  it('renders with default props', () => {
    render(<Footer {...footerFixtures.default} />);
    
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    expect(screen.getByText('Terms of Service')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
    expect(screen.getByText('© 2024 LuxGen. All rights reserved.')).toBeInTheDocument();
  });

  it('renders without links', () => {
    render(<Footer {...footerFixtures.withoutLinks} />);
    
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(screen.getByText('© 2024 LuxGen. All rights reserved.')).toBeInTheDocument();
    expect(screen.queryByText('Privacy Policy')).not.toBeInTheDocument();
  });

  it('renders with custom theme', () => {
    render(<Footer {...footerFixtures.withCustomTheme} />);
    
    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveStyle('background-color: #F3F4F6');
    expect(footer).toHaveStyle('color: #6B7280');
  });

  it('renders with many links', () => {
    render(<Footer {...footerFixtures.withManyLinks} />);
    
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    expect(screen.getByText('Terms of Service')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
    expect(screen.getByText('Help')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Blog')).toBeInTheDocument();
    expect(screen.getByText('Careers')).toBeInTheDocument();
    expect(screen.getByText('Support')).toBeInTheDocument();
  });

  it('renders with custom copyright', () => {
    render(<Footer {...footerFixtures.withCustomCopyright} />);
    
    expect(screen.getByText('© 2024 My Company. Made with ❤️')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Footer {...footerFixtures.default} className="custom-footer" />);
    
    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveClass('custom-footer');
  });

  it('applies custom style', () => {
    const customStyle = { border: '2px solid red' };
    render(<Footer {...footerFixtures.default} style={customStyle} />);
    
    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveStyle('border: 2px solid red');
  });

  it('renders links with correct href attributes', () => {
    render(<Footer {...footerFixtures.default} />);
    
    const privacyLink = screen.getByText('Privacy Policy');
    expect(privacyLink).toHaveAttribute('href', '/privacy');
    
    const termsLink = screen.getByText('Terms of Service');
    expect(termsLink).toHaveAttribute('href', '/terms');
    
    const contactLink = screen.getByText('Contact');
    expect(contactLink).toHaveAttribute('href', '/contact');
  });
});
