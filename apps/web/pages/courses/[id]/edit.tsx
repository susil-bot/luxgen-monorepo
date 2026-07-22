import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Head from 'next/head';
import { PageLoadingState } from '../../../components/common/PageStates';
export default function EditCourseRedirect({ tenant }: { tenant: string }) {
  const router = useRouter();
  const courseId = typeof router.query.id === 'string' ? router.query.id : '';
  useEffect(() => {
    if (!courseId) return;
    const qs = tenant && tenant !== 'demo' ? `?tenant=${encodeURIComponent(tenant)}` : '';
    void router.replace(`/products/${courseId}/edit${qs}`);
  }, [courseId, router, tenant]);
  return (
    <>
      <Head>
        <title>Edit course</title>
      </Head>
      <PageLoadingState label="Opening product editor…" />
    </>
  );
}
export const getServerSideProps = async (ctx: { query: { tenant?: string } }) => ({
  props: { tenant: ctx.query.tenant || 'demo' },
});
