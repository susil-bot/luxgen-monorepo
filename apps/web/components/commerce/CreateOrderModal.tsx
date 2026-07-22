import { useEffect, useMemo, useState } from 'react';
import { useMutation, useApolloClient } from '@apollo/client';
import { Modal, useSnackbar } from '@luxgen/ui';
import { ENROLL_STUDENT, GET_COURSES } from '../../graphql/queries/courses';
import { GET_ENROLLMENT } from '../../graphql/queries/enrollment';

export interface CreateOrderCourseOption {
  id: string;
  title: string;
  students?: { id: string }[] | null;
}

export interface CreateOrderStudentOption {
  id: string;
  name: string;
  email: string;
}

export interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string;
  courses: CreateOrderCourseOption[];
  students: CreateOrderStudentOption[];
  defaultStudentId?: string;
  onCreated?: (orderId: string) => void;
}

export function CreateOrderModal({
  isOpen,
  onClose,
  tenantId,
  courses,
  students,
  defaultStudentId,
  onCreated,
}: CreateOrderModalProps) {
  const { showSuccess, showError } = useSnackbar();
  const client = useApolloClient();
  const [enrollStudent, { loading }] = useMutation(ENROLL_STUDENT, {
    refetchQueries: [{ query: GET_COURSES, variables: { tenantId } }],
  });
  const [studentId, setStudentId] = useState(defaultStudentId ?? '');
  const [courseId, setCourseId] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStudentId(defaultStudentId ?? students[0]?.id ?? '');
      setCourseId('');
    }
  }, [isOpen, defaultStudentId, students]);

  const availableCourses = useMemo(() => {
    if (!studentId) return courses;
    return courses.filter((course) => !course.students?.some((s) => s.id === studentId));
  }, [courses, studentId]);

  useEffect(() => {
    if (courseId && !availableCourses.some((c) => c.id === courseId)) {
      setCourseId(availableCourses[0]?.id ?? '');
    } else if (!courseId && availableCourses.length > 0) {
      setCourseId(availableCourses[0].id);
    }
  }, [availableCourses, courseId]);

  const handleClose = () => onClose();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !courseId) {
      showError('Select a customer and course.');
      return;
    }

    try {
      await enrollStudent({ variables: { courseId, studentId } });
      const { data: enrollmentData } = await client.query({
        query: GET_ENROLLMENT,
        variables: { courseId, studentId },
        fetchPolicy: 'network-only',
      });
      const orderId = enrollmentData?.enrollment?.id as string | undefined;
      if (!orderId) {
        showError('Order created but enrollment id was not found.');
        return;
      }
      showSuccess('Order created — enrollment added.');
      handleClose();
      onCreated?.(orderId);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to create order.');
    }
  };

  const noStudents = students.length === 0;
  const noCourses = availableCourses.length === 0;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create order" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-secondary">Enrolls a customer in a course (creates an order).</p>

        {noStudents ? (
          <p className="text-sm text-secondary">No customers available. Add a customer first.</p>
        ) : (
          <div className="space-y-1.5">
            <label htmlFor="create-order-customer" className="text-sm font-medium text-secondary block">
              Customer
            </label>
            <select
              id="create-order-customer"
              className="ios-input w-full"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              disabled={Boolean(defaultStudentId)}
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.email})
                </option>
              ))}
            </select>
          </div>
        )}

        {noStudents ? null : noCourses ? (
          <p className="text-sm text-secondary">This customer is already enrolled in all courses.</p>
        ) : (
          <div className="space-y-1.5">
            <label htmlFor="create-order-course" className="text-sm font-medium text-secondary block">
              Course
            </label>
            <select
              id="create-order-course"
              className="ios-input w-full"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
            >
              {availableCourses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="ios-btn-secondary" onClick={handleClose} disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="ios-btn-primary" disabled={loading || noStudents || noCourses}>
            {loading ? 'Creating…' : 'Create order'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
