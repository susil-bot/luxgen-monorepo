import { useCallback, useState } from 'react';
import { useMutation } from '@apollo/client';
import type { CustomerDetail } from '@luxgen/ui';
import { GET_USER, UPDATE_USER } from '../graphql/queries/users';
import { applyProfilePatch, type CustomerProfileInput } from './customer-profile';

export function useCustomerProfile(customerId: string | undefined) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [updateUser] = useMutation(UPDATE_USER, {
    refetchQueries: customerId ? [{ query: GET_USER, variables: { id: customerId } }] : [],
  });

  const saveProfile = useCallback(
    async (input: CustomerProfileInput, optimistic?: CustomerDetail) => {
      if (!customerId) return null;
      setSaving(true);
      setError(null);
      try {
        const { data } = await updateUser({
          variables: {
            id: customerId,
            input: {
              ...(input.firstName !== undefined && { firstName: input.firstName.trim() }),
              ...(input.lastName !== undefined && { lastName: input.lastName.trim() }),
              ...(input.email !== undefined && { email: input.email.trim().toLowerCase() }),
              ...(input.phone !== undefined && { phone: input.phone.trim() }),
              ...(input.marketingEmail !== undefined && { marketingEmail: input.marketingEmail }),
              ...(input.marketingSms !== undefined && { marketingSms: input.marketingSms }),
              ...(input.marketingWhatsapp !== undefined && { marketingWhatsapp: input.marketingWhatsapp }),
            },
          },
        });
        const user = data?.updateUser;
        if (!user) throw new Error('Update failed');
        if (optimistic) {
          return applyProfilePatch(optimistic, {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone ?? '',
            marketingEmail: user.marketingEmail,
            marketingSms: user.marketingSms,
            marketingWhatsapp: user.marketingWhatsapp,
          });
        }
        return null;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to save customer';
        setError(message);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [customerId, updateUser],
  );

  return { saveProfile, saving, error };
}
