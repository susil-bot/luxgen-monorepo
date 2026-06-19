import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { PageLoadingState } from '../../components/common/PageStates';

/** App-level users live at /users (User Management) */
export default function AdminUsersRedirect() {
  const router = useRouter();

  useEffect(() => {
    void router.replace('/users');
  }, [router]);

  return <PageLoadingState label="Opening user management…" />;
}

export const getServerSideProps = async (context: { query: { tenant?: string } }) => ({
  props: { tenant: context.query.tenant || 'demo' },
});
