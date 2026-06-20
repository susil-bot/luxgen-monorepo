import { useCallback, useState } from 'react';
import { useMutation } from '@apollo/client';
import type { OrderDetail, OrderPaymentStatus } from '@luxgen/ui';
import { GET_COURSES } from '../graphql/queries/courses';
import {
  GET_ENROLLMENTS,
  GET_ENROLLMENT,
  REFUND_ORDER,
  CANCEL_ORDER,
  UPDATE_ORDER,
} from '../graphql/queries/enrollment';
import { resolveOrderPair } from './use-order-enrollment';
import { isMongoObjectId } from './mongo-id';

function toGraphqlPaymentStatus(status: OrderPaymentStatus): string {
  switch (status) {
    case 'paid':
      return 'PAID';
    case 'refunded':
      return 'REFUNDED';
    case 'voided':
      return 'VOIDED';
    default:
      return 'PENDING';
  }
}

export function useOrderActions(order: OrderDetail | null | undefined, tenantId: string | undefined) {
  const parts = resolveOrderPair(order);
  const [refunding, setRefunding] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [saving, setSaving] = useState(false);

  const refetchQueries = parts
    ? [
        { query: GET_ENROLLMENT, variables: { courseId: parts.courseId, studentId: parts.studentId } },
        ...(isMongoObjectId(tenantId)
          ? [
              { query: GET_ENROLLMENTS, variables: { tenantId } },
              { query: GET_COURSES, variables: { tenantId } },
            ]
          : []),
      ]
    : [];

  const [refundOrder] = useMutation(REFUND_ORDER, { refetchQueries });
  const [cancelOrder] = useMutation(CANCEL_ORDER, { refetchQueries });
  const [updateOrder] = useMutation(UPDATE_ORDER, { refetchQueries });

  const refund = useCallback(async () => {
    if (!parts) throw new Error('Order not found');
    setRefunding(true);
    try {
      await refundOrder({
        variables: { courseId: parts.courseId, studentId: parts.studentId },
      });
    } finally {
      setRefunding(false);
    }
  }, [parts, refundOrder]);

  const cancel = useCallback(async () => {
    if (!parts) throw new Error('Order not found');
    setCancelling(true);
    try {
      await cancelOrder({
        variables: { courseId: parts.courseId, studentId: parts.studentId },
      });
    } finally {
      setCancelling(false);
    }
  }, [parts, cancelOrder]);

  const saveOrder = useCallback(
    async (notes: string, paymentStatus: OrderPaymentStatus) => {
      if (!parts) throw new Error('Order not found');
      setSaving(true);
      try {
        await updateOrder({
          variables: {
            input: {
              courseId: parts.courseId,
              studentId: parts.studentId,
              notes,
              paymentStatus: toGraphqlPaymentStatus(paymentStatus),
            },
          },
        });
      } finally {
        setSaving(false);
      }
    },
    [parts, updateOrder],
  );

  return { refund, cancel, saveOrder, refunding, cancelling, saving };
}
