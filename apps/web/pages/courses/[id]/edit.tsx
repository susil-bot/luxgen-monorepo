import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { PageLoadingState } from '../../../components/common/PageStates';

interface Props {
  tenant: string;
}

/** Courses are products in LuxGen — redirect to Shopify-style product editor */
export default function EditCourseRedirect({ tenant: _tenant }: Props) {
  const router = useRouter();
  const { id } = router.query;
  const courseId = typeof id === 'string' ? id : '';

  useEffect(() => {
    if (courseId) {
      void router.replace(`/products/${courseId}/edit`);
    }
  }, [courseId, router]);

  return <PageLoadingState label="Opening product editor…" />;
}

export const getServerSideProps = async (context: { query: { tenant?: string } }) => {
  return {
    props: {
      tenant: context.query.tenant || 'demo',
    },
  };
};
