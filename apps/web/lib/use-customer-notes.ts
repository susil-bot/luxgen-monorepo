import { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { GET_ACTIVITY_EVENTS } from '../graphql/queries/activity-events';
import { GET_USER, UPDATE_CUSTOMER_NOTES } from '../graphql/queries/users';

export function useCustomerNotes(
  customerId: string | undefined,
  tenantId: string | undefined,
  initialNotes = '',
) {
  const { data, refetch } = useQuery(GET_USER, {
    variables: { id: customerId },
    skip: !customerId,
    fetchPolicy: 'cache-and-network',
  });

  const [updateNotes] = useMutation(UPDATE_CUSTOMER_NOTES, {
    refetchQueries:
      tenantId && customerId
        ? [
            { query: GET_USER, variables: { id: customerId } },
            {
              query: GET_ACTIVITY_EVENTS,
              variables: { tenantId, subjectType: 'CUSTOMER', subjectId: customerId, first: 50 },
            },
          ]
        : [],
  });

  const [notes, setNotes] = useState(initialNotes);
  const [saving, setSaving] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    const stored = data?.user?.staffNotes;
    if (stored !== undefined && !initializedRef.current) {
      setNotes(stored ?? '');
      initializedRef.current = true;
    }
  }, [data?.user?.staffNotes]);

  useEffect(() => {
    initializedRef.current = false;
    setNotes(initialNotes);
  }, [customerId, initialNotes]);

  const persistNotes = useCallback(
    async (value: string) => {
      if (!customerId) return;
      setSaving(true);
      try {
        await updateNotes({
          variables: { input: { customerId, notes: value } },
        });
        await refetch();
      } finally {
        setSaving(false);
      }
    },
    [customerId, refetch, updateNotes],
  );

  const onNotesChange = useCallback(
    (value: string) => {
      setNotes(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        void persistNotes(value);
      }, 600);
    },
    [persistNotes],
  );

  return {
    notes: data?.user?.staffNotes ?? notes,
    onNotesChange,
    savingNotes: saving,
  };
}
