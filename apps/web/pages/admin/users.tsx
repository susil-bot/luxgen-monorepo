import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { PageLoadingState } from '../../components/common/PageStates';

/**
 * App-level users live at /organization/users (User Management).
 * Points there directly rather than via /users — that page is itself just a
 * `@deprecated` redirect to /organization/users, so routing through it here
 * cost every visitor an extra server round trip for no reason.
 */
export default function AdminUsersRedirect() {
  const router = useRouter();

  useEffect(() => {
    void router.replace('/organization/users');
  }, [router]);

  return <PageLoadingState label="Opening user management…" />;
}

export const getServerSideProps = async (context: { query: { tenant?: string } }) => ({
  props: { tenant: context.query.tenant || 'demo' },
});
