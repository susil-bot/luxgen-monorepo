import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';

import { PageLoadingState } from '../common/PageStates';
import { GET_COURSES } from '../../graphql/queries/courses';
import { GET_STOREFRONT_PRODUCTS } from '../../graphql/queries/storefront';
import { GET_TENANT } from '../../graphql/queries/tenants';
import { applyLearnTenantTheme } from '../../lib/learn-theme';
import { filterPublishedCourses, formatInstructorName, type LearnCourse } from '../../lib/learn-store';
import {
  buildStorefrontStats,
  type StorefrontCourseCard,
  type StorefrontInstructor,
} from '../../lib/storefront-landing-data';
import { formatStorefrontPrice } from '../../lib/storefront-format';
import { resolveNavHref, resolveStorefrontProfile, storefrontThemeCssVars } from '../../lib/storefront-profile';
import { resolveStorefrontSettings } from '../../lib/storefront-settings';
import { useClientMounted } from '../../lib/use-client-mounted';
import { useTheme } from '../../lib/theme';
import styles from './StorefrontLanding.module.css';

interface StorefrontLandingProps {
  tenantSubdomain: string;
}

interface StorefrontProduct {
  id: string;
  title: string;
  description?: string;
  category?: string;
  priceCents: number;
  currency: string;
  instructorName?: string;
  enrollmentCount?: number;
}

const VISIBLE_COURSES = 4;

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function pseudoRating(seed: string): { rating: number; reviews: number } {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash + seed.charCodeAt(i) * (i + 1)) % 997;
  return { rating: 4.5 + (hash % 5) / 10, reviews: 40 + (hash % 160) };
}

function buildCourseCards(
  courses: LearnCourse[],
  products: StorefrontProduct[],
  routes: { courses: string; programs: string },
): StorefrontCourseCard[] {
  const programsBase = routes.programs.replace(/\/$/, '');

  const fromCourses: StorefrontCourseCard[] = courses.map((course) => {
    const { rating, reviews } = pseudoRating(course.id);
    return {
      id: course.id,
      title: course.title,
      category: 'Training',
      instructorName: formatInstructorName(course),
      priceLabel: 'Enroll',
      rating,
      reviewCount: reviews,
      href: `${routes.courses.replace(/\/$/, '')}/courses/${course.id}`,
      kind: 'course',
    };
  });

  const fromProducts: StorefrontCourseCard[] = products.map((product) => {
    const { rating, reviews } = pseudoRating(product.id);
    return {
      id: product.id,
      title: product.title,
      category: product.category ?? 'Program',
      instructorName: product.instructorName ?? null,
      priceLabel: formatStorefrontPrice(product.priceCents, product.currency),
      rating,
      reviewCount: reviews + (product.enrollmentCount ?? 0),
      href: `${programsBase}/${product.id}`,
      kind: 'product',
    };
  });

  return [...fromCourses, ...fromProducts];
}

function extractInstructors(courses: LearnCourse[], products: StorefrontProduct[]): StorefrontInstructor[] {
  const map = new Map<string, StorefrontInstructor>();

  courses.forEach((course) => {
    if (!course.instructor) return;
    const name = formatInstructorName(course);
    if (!name) return;
    map.set(course.instructor.id, { id: course.instructor.id, name, role: 'Course instructor' });
  });

  products.forEach((product) => {
    if (!product.instructorName) return;
    const key = product.instructorName.toLowerCase();
    if (map.has(key)) return;
    map.set(key, { id: key, name: product.instructorName, role: 'Mentor & trainer' });
  });

  return Array.from(map.values());
}

