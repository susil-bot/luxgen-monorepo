import { useCallback, useState } from 'react';
import { useMutation } from '@apollo/client';
import { useRouter } from 'next/router';

import { MARK_COURSE_COMPLETE, UPDATE_ENROLLMENT_PROGRESS } from '../graphql/queries/enrollment';
import { buildLoginRedirect } from './auth-routes';
import { getStoredUser, isStoredSessionExpired } from './session';

interface UseLearnProgressOptions {
  courseId: string;
  returnPath: string;
  onUpdated?: () => void;
}

export function useLearnProgress({ courseId, returnPath, onUpdated }: UseLearnProgressOptions) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const [markCompleteMutation, { loading: completing }] = useMutation(MARK_COURSE_COMPLETE);
  const [updateProgressMutation, { loading: updating }] = useMutation(UPDATE_ENROLLMENT_PROGRESS);

  const requireAuth = useCallback((): string | null => {
    if (isStoredSessionExpired()) {
      void router.push(buildLoginRedirect(returnPath));
      return null;
    }
    const user = getStoredUser();
    if (!user?.id) {
      void router.push(buildLoginRedirect(returnPath));
      return null;
    }
    return user.id;
  }, [returnPath, router]);

  const markComplete = useCallback(async () => {
    setError(null);
    if (!requireAuth()) return;

    try {
      await markCompleteMutation({ variables: { courseId } });
      onUpdated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not mark course complete');
    }
  }, [courseId, markCompleteMutation, onUpdated, requireAuth]);

  const bumpProgress = useCallback(
    async (currentPercent: number, step = 25) => {
      setError(null);
      const studentId = requireAuth();
      if (!studentId) return;

      const next = Math.min(100, currentPercent + step);
      try {
        await updateProgressMutation({
          variables: {
            input: { courseId, studentId, progressPercent: next },
          },
        });
        onUpdated?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not update progress');
      }
    },
    [courseId, onUpdated, requireAuth, updateProgressMutation],
  );

  return {
    markComplete,
    bumpProgress,
    completing,
    updating,
    error,
    clearError: () => setError(null),
  };
}
