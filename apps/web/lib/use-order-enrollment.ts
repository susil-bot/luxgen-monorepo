import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import type { OrderDetail, OrderPaymentStatus } from '@luxgen/ui';
import { parseLegacyOrderId } from '@luxgen/ui';
import { GET_ACTIVITY_EVENTS } from '../graphql/queries/activity-events';
import { isMongoObjectId } from './mongo-id';
import { GET_ENROLLMENT, UPDATE_ORDER_NOTES } from '../graphql/queries/enrollment';

export function mapEnrollmentPaymentStatus(status: string): OrderPaymentStatus {
  switch (status) {
    case 'PAID':
      return 'paid';
    case 'REFUNDED':
      return 'refunded';
    case 'VOIDED':
      return 'voided';
    default:
      return 'pending';
  }
}

/** Resolve course + student from order row (standard or legacy URL id). */
export function resolveOrderPair(order: OrderDetail | null | undefined): {
  courseId: string;
  studentId: string;
  subjectId: string;
} | null {
  if (!order) return null;
  if (order.courseId && order.studentId) {
    return {
      courseId: order.courseId,
      studentId: order.studentId,
      subjectId: order.subjectId ?? `${order.courseId}:${order.studentId}`,
    };
  }
  const legacy = parseLegacyOrderId(order.id);
  if (legacy) {
    return { ...legacy, subjectId: order.id };
  }
  return null;
}

export function useOrderEnrollment(order: OrderDetail | null | undefined, tenantId: string | undefined) {
  const parts = resolveOrderPair(order);
  const timelineSubjectId = order?.subjectId ?? parts?.subjectId ?? order?.id ?? '';

  const { data, refetch } = useQuery(GET_ENROLLMENT, {
    variables: { courseId: parts?.courseId, studentId: parts?.studentId },
    skip: !parts?.courseId || !parts?.studentId,
    fetchPolicy: 'cache-and-network',
  });

  const [updateNotes] = useMutation(UPDATE_ORDER_NOTES, {
    refetchQueries: parts
      ? [
          { query: GET_ENROLLMENT, variables: { courseId: parts.courseId, studentId: parts.studentId } },
          ...(isMongoObjectId(tenantId) && timelineSubjectId
            ? [
                {
                  query: GET_ACTIVITY_EVENTS,
                  variables: {
                    tenantId,
                    subjectType: 'ORDER',
                    subjectId: timelineSubjectId,
                    first: 50,
                  },
                },
              ]
            : []),
        ]
      : [],
  });

  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (data?.enrollment && !initializedRef.current) {
      setNotes(data.enrollment.notes ?? '');
      initializedRef.current = true;
    }
  }, [data?.enrollment]);

  useEffect(() => {
    initializedRef.current = false;
    setNotes('');
  }, [order?.id]);

  const persistNotes = useCallback(
    async (value: string) => {
      if (!parts) return;
      setSaving(true);
      try {
        await updateNotes({
          variables: {
            input: {
              courseId: parts.courseId,
              studentId: parts.studentId,
              notes: value,
            },
          },
        });
        await refetch();
      } finally {
        setSaving(false);
      }
    },
    [parts, refetch, updateNotes],
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

  const orderWithEnrollment = useMemo(() => {
    if (!order) return null;
    const enrollment = data?.enrollment;
    if (!enrollment) return order;
    return {
      ...order,
      id: enrollment.id,
      notes: enrollment.notes ?? order.notes,
      paymentStatus: mapEnrollmentPaymentStatus(enrollment.paymentStatus),
    };
  }, [order, data?.enrollment]);

  return {
    order: orderWithEnrollment,
    notes,
    onNotesChange,
    savingNotes: saving,
    refetchEnrollment: refetch,
    timelineSubjectId,
  };
}
