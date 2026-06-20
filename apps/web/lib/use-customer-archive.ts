import { useCallback, useState } from 'react';
import { useMutation } from '@apollo/client';
import { ARCHIVE_CUSTOMER, GET_USERS, RESTORE_CUSTOMER } from '../graphql/queries/users';

export function useCustomerArchive(tenantId: string | undefined) {
  const [archiving, setArchiving] = useState(false);

  const refetchUsers = tenantId
    ? [
        { query: GET_USERS, variables: { tenantId, archiveFilter: 'ACTIVE' } },
        { query: GET_USERS, variables: { tenantId, archiveFilter: 'ARCHIVED' } },
      ]
    : [];

  const [archiveCustomer] = useMutation(ARCHIVE_CUSTOMER, { refetchQueries: refetchUsers });
  const [restoreCustomer] = useMutation(RESTORE_CUSTOMER, { refetchQueries: refetchUsers });

  const archive = useCallback(
    async (customerId: string) => {
      setArchiving(true);
      try {
        await archiveCustomer({ variables: { id: customerId } });
      } finally {
        setArchiving(false);
      }
    },
    [archiveCustomer],
  );

  const restore = useCallback(
    async (customerId: string) => {
      setArchiving(true);
      try {
        await restoreCustomer({ variables: { id: customerId } });
      } finally {
        setArchiving(false);
      }
    },
    [restoreCustomer],
  );

  return { archive, restore, archiving };
}
