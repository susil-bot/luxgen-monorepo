import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useMemo } from 'react';
import { useQuery } from '@apollo/client';

import { PageLoadingState } from '../../../components/common/PageStates';
import { useStorefrontCatalog } from '../../../hooks/useStorefrontCatalog';
import { GET_TENANT } from '../../../graphql/queries/tenants';
import { learnStoreServerProps } from '../../../lib/learn-store';
import { resolveStorefrontSettings } from '../../../lib/storefront-settings';
import { useClientMounted } from '../../../lib/use-client-mounted';
import styles from '../../../components/storefront/LearnifyStorefront.module.css';

interface MentorProfilePageProps {
  tenantSubdomain: string;
  mentorId: string;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export default function MentorProfilePage({ tenantSubdomain, mentorId }: MentorProfilePageProps) {
  const mounted = useClientMounted();
  const { data: tenantData, loading: tenantLoading } = useQuery(GET_TENANT, {
    variables: { subdomain: tenantSubdomain },
  });

  const tenant = tenantData?.tenantBySubdomain;
  const tenantName = (tenant?.name as string | undefined) ?? tenantSubdomain;
  const storefront = useMemo(
    () => resolveStorefrontSettings(tenantSubdomain, tenant?.settings),
    [tenantSubdomain, tenant?.settings],
  );

  const { catalog, loading: catalogLoading } = useStorefrontCatalog(tenantSubdomain);

  const mentor = catalog.instructors.find((i) => i.id === mentorId);
  const mentorCourses = catalog.all.filter((c) => c.instructorName?.toLowerCase() === mentor?.name.toLowerCase());

  if (!mounted || tenantLoading || catalogLoading) {
    return <PageLoadingState label="Loading mentor…" />;
  }

  if (!mentor) {
    return (
      <div className={styles.page}>
        <div className={styles.container} style={{ padding: '4rem 1rem', textAlign: 'center' }}>
          <h1 className={styles.sectionTitle}>Mentor not found</h1>
          <Link href={storefront.routes.mentors ?? '/store/mentors'} className={styles.btnPrimary}>
            Back to mentors
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>
          {mentor.name} — {tenantName}
        </title>
        <meta name="description" content={`Courses and mentorship from ${mentor.name} on ${tenantName}.`} />
      </Head>
      <div className={styles.page}>
        <header className={styles.header}>
          <div className={`${styles.container} ${styles.headerInner}`}>
            <Link href={storefront.routes.mentors ?? '/store/mentors'} className={styles.navLink}>
              ← Mentors
            </Link>
          </div>
        </header>

        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.heroGrid} style={{ gridTemplateColumns: 'auto 1fr', gap: '1.5rem' }}>
              <div className={styles.avatar} style={{ width: 96, height: 96, fontSize: '2rem' }}>
                {initials(mentor.name)}
              </div>
              <div>
                <h1 className={styles.heroTitle} style={{ marginBottom: '0.5rem' }}>
                  {mentor.name}
                </h1>
                <p className={styles.heroLead}>
                  {mentor.role} · {mentor.courseCount} course{mentor.courseCount === 1 ? '' : 's'}
                </p>
                <p className={styles.sectionSub} style={{ marginTop: '1rem' }}>
                  Expert trainer on {tenantName}. Browse courses below or reach out to start a mentorship conversation.
                </p>
                <div className={styles.heroActions} style={{ marginTop: '1.25rem' }}>
                  <Link href={storefront.routes.contact ?? '/contact'} className={styles.btnPrimary}>
                    Contact
                  </Link>
                  <Link href={storefront.routes.courses} className={styles.btnOutline}>
                    All courses
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.sectionAlt}`}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>Courses by {mentor.name}</h2>
            {mentorCourses.length === 0 ? (
              <p className={styles.sectionSub}>No published courses yet.</p>
            ) : (
              <div className={styles.courseGrid}>
                {mentorCourses.map((course) => (
                  <Link key={course.id} href={course.href} className={styles.courseCard}>
                    <div className={styles.courseBody}>
                      <h3 className={styles.courseTitle}>{course.title}</h3>
                      <p className={styles.courseMeta}>{course.category}</p>
                      <div className={styles.courseFooter}>
                        <span className={styles.stars}>★ {course.rating.toFixed(1)}</span>
                        <span className={styles.price}>{course.priceLabel}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<MentorProfilePageProps> = async (context) => {
  const { props } = learnStoreServerProps(context);
  const mentorId = context.params?.id;
  if (!mentorId || Array.isArray(mentorId)) {
    return { notFound: true };
  }
  return {
    props: {
      ...(props as { tenantSubdomain: string }),
      mentorId,
    },
  };
};
