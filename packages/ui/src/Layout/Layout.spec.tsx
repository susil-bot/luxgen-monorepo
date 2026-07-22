import React from 'react';
import { render, screen } from '@testing-library/react';
import { Layout } from './Layout';
import { GlobalProvider } from '../context/GlobalContext';
import { NavigationProvider } from '../context/NavigationContext';

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <GlobalProvider>
    <NavigationProvider>{children}</NavigationProvider>
  </GlobalProvider>
);

describe('Layout (AppLayout)', () => {
  it('renders children content', () => {
    render(
      <Wrapper>
        <Layout>
          <p>App content</p>
        </Layout>
      </Wrapper>,
    );
    expect(screen.getByText('App content')).toBeInTheDocument();
  });

  it('renders a logo text when provided', () => {
    render(
      <Wrapper>
        <Layout logo={{ text: 'MyApp', href: '/' }}>
          <div />
        </Layout>
      </Wrapper>,
    );
    expect(screen.getByText('MyApp')).toBeInTheDocument();
  });

  it('renders without crashing with minimal props', () => {
    const { container } = render(
      <Wrapper>
        <Layout>
          <div />
        </Layout>
      </Wrapper>,
    );
    expect(container.firstChild).toBeInTheDocument();
  });
});
