import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@apollo/client';
import { useMemo } from 'react';

import { Card, ListRow, Screen } from '@luxgen/native-ui';
import type { Course, Enrollment } from '@luxgen/types';

import { GET_COURSES, GET_ENROLLMENTS } from '../../graphql/queries';
import { useAuth } from '../../hooks/useAuth';

export default function EnrollmentsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const tenantId = user?.tenant.id;
  const userId = user?.id;

  const { data: coursesData } = useQuery(GET_COURSES, {
    skip: !tenantId,
    variables: { tenantId: tenantId ?? '' },
  });

  const { data, loading, error } = useQuery(GET_ENROLLMENTS, {
    skip: !tenantId,
    variables: { tenantId: tenantId ?? '' },
  });

  const courseById = useMemo(() => {
    const map = new Map<string, Course>();
    for (const c of (coursesData?.courses as Course[] | undefined) ?? []) {
      map.set(c.id, c);
    }
    return map;
  }, [coursesData]);

  const myEnrollments = ((data?.enrollments as Enrollment[] | undefined) ?? []).filter(
    (e) => (e.studentId ?? e.userId) === userId,
  );

  return (
    <Screen title="My learning" subtitle="Courses you are enrolled in">
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : error ? (
        <Text style={styles.error}>{error.message}</Text>
      ) : myEnrollments.length === 0 ? (
        <Text style={styles.empty}>No enrollments yet. Browse courses to get started.</Text>
      ) : (
        <Card>
          {myEnrollments.map((enrollment, index) => {
            const course = courseById.get(enrollment.courseId);
            const title = course?.title ?? `Course ${enrollment.courseId.slice(-6)}`;
            const subtitle = [enrollment.paymentStatus, enrollment.enrolledAt?.slice(0, 10)]
              .filter(Boolean)
              .join(' · ');
            return (
              <ListRow
                key={enrollment.id}
                title={title}
                subtitle={subtitle || undefined}
                showSeparator={index < myEnrollments.length - 1}
                onPress={() => router.push(`/courses/${enrollment.courseId}`)}
              />
            );
          })}
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  error: {
    color: '#ff3b30',
    fontSize: 15,
  },
  empty: {
    color: 'rgba(60, 60, 67, 0.6)',
    fontSize: 15,
  },
});
