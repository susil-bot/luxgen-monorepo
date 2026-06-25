import Head from 'next/head';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { LearnLayout } from '../../../components/learn/LearnLayout';
import { PageEmptyState, PageLoadingState } from '../../../components/common/PageStates';
import { GET_LEARNER_CERTIFICATES } from '../../../graphql/queries/certificates';
import { getStoredUser } from '../../../lib/session';
import { learnStoreServerProps } from '../../../lib/learn-store';

export default function LearnCertificatesPage({ tenantSubdomain }: { tenantSubdomain: string }) {
  const user = typeof window !== 'undefined' ? getStoredUser() : null;
  const { data, loading, error, refetch } = useQuery(GET_LEARNER_CERTIFICATES, {
    variables: { studentId: user?.id },
    skip: !user?.id,
  });
  const certs = data?.learnerCertificates ?? [];
  return (
    <>
      <Head>
        <title>My Certificates</title>
      </Head>
      <LearnLayout tenantSubdomain={tenantSubdomain}>
        <Link href="/dashboard" className="ios-btn-plain text-sm mb-4 inline-flex">
          ← Dashboard
        </Link>
        <h1 className="ios-large-title mb-4">My Certificates</h1>
        {loading && <PageLoadingState label="Loading certificates…" fullScreen={false} />}
        {error && (
          <PageEmptyState icon="🏅" title="Could not load certificates" subtitle={error.message}
            action={<button type="button" className="ios-btn-primary mt-4" onClick={() => void refetch()}>Retry</button>} />
        )}
        {!loading && !error && !certs.length && (
          <PageEmptyState icon="🏅" title="No certificates yet" subtitle="Complete courses to earn certificates."
            action={<button type="button" className="ios-btn-secondary mt-4" onClick={() => void refetch()}>Refresh</button>} />
        )}
        <ul className="space-y-3">
          {certs.map((c: { id: string; courseTitle: string; verificationCode: string }) => (
            <li key={c.id} className="ios-card p-4">
              <div className="font-semibold">{c.courseTitle}</div>
              <div className="text-xs text-secondary mt-1">Code: {c.verificationCode}</div>
            </li>
          ))}
        </ul>
      </LearnLayout>
    </>
  );
}
export const getServerSideProps = learnStoreServerProps;
