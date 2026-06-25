import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Snackbar } from './Snackbar';

describe('Snackbar', () => {
  it('does not render the message when open=false', () => {
    render(<Snackbar open={false} message="Hidden message" />);
    expect(screen.queryByText('Hidden message')).not.toBeInTheDocument();
  });

  it('renders the message when open=true', async () => {
    render(<Snackbar open message="Hello!" duration={0} />);
    await waitFor(() => expect(screen.getByText('Hello!')).toBeInTheDocument());
  });

  it('renders the close button when closable=true (default)', async () => {
    render(<Snackbar open message="Closable" duration={0} />);
    await waitFor(() => expect(screen.getByRole('button')).toBeInTheDocument());
  });

  it('calls onClose when the close button is clicked', async () => {
    const onClose = jest.fn();
    render(<Snackbar open message="Close me" onClose={onClose} duration={0} />);
    await waitFor(() => fireEvent.click(screen.getByRole('button')));
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it('renders an action button when action is provided', async () => {
    const action = { label: 'Undo', onClick: jest.fn() };
    render(<Snackbar open message="Done" action={action} duration={0} />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument());
  });

  it('calls action.onClick when action button is clicked', async () => {
    const action = { label: 'Retry', onClick: jest.fn() };
    render(<Snackbar open message="Failed" action={action} duration={0} />);
    await waitFor(() => fireEvent.click(screen.getByRole('button', { name: 'Retry' })));
    expect(action.onClick).toHaveBeenCalledTimes(1);
  });
});