export function StorefrontLanding({ tenantSubdomain }: StorefrontLandingProps) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const mounted = useClientMounted();
  const [searchQuery, setSearchQuery] = useState('');
  const [carouselIndex, setCarouselIndex] = useState(0);

  const { data: tenantData, loading: tenantLoading } = useQuery(GET_TENANT, {
    variables: { subdomain: tenantSubdomain },
  });

  const tenant = tenantData?.tenantBySubdomain;
  const tenantId = tenant?.id as string | undefined;
  const tenantName = (tenant?.name as string | undefined) ?? tenantSubdomain;
  const tenantSettings = tenant?.settings;

  const storefrontSettings = useMemo(
    () => resolveStorefrontSettings(tenantSubdomain, tenantSettings),
    [tenantSubdomain, tenantSettings],
  );

  const profile = useMemo(
    () =>
      resolveStorefrontProfile({
        subdomain: tenantSubdomain,
        tenantName,
        settings: tenantSettings,
        routes: storefrontSettings.routes,
        slug: storefrontSettings.slug,
      }),
    [tenantSubdomain, tenantName, tenantSettings, storefrontSettings.routes, storefrontSettings.slug],
  );

  const { routes, content, theme, branding } = profile;
  const categories = content.categories;

  const [activeCategory, setActiveCategory] = useState(categories[0]?.id ?? 'leadership');

  useEffect(() => {
    if (categories[0]?.id) setActiveCategory(categories[0].id);
  }, [categories]);

  const { data: courseData, loading: coursesLoading } = useQuery(GET_COURSES, {
    skip: !tenantId,
    variables: { tenantId: tenantId ?? '' },
  });

  const { data: productData, loading: productsLoading } = useQuery(GET_STOREFRONT_PRODUCTS, {
    skip: !tenantId,
    variables: { tenantId: tenantId ?? '', category: null },
  });

  useEffect(() => {
    applyLearnTenantTheme(tenantSettings, tenantSubdomain);
  }, [tenantSettings, tenantSubdomain, resolvedTheme]);

  const publishedCourses = useMemo(
    () => filterPublishedCourses((courseData?.courses as LearnCourse[] | undefined) ?? []),
    [courseData?.courses],
  );

  const products = (productData?.storefrontProducts as StorefrontProduct[] | undefined) ?? [];

  const courseCards = useMemo(
    () => buildCourseCards(publishedCourses, products, routes),
    [publishedCourses, products, routes],
  );

  const instructors = useMemo(() => extractInstructors(publishedCourses, products), [publishedCourses, products]);

  const studentCount = useMemo(() => {
    const fromCourses = publishedCourses.reduce((sum, c) => sum + (c.students?.length ?? 0), 0);
    const fromProducts = products.reduce((sum, p) => sum + (p.enrollmentCount ?? 0), 0);
    return fromCourses + fromProducts;
  }, [publishedCourses, products]);

  const stats = buildStorefrontStats(
    {
      instructorCount: instructors.length,
      courseCount: courseCards.length,
      studentCount,
    },
    content.stats,
  );

  const visibleCards = courseCards.slice(carouselIndex, carouselIndex + VISIBLE_COURSES);
  const canPrev = carouselIndex > 0;
  const canNext = carouselIndex + VISIBLE_COURSES < courseCards.length;

  const heroCourses = courseCards.slice(0, 2);
  const loading = tenantLoading || (Boolean(tenantId) && (coursesLoading || productsLoading));

  const brandFirst = tenantName.charAt(0);
  const brandRest = tenantName.slice(1);
  const themeStyle = storefrontThemeCssVars(theme, branding);

  function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    const q = searchQuery.trim();
    const catalog = routes.courses.replace(/\/$/, '');
    if (q) {
      void router.push(`${catalog}?q=${encodeURIComponent(q)}`);
    } else {
      void router.push(catalog);
    }
  }

  if (!mounted || loading) {
    return <PageLoadingState label="Loading storefront…" />;
  }

  return (
    <div className={styles.page} id="top" style={themeStyle}>
      <header className={styles.header}>
        <div className={`${styles.container} ${styles.headerInner}`}>
          <Link href={routes.landing} className={styles.logo}>
            {branding.logoUrl ? (
              <img src={branding.logoUrl} alt={branding.logoAlt ?? tenantName} className={styles.logoImage} />
            ) : (
              <>
                <span className={styles.logoAccent}>{brandFirst}</span>
                <span>{brandRest || 'Learn'}</span>
              </>
            )}
          </Link>

          <nav className={styles.nav} aria-label="Primary">
            {content.nav.map((item) => (
              <Link
                key={`${item.label}-${item.href}`}
                href={resolveNavHref(item.href, routes)}
                className={styles.navLink}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className={styles.headerActions}>
            <Link href={routes.login} className={styles.loginLink}>
              Login
            </Link>
            <Link href={routes.register} className={styles.primaryBtn}>
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={`${styles.container} ${styles.heroGrid}`}>
          <div className={styles.heroCopy}>
            <h1>{content.hero.headline}</h1>
            <p className={styles.heroLead}>{content.hero.subheadline}</p>
            <form className={styles.searchBar} onSubmit={handleSearch}>
              <input
                className={styles.searchInput}
                type="search"
                placeholder={content.hero.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search courses and mentors"
              />
              <button type="submit" className={styles.searchBtn} aria-label="Search">
                ⌕
              </button>
            </form>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.ratingBadge}>
              <span aria-hidden>★</span> {content.hero.ratingBadge}
            </div>
            <div className={styles.heroCardStack}>
              {heroCourses[1] && (
                <article className={`${styles.heroCard} ${styles.heroCardBack}`}>
                  <div className={styles.heroCardMedia} />
                  <div className={styles.heroCardBody}>
                    <p className={styles.heroCardTitle}>{heroCourses[1].title}</p>
                    <p className={styles.heroCardMeta}>{heroCourses[1].instructorName ?? 'Expert mentor'}</p>
                  </div>
                </article>
              )}
              {heroCourses[0] ? (
                <article className={`${styles.heroCard} ${styles.heroCardFront}`}>
                  <div className={styles.heroCardMedia} />
                  <div className={styles.heroCardBody}>
                    <p className={styles.heroCardTitle}>{heroCourses[0].title}</p>
                    <p className={styles.heroCardMeta}>
                      {heroCourses[0].instructorName ?? 'Lead trainer'} · {heroCourses[0].priceLabel}
                    </p>
                  </div>
                </article>
              ) : (
                <article className={`${styles.heroCard} ${styles.heroCardFront}`}>
                  <div className={styles.heroCardMedia} />
                  <div className={styles.heroCardBody}>
                    <p className={styles.heroCardTitle}>{content.hero.emptyCardTitle}</p>
                    <p className={styles.heroCardMeta}>{content.hero.emptyCardMeta}</p>
                  </div>
                </article>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section} id="courses">
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.titleUnderline}>{content.sections.programs}</span>
            </h2>
            {courseCards.length > VISIBLE_COURSES && (
              <div className={styles.carouselControls}>
                <button
                  type="button"
                  className={styles.iconBtn}
                  disabled={!canPrev}
                  onClick={() => setCarouselIndex((i) => Math.max(0, i - 1))}
                  aria-label="Previous courses"
                >
                  ←
                </button>
                <button
                  type="button"
                  className={styles.iconBtn}
                  disabled={!canNext}
                  onClick={() => setCarouselIndex((i) => i + 1)}
                  aria-label="Next courses"
                >
                  →
                </button>
              </div>
            )}
          </div>

          {courseCards.length === 0 ? (
            <p className={styles.heroLead}>Programs from trainers and mentors will appear here.</p>
          ) : (
            <div className={styles.courseGrid}>
              {visibleCards.map((card) => (
                <Link key={card.id} href={card.href} className={styles.courseCard}>
                  <div className={styles.courseThumb}>
                    <span className={styles.categoryPill}>{card.category}</span>
                  </div>
                  <div className={styles.courseBody}>
                    <p className={styles.courseTitle}>{card.title}</p>
                    {card.instructorName && <p className={styles.heroCardMeta}>with {card.instructorName}</p>}
                    <div className={styles.courseMeta}>
                      <span className={styles.stars}>
                        ★ {card.rating.toFixed(1)} ({card.reviewCount})
                      </span>
                      <span className={styles.price}>{card.priceLabel}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitleCenter}>{content.sections.categories}</h2>
          <div className={styles.categoryGrid}>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={routes.courses}
                className={`${styles.categoryBtn} ${activeCategory === category.id ? styles.categoryBtnActive : ''}`}
                onMouseEnter={() => setActiveCategory(category.id)}
              >
                <span className={styles.categoryLabel}>{category.label}</span>
                <span aria-hidden>→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section} id="mentors">
        <div className={styles.container}>
          <h2 className={styles.sectionTitleCenter}>{content.sections.mentors}</h2>
          {instructors.length === 0 ? (
            <p className={styles.heroLead} style={{ textAlign: 'center' }}>
              {content.sections.mentorsEmpty}
            </p>
          ) : (
            <div className={styles.instructorGrid}>
              {instructors.slice(0, 5).map((person) => (
                <article key={person.id} className={styles.instructorCard}>
                  <div className={styles.instructorAvatar}>{initials(person.name)}</div>
                  <h3 className={styles.instructorName}>{person.name}</h3>
                  <p className={styles.instructorRole}>{person.role}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`} id="about">
        <div className={`${styles.container} ${styles.achievementGrid}`}>
          <div>
            <h2 className={styles.sectionTitle}>
              <span className={styles.titleUnderline}>{content.sections.community}</span>
            </h2>
            <div className={styles.statsGrid}>
              {stats.map((stat) => (
                <div key={stat.label} className={styles.statItem}>
                  <div className={styles.statIcon} aria-hidden>
                    ◆
                  </div>
                  <div>
                    <p className={styles.statValue}>{stat.value.toLocaleString()}+</p>
                    <p className={styles.statLabel}>{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.achievementVisual}>
            <p className={styles.achievementQuote}>{content.sections.communityQuote}</p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitleCenter}>{content.sections.testimonials}</h2>
          <div className={styles.testimonialGrid}>
            {content.testimonials.map((item) => (
              <article key={item.id} className={styles.testimonialCard}>
                <span className={styles.quoteMark} aria-hidden>
                  “
                </span>
                <p className={styles.testimonialText}>{item.quote}</p>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.testimonialAvatar}>{initials(item.name)}</div>
                  <div>
                    <p className={styles.instructorName}>{item.name}</p>
                    <p className={styles.instructorRole}>{item.role}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.container}>
        <div className={styles.cta}>
          <div className={styles.ctaGrid}>
            <div className={styles.ctaVisual} aria-hidden>
              🎓
            </div>
            <div className={styles.ctaCopy}>
              <h2 className={styles.ctaTitle}>{content.cta.title}</h2>
              <p className={styles.ctaLead}>{content.cta.lead}</p>
              <Link href={routes.register} className={styles.primaryBtn}>
                {content.cta.buttonLabel}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className={styles.footer} id="contact">
        <div className={styles.container}>
          <div className={styles.footerGrid}>
            <div>
              <Link href={routes.landing} className={styles.logo}>
                <span className={styles.logoAccent}>{brandFirst}</span>
                <span className={styles.logoWarm}>{brandRest || 'Learn'}</span>
              </Link>
              <p className={styles.footerText} style={{ marginTop: '0.75rem' }}>
                {content.footer.tagline}
              </p>
              <p className={styles.footerText}>{content.footer.contactEmail}</p>
            </div>
            <div>
              <p className={styles.footerTitle}>{content.footer.exploreTitle}</p>
              <Link href={routes.landing} className={styles.footerLink}>
                Home
              </Link>
              <Link href={routes.courses} className={styles.footerLink}>
                Course catalog
              </Link>
              <Link href={routes.programs} className={styles.footerLink}>
                Programs store
              </Link>
              <Link href={routes.register} className={styles.footerLink}>
                Become a trainer
              </Link>
            </div>
            <div>
              <p className={styles.footerTitle}>{content.footer.categoriesTitle}</p>
              {categories.slice(0, 6).map((cat) => (
                <Link key={cat.id} href={routes.courses} className={styles.footerLink}>
                  {cat.label}
                </Link>
              ))}
            </div>
            <div>
              <p className={styles.footerTitle}>{content.footer.newsletterTitle}</p>
              <p className={styles.footerText}>{content.footer.newsletterHint}</p>
              <div className={styles.subscribeRow}>
                <input
                  className={styles.subscribeInput}
                  type="email"
                  placeholder="Email address"
                  aria-label="Email for updates"
                />
                <button type="button" className={styles.primaryBtn} style={{ paddingInline: '1rem' }}>
                  Subscribe
                </button>
              </div>
            </div>
          </div>
          <p className={styles.footerBottom}>
            © {new Date().getFullYear()} {tenantName}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
