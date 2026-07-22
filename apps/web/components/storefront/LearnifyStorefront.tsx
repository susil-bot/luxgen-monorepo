import Link from 'next/link';
import { useEffect, useState } from 'react';

import { PageLoadingState } from '../common/PageStates';
import { OptimizedImage } from '../media/OptimizedImage';
import { resolveNavHref, storefrontThemeCssVars } from '../../lib/storefront-profile';
import { applyLearnTenantTheme } from '../../lib/learn-theme';
import { useStorefrontCatalog } from '../../hooks/useStorefrontCatalog';
import { useClientMounted } from '../../lib/use-client-mounted';
import styles from './LearnifyStorefront.module.css';

interface LearnifyStorefrontProps {
  tenantSubdomain: string;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function LearnifyStorefront({ tenantSubdomain }: LearnifyStorefrontProps) {
  const mounted = useClientMounted();
  const { tenant, tenantName, profile, catalog, loading } = useStorefrontCatalog(tenantSubdomain);
  const [searchQuery, setSearchQuery] = useState('');

  const { content, theme, branding, routes } = profile;
  const themeVars = storefrontThemeCssVars(theme, branding);

  useEffect(() => {
    if (tenant?.settings) {
      applyLearnTenantTheme(tenant.settings, tenant.id as string | undefined);
    }
  }, [tenant?.settings, tenant?.id]);

  if (!mounted || loading) {
    return <PageLoadingState label="Loading storefront…" />;
  }

  const filteredFeatured = searchQuery.trim()
    ? catalog.featured.filter(
        (c) =>
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.category.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : catalog.featured;

  const stats = [
    { label: content.stats.programs, value: catalog.stats.courses },
    { label: content.stats.learners, value: catalog.stats.students },
    { label: content.stats.trainers, value: catalog.stats.instructors },
    { label: content.stats.community, value: catalog.stats.satisfactionLabel },
  ];

  const instructors = catalog.instructors.slice(0, 6);
  const categories = catalog.categories.slice(0, 6);

  return (
    <div className={styles.page} style={themeVars as React.CSSProperties} id="top">
      <header className={styles.header}>
        <div className={`${styles.container} ${styles.headerInner}`}>
          <Link href={routes.landing} className={styles.logo}>
            {branding.logoUrl ? (
              <OptimizedImage
                src={branding.logoUrl}
                alt={branding.logoAlt ?? tenantName}
                width={140}
                height={40}
                className={styles.logoImage}
              />
            ) : (
              tenantName
            )}
          </Link>

          <nav className={styles.nav} aria-label="Primary">
            {content.nav.map((link) => (
              <Link
                key={`${link.label}-${link.href}`}
                href={resolveNavHref(link.href, routes)}
                className={styles.navLink}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className={styles.headerActions}>
            <Link href={routes.login} className={styles.btnGhost}>
              Log in
            </Link>
            <Link href={routes.register} className={styles.btnPrimary}>
              Sign up
            </Link>
          </div>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={`${styles.container} ${styles.heroGrid}`}>
          <div>
            <span className={styles.heroBadge}>{content.hero.ratingBadge}</span>
            <h1 className={styles.heroTitle}>{content.hero.headline}</h1>
            <p className={styles.heroLead}>{content.hero.subheadline}</p>
            <div className={styles.heroActions}>
              <Link href={routes.courses} className={styles.btnPrimary}>
                Browse courses
              </Link>
              <Link href={routes.programs} className={styles.btnOutline}>
                View programs
              </Link>
            </div>
            <div className={styles.heroPerks}>
              <span>✓ Expert mentors</span>
              <span>✓ Cohort programs</span>
              <span>✓ Self-paced courses</span>
            </div>
          </div>

          <form
            className={styles.searchBar}
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <input
              type="search"
              className={styles.searchInput}
              placeholder={content.hero.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search courses"
            />
            <button type="submit" className={styles.searchBtn}>
              Search
            </button>
          </form>
        </div>
      </section>

      <section className={styles.stats}>
        <div className={`${styles.container} ${styles.statsGrid}`}>
          {stats.map((stat) => (
            <div key={stat.label}>
              <div className={styles.statValue}>
                {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              </div>
              <div className={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {categories.length > 0 && (
        <section className={styles.section} id="about">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div>
                <h2 className={styles.sectionTitle}>{content.sections.categories}</h2>
              </div>
              <Link href={routes.courses} className={styles.viewAll}>
                View all →
              </Link>
            </div>
            <div className={styles.categoryGrid}>
              {categories.map((cat) => (
                <Link key={cat.id} href={cat.href} className={styles.categoryCard}>
                  <span className={styles.categoryName}>{cat.label}</span>
                  <span className={styles.categoryCount}>{cat.courseCount} courses</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <div>
              <h2 className={styles.sectionTitle}>{content.sections.programs}</h2>
              <p className={styles.sectionSub}>Courses, products, and bundles from our trainers</p>
            </div>
            <Link href={routes.programs} className={styles.viewAll}>
              View all →
            </Link>
          </div>

          {filteredFeatured.length === 0 ? (
            <div className={styles.courseCard}>
              <div className={styles.courseBody}>
                <h3 className={styles.courseTitle}>{content.hero.emptyCardTitle}</h3>
                <p className={styles.courseMeta}>{content.hero.emptyCardMeta}</p>
                <Link href={routes.register} className={styles.btnPrimary}>
                  Become a trainer
                </Link>
              </div>
            </div>
          ) : (
            <div className={styles.courseGrid}>
              {filteredFeatured.slice(0, 8).map((course) => (
                <Link key={`${course.kind}-${course.id}`} href={course.href} className={styles.courseCard}>
                  <div className={styles.courseThumb}>
                    <span className={`${styles.badge} ${course.isFree ? styles.badgeFree : ''}`}>
                      {course.isFree ? 'Free' : course.category}
                    </span>
                  </div>
                  <div className={styles.courseBody}>
                    <h3 className={styles.courseTitle}>{course.title}</h3>
                    {course.instructorName && <p className={styles.courseMeta}>{course.instructorName}</p>}
                    <div className={styles.courseFooter}>
                      <span className={styles.stars}>
                        ★ {course.rating.toFixed(1)} ({course.reviewCount})
                      </span>
                      <span className={styles.price}>{course.priceLabel}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className={styles.section} id="mentors">
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <div>
              <h2 className={styles.sectionTitle}>{content.sections.mentors}</h2>
            </div>
          </div>

          {instructors.length === 0 ? (
            <p className={styles.sectionSub}>{content.sections.mentorsEmpty}</p>
          ) : (
            <div className={styles.instructorGrid}>
              {instructors.map((instructor) => (
                <Link
                  key={instructor.id}
                  href={`/store/mentors/${encodeURIComponent(instructor.id)}`}
                  className={styles.instructorCard}
                >
                  <div className={styles.avatar}>{initials(instructor.name)}</div>
                  <p className={styles.instructorName}>{instructor.name}</p>
                  <p className={styles.instructorRole}>
                    {instructor.role} · {instructor.courseCount} courses
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {content.testimonials.length > 0 && (
        <section className={`${styles.section} ${styles.sectionAlt}`}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>{content.sections.testimonials}</h2>
            <div className={styles.courseGrid}>
              {content.testimonials.map((t) => (
                <blockquote key={t.id} className={styles.courseCard}>
                  <div className={styles.courseBody}>
                    <p className={styles.courseMeta}>&ldquo;{t.quote}&rdquo;</p>
                    <p className={styles.courseTitle}>{t.name}</p>
                    <p className={styles.courseMeta}>{t.role}</p>
                  </div>
                </blockquote>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className={styles.container}>
        <div className={styles.cta} id="contact">
          <h2 className={styles.ctaTitle}>{content.cta.title}</h2>
          <p className={styles.ctaLead}>{content.cta.lead}</p>
          <Link href={routes.register} className={styles.btnPrimary}>
            {content.cta.buttonLabel}
          </Link>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerGrid}>
            <div>
              <p className={styles.footerTitle}>{tenantName}</p>
              <p>{content.footer.tagline}</p>
              <a href={`mailto:${content.footer.contactEmail}`} className={styles.footerLink}>
                {content.footer.contactEmail}
              </a>
            </div>
            <div>
              <p className={styles.footerTitle}>{content.footer.exploreTitle}</p>
              <Link href={routes.courses} className={styles.footerLink}>
                Courses
              </Link>
              <Link href={routes.programs} className={styles.footerLink}>
                Programs
              </Link>
              <Link href={routes.register} className={styles.footerLink}>
                Become a trainer
              </Link>
            </div>
            <div>
              <p className={styles.footerTitle}>{content.footer.categoriesTitle}</p>
              {categories.slice(0, 4).map((cat) => (
                <Link key={cat.id} href={cat.href} className={styles.footerLink}>
                  {cat.label}
                </Link>
              ))}
            </div>
            <div>
              <p className={styles.footerTitle}>{content.footer.newsletterTitle}</p>
              <p className={styles.footerLink}>{content.footer.newsletterHint}</p>
            </div>
          </div>
          <div className={styles.footerBottom}>
            © {new Date().getFullYear()} {tenantName}. Powered by LuxGen.
          </div>
        </div>
      </footer>
    </div>
  );
}
