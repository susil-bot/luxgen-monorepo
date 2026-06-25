import React from 'react';
import { render, screen } from '@testing-library/react';
import { SplitPageLayout } from './SplitPageLayout';
import { splitPageLayoutFixtures } from './fixture.tsx';

describe('SplitPageLayout', () => {
  it('renders main content', () => {
    render(<SplitPageLayout main={<p>Main section content</p>} />);
    expect(screen.getByText('Main section content')).toBeInTheDocument();
  });

  it('renders aside content when provided', () => {
    render(<SplitPageLayout main={<p>Main</p>} aside={<p>Aside panel</p>} />);
    expect(screen.getByText('Aside panel')).toBeInTheDocument();
  });

  it('renders header slot when provided', () => {
    render(<SplitPageLayout main={<p>Main</p>} header={<h1>Page Header</h1>} />);
    expect(screen.getByText('Page Header')).toBeInTheDocument();
  });

  it('renders productEdit fixture without crashing', () => {
    render(<SplitPageLayout {...splitPageLayoutFixtures.productEdit} />);
    expect(screen.getByText('Main form sections')).toBeInTheDocument();
    expect(screen.getByText('Status · Publishing · Organization')).toBeInTheDocument();
  });

  it('renders settings fixture with leading nav', () => {
    render(<SplitPageLayout {...splitPageLayoutFixtures.settings} />);
    expect(screen.getByText('Settings nav')).toBeInTheDocument();
    expect(screen.getByText('Settings form')).toBeInTheDocument();
  });
});
