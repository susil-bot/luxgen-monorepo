import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { AppLayout } from '@luxgen/ui';
import { useAppShellConfig } from '../../lib/app-shell-config';
import { useLayoutUser } from '../../lib/app-layout-user';
import { PageHead } from '../../components/seo/PageHead';
import { PageEmptyState } from '../../components/common/PageStates';
import { GET_COURSES } from '../../graphql/queries/courses';
import { GET_USERS } from '../../graphql/queries/users';
import { useAppTenantId } from '../../lib/app-layout-user';

export default function SearchPage() {
  const router = useRouter();
  const q = typeof router.query.q === 'string' ? router.query.q.trim() : '';
  const tenant = typeof router.query.tenant === 'string' ? router.query.tenant : 'demo';
  const layoutUser = useLayoutUser();
  const { sidebarSections, logo } = useAppShellConfig();
  const tenantId = useAppTenantId();

  const { data: coursesData, loading: coursesLoading } = useQuery(GET_COURSES, {
    variables: { tenantId: tenantId ?? '' },
    skip: !q || !tenantId,
  });
  const { data: usersData, loading: usersLoading } = useQuery(GET_USERS, {
    variables: { tenantId: tenantId ?? '' },
    skip: !q || !tenantId,
  });

  const needle = q.toLowerCase();
  const courseHits =
    coursesData?.courses?.filter(
      (c: { title?: string }) => c.title?.toLowerCase().includes(needle),
    ) ?? [];
  const userHits =
    usersData?.users?.filter(
      (u: { email?: string; firstName?: string; lastName?: string }) =>
        u.email?.toLowerCase().includes(needle) ||
        `${u.firstName ?? ''} ${u.lastName ?? ''}`.toLowerCase().includes(needle),
    ) ?? [];

  const loading = coursesLoading || usersLoading;

  return (
    <>
      <PageHead title={q ? `Search: ${q}` : 'Search'} robots="noindex" />
      <AppLayout sidebarSections={sidebarSections} user={layoutUser ?? undefined} logo={logo} responsive>
        <div className="max-w-3xl mx-auto px-4 py-8">
          <h1 className="ios-large-title mb-2">Search</h1>
          {!q ? (
            <PageEmptyState title="Enter a search term" subtitle="Use the nav search bar to find courses and users." />
          ) : loading ? (
            <p className="text-secondary text-sm">Searching…</p>
          ) : (
            <div className="space-y-6">
              <section>
                <h2 className="font-semibold mb-2">Courses ({courseHits.length})</h2>
                <ul className="space-y-2">
                  {courseHits.map((c: { id: string; title: string }) => (
                    <li key={c.id}>
                      <a href={`/courses/${c.id}?tenant=${tenant}`} className="text-blue hover:underline">
                        {c.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
              <section>
                <h2 className="font-semibold mb-2">Users ({userHits.length})</h2>
                <ul className="space-y-2">
                  {userHits.map((u: { id: string; email: string }) => (
                    <li key={u.id}>
                      <span className="text-primary">{u.email}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          )}
        </div>
      </AppLayout>
    </>
  );
}
