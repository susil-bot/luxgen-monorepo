import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PropTypes from 'prop-types';
import Button from './Button';
import fixture from './fixture';
import { snowplowClickHandler } from './utils';

jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'),
  snowplowClickHandler: jest.fn()
}));

const DummyIcon = ({ className }) => <div className={className} />;

DummyIcon.propTypes = {
  className: PropTypes.string
};

describe('Button', () => {
  let mockClick;

  beforeEach(() => {
    mockClick = jest.fn();
  });

  it('renders a button tag by default', () => {
    render(<Button {...fixture} onClickHandler={mockClick} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('has a standard BEM-style class for component name', () => {
    render(<Button {...fixture} onClickHandler={mockClick} />);
    expect(screen.getByRole('button')).toHaveClass('button');
  });

  it('adds the given class name to the component', () => {
    render(<Button {...fixture} onClickHandler={mockClick} className="foo" />);
    const btn = screen.getByRole('button');
    expect(btn).toHaveClass('foo');
  });

  it('sets type button from default prop of inputKind', () => {
    render(
      <Button {...fixture} inputKind={undefined} onClickHandler={mockClick} />
    );
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('does not overwrite the given class name of button', () => {
    render(
      <Button {...fixture} onClickHandler={mockClick} className="bip bazz" />
    );
    expect(screen.getByRole('button')).toHaveClass(
      'button',
      'button--primary',
      'bip',
      'bazz'
    );
  });

  it('renders data attributes on button', () => {
    render(
      <Button
        {...fixture}
        dataAttrs={{ 'data-foo': 'foo', 'data-bar': 'bar' }}
        onClickHandler={mockClick}
      />
    );
    expect(screen.getByRole('button')).toHaveAttribute('data-foo', 'foo');
    expect(screen.getByRole('button')).toHaveAttribute('data-bar', 'bar');
  });

  it('does not attach aria-describedby attributes on button if ariaDescribedby value is empty', () => {
    render(
      <Button {...fixture} ariaDescribedby="" onClickHandler={mockClick} />
    );
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-describedby');
  });

  it('does attach aria-describedby attributes on button if ariaDescribedby value is valid', () => {
    render(
      <Button {...fixture} ariaDescribedby="1234" onClickHandler={mockClick} />
    );
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-describedby',
      '1234'
    );
  });

  it('does attach aria-labelledby attributes on button if ariaLabelledby value is valid', () => {
    render(
      <Button {...fixture} ariaLabelledby="1234" onClickHandler={mockClick} />
    );
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-labelledby',
      '1234'
    );
  });

  it('does not attach aria-labelledby attributes on button if ariaLabelledby value is empty', () => {
    render(
      <Button {...fixture} ariaLabelledby="" onClickHandler={mockClick} />
    );
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-labelledby');
  });

  it('renders the label text inside a span within the button', () => {
    render(<Button {...fixture} onClickHandler={mockClick} />);
    expect(screen.getByText(fixture.label)).toBeInTheDocument();
  });

  it('executes the given method on button click', () => {
    render(<Button {...fixture} onClickHandler={mockClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(mockClick).toHaveBeenCalledTimes(1);
  });

  it('executes the snowplow method on button click', () => {
    render(<Button {...fixture} onClickHandler={mockClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(snowplowClickHandler).toHaveBeenCalled();
  });

  it('adds disabled state', () => {
    render(
      <Button {...fixture} isDisabled={true} onClickHandler={mockClick} />
    );
    expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
  });

  it('renders an optional id property', () => {
    render(<Button {...fixture} id="theId" onClickHandler={mockClick} />);
    expect(screen.getByRole('button')).toHaveAttribute('id', 'theId');
  });

  it('renders an optional role property', () => {
    render(<Button {...fixture} role="link" onClickHandler={mockClick} />);
    expect(screen.getByRole('link')).toBeInTheDocument();
  });

  it('renders an optional form property', () => {
    render(
      <Button
        {...fixture}
        form="newsletter-submit"
        onClickHandler={mockClick}
      />
    );
    expect(screen.getByRole('button')).toHaveAttribute(
      'form',
      'newsletter-submit'
    );
  });

  describe('with prop inputKind to change HTML tag', () => {
    it('renders a <button/> tag for inputKind `button`', () => {
      render(
        <Button {...fixture} inputKind="button" onClickHandler={mockClick} />
      );
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('renders an <a/> tag for inputKind `link`', () => {
      render(
        <Button {...fixture} inputKind="link" onClickHandler={mockClick} />
      );
      expect(screen.getByRole('link')).toBeInTheDocument();
    });

    it('renders an <button/> tag for inputKind `submit`', () => {
      render(
        <Button {...fixture} inputKind="submit" onClickHandler={mockClick} />
      );
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('renders a <button/> tag for inputKind `reset`', () => {
      render(
        <Button {...fixture} inputKind="reset" onClickHandler={mockClick} />
      );
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('renders a <div> tag for inputKind `text`', () => {
      render(
        <Button {...fixture} inputKind="text" onClickHandler={mockClick} />
      );
      expect(screen.getByText('Load More')).toBeInTheDocument();
    });
  });

  describe('with inputKind `link`-only props', () => {
    it('does not add props associated with anchor tags', () => {
      render(
        <Button
          {...fixture}
          inputKind="button"
          rel="nofollow"
          target="_blank"
          onClickHandler={mockClick}
        />
      );
      expect(screen.getByRole('button')).not.toHaveAttribute('rel');
      expect(screen.getByRole('button')).not.toHaveAttribute('target');
    });

    it('does add props associated with anchor tags', () => {
      render(
        <Button
          {...fixture}
          inputKind="link"
          href="#"
          rel="nofollow"
          target="_blank"
          onClickHandler={mockClick}
        />
      );
      expect(screen.getByRole('link')).toHaveAttribute('href', '#');
      expect(screen.getByRole('link')).toHaveAttribute('rel', 'nofollow');
      expect(screen.getByRole('link')).toHaveAttribute('target', '_blank');
    });
  });

  describe('with ButtonIcon', () => {
    it('renders icon button only when "isIconButton" prop is set to true', () => {
      render(
        <Button
          {...fixture}
          ButtonIcon={DummyIcon}
          isIconButton={true}
          onClickHandler={mockClick}
        />
      );
      expect(screen.getByRole('button')).toBeTruthy();
    });

    it('renders icon', () => {
      render(
        <Button
          {...fixture}
          ButtonIcon={DummyIcon}
          hasEnableIcon={true}
          onClickHandler={mockClick}
        />
      );
      expect(screen.getByRole('button')).toBeTruthy();
    });
  });
});
