import { useCallback, useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_ORDER_CHECKOUT } from '../graphql/queries/enrollment';

export interface OrderCheckoutInput {
  tenantId: string;
  courseId: string;
  studentId: string;
  amountCents: number;
  courseTitle: string;
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
}

export function useOrderCheckout() {
  const [error, setError] = useState<string | null>(null);
  const [createCheckout, { loading }] = useMutation(CREATE_ORDER_CHECKOUT);

  const startCheckout = useCallback(
    async (input: OrderCheckoutInput) => {
      setError(null);
      const { data } = await createCheckout({ variables: { input } });
      const url = data?.createOrderCheckoutSession?.url as string | undefined;
      if (!url) throw new Error('Checkout URL not returned');
      if (typeof window !== 'undefined') window.location.href = url;
      return data.createOrderCheckoutSession;
    },
    [createCheckout],
  );

  return { startCheckout, loading, error };
}
