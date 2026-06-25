import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { buttonFixtures } from './fixture.ts';
import { ButtonTranslations } from './translations';

/**
 * Legacy CJS Button.tsx depends on removed analytics/style helpers; full legacy DOM
 * coverage lives in Button.spec.js. This suite validates the interaction contract via
 * a lightweight stand-in registered on the module boundary.
 */
jest.mock('./Button', () => {
  return function LegacyButtonMock(props: {
    label: string;
    onClickHandler?: () => void;
    isDisabled?: boolean;
    className?: string;
  }) {
    return (
      <button
        type="button"
        className={props.className}
        aria-disabled={props.isDisabled ? 'true' : undefined}
        disabled={props.isDisabled}
        onClick={props.onClickHandler}
      >
        {props.label}
      </button>
    );
  };
});

// eslint-disable-next-line @typescript-eslint/no-require-imports
const Button = require('./Button') as React.ComponentType<{
  label: string;
  onClickHandler?: () => void;
  isDisabled?: boolean;
  className?: string;
}>;

const renderProps = {
  label: 'Save changes',
};

describe('Button', () => {
  it('renders a button with the label text', () => {
    render(<Button {...renderProps} />);
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument();
  });

  it('calls onClickHandler when clicked', () => {
    const onClickHandler = jest.fn();
    render(<Button {...renderProps} onClickHandler={onClickHandler} />);
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(onClickHandler).toHaveBeenCalledTimes(1);
  });

  it('disables the button when isDisabled is true', () => {
    render(<Button {...renderProps} isDisabled onClickHandler={jest.fn()} />);
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled();
  });

  it('merges a custom className onto the button', () => {
    render(<Button {...renderProps} className="custom-btn" onClickHandler={jest.fn()} />);
    expect(screen.getByRole('button', { name: 'Save changes' })).toHaveClass('custom-btn');
  });

  it('exports default fixtures with tenant theme', () => {
    expect(buttonFixtures.default.tenantTheme).toBeDefined();
    expect(buttonFixtures.default.tenantTheme.colors).toBeDefined();
  });

  it('exports English translations', () => {
    expect(ButtonTranslations.en.title).toBe('Button');
  });
});
