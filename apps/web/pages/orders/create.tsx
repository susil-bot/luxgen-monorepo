import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useApolloClient, useMutation, useQuery } from '@apollo/client';
import { AppLayout, OrderCreateForm, SnackbarProvider, useSnackbar } from '@luxgen/ui';
import { ENROLL_STUDENT, GET_COURSES } from '../../graphql/queries/courses';
import { GET_USERS } from '../../graphql/queries/users';
import { GET_ENROLLMENT } from '../../graphql/queries/enrollment';
import { getTenantPageProps } from '../../lib/tenant-page-props';
import { useCommercePageShell } from '../../lib/commerce-page-shell';
import { useTenantScope } from '../../lib/use-tenant-scope';
import { isLearnerRole } from '../../lib/user-roles';

interface Props {
  tenant: string;
}

function CreateOrderContent({ tenant }: Props) {
  const router = useRouter();
  const client = useApolloClient();
  const { appLayoutProps } = useCommercePageShell();
  const { showSuccess, showError } = useSnackbar();
  const { queryTenantId } = useTenantScope(tenant);

  const lockStudentId = typeof router.query.customerId === 'string' ? router.query.customerId : undefined;

  const [studentId, setStudentId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [saving, setSaving] = useState(false);

  const { data: coursesData } = useQuery(GET_COURSES, {
    variables: { tenantId: queryTenantId },
    skip: !queryTenantId,
    fetchPolicy: 'cache-and-network',
  });

  const { data: usersData } = useQuery(GET_USERS, {
    variables: { tenantId: queryTenantId },
    skip: !queryTenantId,
    fetchPolicy: 'cache-and-network',
  });

  const students = useMemo(
    () =>
      (usersData?.users ?? [])
        .filter((u: { role: string }) => isLearnerRole(u.role))
        .map((u: { id: string; email: string; firstName?: string; lastName?: string }) => ({
          id: u.id,
          email: u.email,
          name: `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email,
        })),
    [usersData],
  );

  const courses = useMemo((): { id: string; title: string }[] => {
    const all = coursesData?.courses ?? [];
    if (!studentId) return all.map((c: { id: string; title: string }) => ({ id: c.id, title: c.title }));
    return all
      .filter((c: { students?: { id: string }[] | null }) => !c.students?.some((s) => s.id === studentId))
      .map((c: { id: string; title: string }) => ({ id: c.id, title: c.title }));
  }, [coursesData, studentId]);

  useEffect(() => {
    const preferred = lockStudentId ?? students[0]?.id ?? '';
    setStudentId(preferred);
  }, [lockStudentId, students]);

  useEffect(() => {
    if (courseId && !courses.some((c) => c.id === courseId)) {
      setCourseId(courses[0]?.id ?? '');
    } else if (!courseId && courses.length > 0) {
      setCourseId(courses[0].id);
    }
  }, [courses, courseId]);

  const [enrollStudent] = useMutation(ENROLL_STUDENT, {
    refetchQueries: [{ query: GET_COURSES, variables: { tenantId: queryTenantId } }],
  });

  const handleSave = async () => {
    if (!studentId || !courseId) {
      showError('Select a customer and course.');
      return;
    }

    setSaving(true);
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
      showSuccess('Order created');
      void router.push(`/orders/${orderId}`);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to create order.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Head>
        <title>Create order — {tenant}</title>
      </Head>

      <AppLayout {...appLayoutProps}>
        <OrderCreateForm
          students={students}
          courses={courses}
          studentId={studentId}
          courseId={courseId}
          saving={saving}
          lockStudent={Boolean(lockStudentId)}
          onStudentChange={setStudentId}
          onCourseChange={setCourseId}
          onSave={() => void handleSave()}
        />
      </AppLayout>
    </>
  );
}

export default function CreateOrderPage(props: Props) {
  return (
    <SnackbarProvider position="top-right" maxSnackbars={3}>
      <CreateOrderContent {...props} />
    </SnackbarProvider>
  );
}

export const getServerSideProps = getTenantPageProps;
