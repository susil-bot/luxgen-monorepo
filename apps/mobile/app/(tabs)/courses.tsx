import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@apollo/client';

import { Card, ListRow, Screen } from '@luxgen/native-ui';
import type { Course } from '@luxgen/types';
import { CourseStatus } from '@luxgen/types';

import { GET_COURSES } from '../../graphql/queries';
import { useAuth } from '../../hooks/useAuth';

export default function CoursesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const tenantId = user?.tenant.id;

  const { data, loading, error } = useQuery(GET_COURSES, {
    skip: !tenantId,
    variables: { tenantId: tenantId ?? '' },
  });

  const courses = ((data?.courses as Course[] | undefined) ?? []).filter((c) => c.status === CourseStatus.PUBLISHED);

  return (
    <Screen title="Courses" subtitle="Browse training available on your tenant">
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : error ? (
        <Text style={styles.error}>{error.message || 'Could not load courses. Is the API running?'}</Text>
      ) : courses.length === 0 ? (
        <Text style={styles.empty}>No courses published yet.</Text>
      ) : (
        <Card>
          {courses.map((course, index) => (
            <ListRow
              key={course.id}
              title={course.title}
              subtitle={course.instructor ? `${course.instructor.firstName} ${course.instructor.lastName}` : undefined}
              showSeparator={index < courses.length - 1}
              onPress={() => router.push(`/courses/${course.id}`)}
            />
          ))}
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
