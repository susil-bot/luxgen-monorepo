import { useCallback, useState } from 'react';
import { useMutation } from '@apollo/client';
import { useRouter } from 'next/router';

import { ENROLL_STUDENT } from '../graphql/queries/courses';
import { buildLoginRedirect } from './auth-routes';
import { getStoredUser, isStoredSessionExpired } from './session';

interface UseLearnEnrollOptions {
  courseId: string;
  returnPath: string;
}

export function useLearnEnroll({ courseId, returnPath }: UseLearnEnrollOptions) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [enrollStudent, { loading }] = useMutation(ENROLL_STUDENT);

  const enroll = useCallback(async () => {
    setError(null);

    if (isStoredSessionExpired()) {
      void router.push(buildLoginRedirect(returnPath));
      return;
    }

    const user = getStoredUser();
    if (!user?.id) {
      void router.push(buildLoginRedirect(returnPath));
      return;
    }

    try {
      await enrollStudent({
        variables: { courseId, studentId: user.id },
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Enrollment failed');
    }
  }, [courseId, enrollStudent, returnPath, router]);

  return { enroll, loading, error, success };
}
