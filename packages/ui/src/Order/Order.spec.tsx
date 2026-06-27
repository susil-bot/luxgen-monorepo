import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { OrderCreateForm } from './OrderCreateForm';
import { OrderEditForm } from './OrderEditForm';
import { orderFixtures } from './fixture';

const sampleStudents = [
  { id: 's1', name: 'Jane Smith', email: 'jane@example.com' },
  { id: 's2', name: 'Bob Lee', email: 'bob@example.com' },
];
const sampleCourses = [
  { id: 'c1', title: 'Intro to Design' },
  { id: 'c2', title: 'Advanced UX' },
];

describe('OrderCreateForm', () => {
  const baseProps = {
    students: sampleStudents,
    courses: sampleCourses,
    studentId: 's1',
    courseId: 'c1',
    onStudentChange: jest.fn(),
    onCourseChange: jest.fn(),
    onSave: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it('renders customer select with student options', () => {
    render(<OrderCreateForm {...baseProps} />);
    expect(screen.getByText('Jane Smith (jane@example.com)')).toBeInTheDocument();
    expect(screen.getByText('Bob Lee (bob@example.com)')).toBeInTheDocument();
  });

  it('renders course select with course options', () => {
    render(<OrderCreateForm {...baseProps} />);
    expect(screen.getByRole('option', { name: 'Intro to Design' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Advanced UX' })).toBeInTheDocument();
  });

  it('calls onStudentChange when a different customer is selected', () => {
    render(<OrderCreateForm {...baseProps} />);
    const select = screen.getByLabelText('Customer');
    fireEvent.change(select, { target: { value: 's2' } });
    expect(baseProps.onStudentChange).toHaveBeenCalledWith('s2');
  });

  it('calls onCourseChange when a different course is selected', () => {
    render(<OrderCreateForm {...baseProps} />);
    const select = screen.getByLabelText('Course / product');
    fireEvent.change(select, { target: { value: 'c2' } });
    expect(baseProps.onCourseChange).toHaveBeenCalledWith('c2');
  });

  it('calls onSave when save button is clicked', () => {
    render(<OrderCreateForm {...baseProps} saveLabel="Create order" />);
    fireEvent.click(screen.getByRole('button', { name: 'Create order' }));
    expect(baseProps.onSave).toHaveBeenCalledTimes(1);
  });

  it('disables save button when saving=true', () => {
    render(<OrderCreateForm {...baseProps} saving savingLabel="Creating…" />);
    expect(screen.getByRole('button', { name: 'Creating…' })).toBeDisabled();
  });

  it('disables save button when no studentId is selected', () => {
    render(<OrderCreateForm {...baseProps} studentId="" />);
    expect(screen.getByRole('button', { name: /create order/i })).toBeDisabled();
  });

  it('disables save button when no courseId is selected', () => {
    render(<OrderCreateForm {...baseProps} courseId="" />);
    expect(screen.getByRole('button', { name: /create order/i })).toBeDisabled();
  });

  it('shows message and disables form when students list is empty', () => {
    render(<OrderCreateForm {...baseProps} students={[]} />);
    expect(screen.getByText(/no customers available/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create order/i })).toBeDisabled();
  });

  it('disables customer select when lockStudent=true', () => {
    render(<OrderCreateForm {...baseProps} lockStudent />);
    expect(screen.getByLabelText('Customer')).toBeDisabled();
  });

  it('shows selected customer name in the summary aside', () => {
    render(<OrderCreateForm {...baseProps} />);
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('shows selected course title in the summary aside', () => {
    render(<OrderCreateForm {...baseProps} />);
    expect(screen.getAllByText('Intro to Design').length).toBeGreaterThanOrEqual(1);
  });

  it('shows default back href', () => {
    render(<OrderCreateForm {...baseProps} />);
    const backLink = screen.getByRole('link', { name: /orders/i });
    expect(backLink).toHaveAttribute('href', '/orders');
  });
});

describe('OrderEditForm', () => {
  const baseProps = {
    order: orderFixtures.detail,
    notes: '',
    paymentStatus: 'paid' as const,
    onNotesChange: jest.fn(),
    onPaymentStatusChange: jest.fn(),
    onSave: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it('renders the order number in the title', () => {
    render(<OrderEditForm {...baseProps} />);
    expect(screen.getByText(`Edit ${orderFixtures.detail.orderNumber}`)).toBeInTheDocument();
  });

  it('renders staff notes textarea', () => {
    render(<OrderEditForm {...baseProps} />);
    expect(screen.getByLabelText('Staff notes')).toBeInTheDocument();
  });

  it('renders payment status select with all options', () => {
    render(<OrderEditForm {...baseProps} />);
    const select = screen.getByLabelText('Payment status');
    expect(select).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Pending' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Paid' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Refunded' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Voided' })).toBeInTheDocument();
  });

  it('calls onNotesChange when notes textarea changes', () => {
    render(<OrderEditForm {...baseProps} />);
    fireEvent.change(screen.getByLabelText('Staff notes'), { target: { value: 'Check with student' } });
    expect(baseProps.onNotesChange).toHaveBeenCalledWith('Check with student');
  });

  it('calls onPaymentStatusChange when payment status changes', () => {
    render(<OrderEditForm {...baseProps} />);
    fireEvent.change(screen.getByLabelText('Payment status'), { target: { value: 'refunded' } });
    expect(baseProps.onPaymentStatusChange).toHaveBeenCalledWith('refunded');
  });

  it('disables save button when saving=true', () => {
    render(<OrderEditForm {...baseProps} saving />);
    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
  });

  it('shows customer name and course title in summary', () => {
    render(<OrderEditForm {...baseProps} />);
    expect(screen.getByText(orderFixtures.detail.customerName)).toBeInTheDocument();
    expect(screen.getByText(orderFixtures.detail.courseTitle)).toBeInTheDocument();
  });
});
