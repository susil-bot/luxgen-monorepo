import { useEffect } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@apollo/client';

import { Button, Card, Screen } from '@luxgen/native-ui';
import type { Course } from '@luxgen/types';
import { CourseStatus } from '@luxgen/types';

import { GET_COURSE, GET_ENROLLMENT } from '../../graphql/queries';
import { useCourseEnroll } from '../../hooks/useCourseEnroll';

export default function CourseDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const courseId = id ?? '';

  const { data, loading, error } = useQuery(GET_COURSE, {
    skip: !courseId,
    variables: { id: courseId },
  });

  const course = data?.course as Course | undefined;
  const { enroll, loading: enrolling, error: enrollError, success, userId } = useCourseEnroll(courseId);

  const { data: enrollmentData, refetch: refetchEnrollment } = useQuery(GET_ENROLLMENT, {
    skip: !courseId || !userId,
    variables: { courseId, studentId: userId ?? '' },
  });

  const isEnrolled = Boolean(enrollmentData?.enrollment?.id) || success;

  useEffect(() => {
    if (success) void refetchEnrollment();
  }, [success, refetchEnrollment]);

  const instructor = course?.instructor ? `${course.instructor.firstName} ${course.instructor.lastName}`.trim() : null;

  const canEnroll = course?.status === CourseStatus.PUBLISHED;

  const onEnroll = async () => {
    try {
      await enroll();
      Alert.alert('Enrolled', 'You are now enrolled in this course.');
    } catch {
      // error shown inline
    }
  };

  return (
    <Screen title={course?.title ?? 'Course'} subtitle={instructor ? `With ${instructor}` : undefined} scroll>
      <Button title="← Back" variant="plain" onPress={() => router.back()} style={styles.back} />

      {loading && <Text style={styles.muted}>Loading…</Text>}
      {error && <Text style={styles.error}>{error.message}</Text>}

      {course?.description ? (
        <Card style={styles.section}>
          <View style={styles.cardBody}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.body}>{course.description}</Text>
          </View>
        </Card>
      ) : null}

      <Card style={styles.section}>
        <View style={styles.cardBody}>
          <Text style={styles.sectionTitle}>{isEnrolled ? 'Enrolled' : 'Enroll'}</Text>
          <Text style={styles.body}>
            {isEnrolled
              ? 'You have access to this course. View all enrollments in the Learning tab.'
              : canEnroll
                ? 'Tap below to join this course on your tenant.'
                : 'This course is not open for enrollment.'}
          </Text>
          {!isEnrolled && canEnroll ? (
            <Button
              title={enrolling ? 'Enrolling…' : 'Enroll now'}
              loading={enrolling}
              onPress={() => void onEnroll()}
            />
          ) : null}
          {isEnrolled ? (
            <Button title="View my learning" variant="secondary" onPress={() => router.push('/(tabs)/enrollments')} />
          ) : null}
          {enrollError ? <Text style={styles.error}>{enrollError}</Text> : null}
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: {
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  section: {
    marginTop: 4,
  },
  cardBody: {
    padding: 16,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  body: {
    fontSize: 15,
    color: 'rgba(60, 60, 67, 0.6)',
    lineHeight: 22,
  },
  muted: {
    color: 'rgba(60, 60, 67, 0.6)',
  },
  error: {
    color: '#ff3b30',
    fontSize: 14,
  },
});
