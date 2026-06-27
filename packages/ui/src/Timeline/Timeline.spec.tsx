import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Timeline } from './Timeline';
import { timelineFixtures } from './fixture';

describe('Timeline', () => {
  const baseProps = {
    events: timelineFixtures,
  };

  it('renders SYSTEM event messages directly', () => {
    render(<Timeline {...baseProps} />);
    expect(screen.getByText('Order #1038 confirmation email sent.')).toBeInTheDocument();
  });

  it('renders STAFF_COMMENT events as "Actor left a comment"', () => {
    render(<Timeline {...baseProps} />);
    expect(screen.getByText(/left a comment/i)).toBeInTheDocument();
  });

  it('renders the title when provided', () => {
    render(<Timeline {...baseProps} title="Activity" />);
    expect(screen.getByText('Activity')).toBeInTheDocument();
  });

  it('shows empty message when no events provided', () => {
    render(<Timeline events={[]} />);
    expect(screen.getByText('No activity yet')).toBeInTheDocument();
  });

  it('renders comment textarea when allowComments=true', () => {
    render(<Timeline {...baseProps} allowComments onPostComment={jest.fn()} />);
    expect(screen.getByPlaceholderText('Leave a comment…')).toBeInTheDocument();
  });

  it('calls onCommentDraftChange when typing in comment textarea', () => {
    const onCommentDraftChange = jest.fn();
    render(
      <Timeline
        {...baseProps}
        allowComments
        commentDraft=""
        onCommentDraftChange={onCommentDraftChange}
        onPostComment={jest.fn()}
      />,
    );
    fireEvent.change(screen.getByPlaceholderText('Leave a comment…'), { target: { value: 'Great work!' } });
    expect(onCommentDraftChange).toHaveBeenCalledWith('Great work!');
  });
});
