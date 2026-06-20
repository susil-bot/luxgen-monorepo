import { useCallback, useState } from 'react';
import { useMutation } from '@apollo/client';

import { ENROLL_STUDENT, GET_ENROLLMENT } from '../graphql/queries';
import { useAuth } from './useAuth';

export function useCourseEnroll(courseId: string) {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [enrollStudent, { loading }] = useMutation(ENROLL_STUDENT, {
    refetchQueries: user?.id ? [{ query: GET_ENROLLMENT, variables: { courseId, studentId: user.id } }] : [],
  });

  const enroll = useCallback(async () => {
    if (!user?.id) {
      setError('Sign in to enroll');
      return;
    }
    setError(null);
    try {
      await enrollStudent({
        variables: { courseId, studentId: user.id },
      });
      setSuccess(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Enrollment failed';
      setError(message);
      throw err;
    }
  }, [courseId, enrollStudent, user?.id]);

  return { enroll, loading, error, success, userId: user?.id };
}
