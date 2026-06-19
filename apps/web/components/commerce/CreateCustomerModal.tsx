import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { Modal, useSnackbar } from '@luxgen/ui';
import { CREATE_USER } from '../../graphql/queries/users';
import { GET_USERS } from '../../graphql/queries/users';
import { isMongoObjectId } from '../../lib/mongo-id';

export interface CreateCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string;
  onCreated?: (customerId: string) => void;
}

function FormField({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-secondary block">
        {label}
      </label>
      {children}
    </div>
  );
}

export function CreateCustomerModal({ isOpen, onClose, tenantId, onCreated }: CreateCustomerModalProps) {
  const { showSuccess, showError } = useSnackbar();
  const [createUser, { loading }] = useMutation(CREATE_USER, {
    refetchQueries: [{ query: GET_USERS, variables: { tenantId } }],
  });
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

  const reset = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMongoObjectId(tenantId)) {
      showError('Tenant not ready — refresh the page and try again.');
      return;
    }
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      showError('First name, last name, and email are required.');
      return;
    }

    try {
      const tempPassword = `Welcome${Date.now().toString(36)}!`;
      const { data } = await createUser({
        variables: {
          input: {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim().toLowerCase(),
            password: tempPassword,
            role: 'STUDENT',
            tenantId,
          },
        },
      });

      const id = data?.createUser?.id as string | undefined;
      showSuccess('Customer created. Share login credentials separately if needed.');
      handleClose();
      if (id) onCreated?.(id);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to create customer.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add customer" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-secondary">Creates a learner account (STUDENT role).</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField id="customer-first-name" label="First name">
            <input
              id="customer-first-name"
              className="ios-input w-full"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              autoComplete="given-name"
              required
            />
          </FormField>
          <FormField id="customer-last-name" label="Last name">
            <input
              id="customer-last-name"
              className="ios-input w-full"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              autoComplete="family-name"
              required
            />
          </FormField>
        </div>
        <FormField id="customer-email" label="Email">
          <input
            id="customer-email"
            className="ios-input w-full"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </FormField>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="ios-btn-secondary" onClick={handleClose} disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="ios-btn-primary" disabled={loading}>
            {loading ? 'Creating…' : 'Add customer'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
