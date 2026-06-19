import { orderFixtures } from '../../fixture';
import type { OrderListTableProps } from './OrderListTable';

export const orderListTableFixtures = {
  default: { orders: orderFixtures.listRows } satisfies OrderListTableProps,
  empty: { orders: [] } satisfies OrderListTableProps,
};
