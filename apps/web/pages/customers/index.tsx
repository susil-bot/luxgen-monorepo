import { useState, useEffect } from 'react';
import Head from 'next/head';
import { AppLayout, getDefaultSidebarSections, getDefaultUser, getDefaultLogo } from '@luxgen/ui';

interface EnrolledCourse {
  id: string;
  title: string;
  instructor: string;
  emoji: string;
  progress: number;
  duration: string;
  lastAccessedAt: string;
  category: string;
}

interface Certificate {
  id: string;
  courseTitle: string;
  issuedAt: string;
  emoji: string;
}

interface RecommendedCourse {
  id: string;
  title: string;
  instructor: string;
  emoji: string;
  rating: number;
  duration: string;
  category: string;
}

interface Props {
  tenant: string;
}

const ENROLLED: EnrolledCourse[] = [
  {
    id: '1',
    title: 'Advanced React Development',
    instructor: 'Sarah Chen',
    emoji: '⚛️',
    progress: 72,
    duration: '8 weeks',
    lastAccessedAt: '2h ago',
    category: 'Engineering',
  },
  {
    id: '2',
    title: 'Product Strategy Fundamentals',
    instructor: 'Marcus Webb',
    emoji: '🎯',
    progress: 45,
    duration: '4 weeks',
    lastAccessedAt: '1d ago',
    category: 'Product',
  },
  {
    id: '3',
    title: 'Data Visualisation with Python',
    instructor: 'Priya Nair',
    emoji: '📊',
    progress: 88,
    duration: '6 weeks',
    lastAccessedAt: '3d ago',
    category: 'Data',
  },
  {
    id: '4',
    title: 'Leadership in the Age of AI',
    instructor: 'James Okafor',
    emoji: '🧠',
    progress: 20,
    duration: '5 weeks',
    lastAccessedAt: '1w ago',
    category: 'Leadership',
  },
  {
    id: '5',
    title: 'UX Research Methods',
    instructor: 'Aiko Tanaka',
    emoji: '🔬',
    progress: 60,
    duration: '3 weeks',
    lastAccessedAt: '2d ago',
    category: 'Design',
  },
  {
    id: '6',
    title: 'Financial Modelling Essentials',
    instructor: 'Leo Ferrara',
    emoji: '💰',
    progress: 10,
    duration: '7 weeks',
    lastAccessedAt: '2w ago',
    category: 'Finance',
  },
];

const CERTS: Certificate[] = [
  { id: 'c1', courseTitle: 'Intro to Machine Learning', issuedAt: 'Mar 2025', emoji: '🤖' },
  { id: 'c2', courseTitle: 'Agile Project Management', issuedAt: 'Jan 2025', emoji: '🏃' },
  { id: 'c3', courseTitle: 'Communication for Leaders', issuedAt: 'Nov 2024', emoji: '🗣️' },
];

const RECOMMENDED: RecommendedCourse[] = [
  {
    id: 'r1',
    title: 'TypeScript Deep Dive',
    instructor: 'Alex Rivera',
    emoji: '🔷',
    rating: 4.9,
    duration: '5 weeks',
    category: 'Engineering',
  },
  {
    id: 'r2',
    title: 'Growth Marketing Playbook',
    instructor: 'Nina Patel',
    emoji: '📈',
    rating: 4.7,
    duration: '4 weeks',
    category: 'Marketing',
  },
  {
    id: 'r3',
    title: 'Negotiation & Influence',
    instructor: 'David Kim',
    emoji: '🤝',
    rating: 4.8,
    duration: '3 weeks',
    category: 'Leadership',
  },
];

function ProgressRing({ progress }: { progress: number }) {
  const r = 20;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (progress / 100) * circumference;
  return (
    <svg width="48" height="48" className="lux-course-progress-ring">
      <circle cx="24" cy="24" r={r} fill="none" stroke="var(--color-fill-secondary)" strokeWidth="4" />
      <circle
        cx="24"
        cy="24"
        r={r}
        fill="none"
        stroke="var(--color-green)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 24 24)"
        style={{ transition: 'stroke-dashoffset 500ms ease' }}
      />
      <text x="24" y="28" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--color-label-primary)">
        {progress}%
      </text>
    </svg>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <span style={{ color: 'var(--color-yellow)', fontSize: 13 }}>
      {'★'.repeat(Math.floor(rating))}
      <span style={{ color: 'var(--color-label-tertiary)' }}>{'★'.repeat(5 - Math.floor(rating))}</span>
      <span style={{ color: 'var(--color-label-secondary)', marginLeft: 4, fontSize: 12 }}>{rating}</span>
    </span>
  );
}

export default function CustomersPage({ tenant }: Props) {
  const [streak] = useState(12);
  const [goalMinutes] = useState(30);
  const [minutesDone] = useState(22);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const goalPercent = Math.min(100, Math.round((minutesDone / goalMinutes) * 100));
  const goalCircumference = 2 * Math.PI * 26;
  const goalOffset = goalCircumference - (goalPercent / 100) * goalCircumference;

  const recentCourses = [...ENROLLED].sort((a, b) => {
    const order = ['2h ago', '1d ago', '2d ago', '3d ago', '1w ago', '2w ago'];
    return order.indexOf(a.lastAccessedAt) - order.indexOf(b.lastAccessedAt);
  });

  return (
    <>
      <Head>
        <title>My Learning — {tenant.charAt(0).toUpperCase() + tenant.slice(1)}</title>
      </Head>
      <AppLayout
        sidebarSections={getDefaultSidebarSections()}
        user={getDefaultUser()}
        logo={getDefaultLogo()}
        onUserAction={() => {}}
        showSearch
        showNotifications
        notificationCount={2}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {/* Hero */}
          <div className="lux-learner-hero">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, marginBottom: 6 }}>Good morning, Learner 👋</h1>
                <p style={{ margin: 0, opacity: 0.85, fontSize: 15 }}>
                  You have {ENROLLED.filter((c) => c.progress < 100).length} courses in progress. Keep it up!
                </p>
              </div>
              {/* Goal Ring */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                <svg width="64" height="64">
                  <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="5" />
                  {mounted && (
                    <circle
                      cx="32"
                      cy="32"
                      r="26"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeDasharray={goalCircumference}
                      strokeDashoffset={goalOffset}
                      transform="rotate(-90 32 32)"
                      style={{ transition: 'stroke-dashoffset 600ms ease' }}
                    />
                  )}
                  <text x="32" y="37" textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff">
                    {goalPercent}%
                  </text>
                </svg>
                <span style={{ fontSize: 11, opacity: 0.8 }}>Daily goal</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <span className="lux-streak-badge">🔥 {streak}-day streak</span>
              <span className="lux-streak-badge">🏆 {CERTS.length} certificates</span>
              <span className="lux-streak-badge">📚 {ENROLLED.length} enrolled</span>
            </div>
          </div>

          {/* Continue Learning */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h2 className="ios-large-title" style={{ fontSize: 20, margin: 0 }}>
                Continue Learning
              </h2>
              <button className="ios-btn-plain" style={{ fontSize: 14 }}>
                See all
              </button>
            </div>
            <div className="lux-continue-strip">
              {recentCourses.slice(0, 5).map((course) => (
                <div key={course.id} className="lux-course-progress-card">
                  <div
                    className="lux-course-thumbnail"
                    style={{ fontSize: 40, background: 'var(--color-fill-tertiary)' }}
                  >
                    {course.emoji}
                  </div>
                  <div style={{ padding: '14px 14px 0' }}>
                    <div
                      style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, color: 'var(--color-label-primary)' }}
                    >
                      {course.title}
                    </div>
                    <div className="lux-course-meta">{course.instructor}</div>
                  </div>
                  <div style={{ padding: '10px 14px' }}>
                    <div className="lux-progress-bar-track">
                      <div className="lux-progress-bar" style={{ width: mounted ? `${course.progress}%` : '0%' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                      <span className="lux-progress-label">{course.progress}% complete</span>
                      <span className="lux-progress-label">{course.lastAccessedAt}</span>
                    </div>
                  </div>
                  <div style={{ padding: '0 14px 14px' }}>
                    <button className="ios-btn-primary" style={{ width: '100%', fontSize: 14 }}>
                      Resume
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* All Enrolled Courses */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h2 className="ios-large-title" style={{ fontSize: 20, margin: 0 }}>
                My Courses ({ENROLLED.length})
              </h2>
              <button className="ios-btn-secondary" style={{ fontSize: 13 }}>
                Browse Catalog
              </button>
            </div>
            <div className="lux-enrolled-grid">
              {ENROLLED.map((course) => (
                <div key={course.id} className="lux-enrolled-card">
                  <div
                    className="lux-course-thumbnail"
                    style={{ fontSize: 48, background: 'var(--color-fill-tertiary)' }}
                  >
                    {course.emoji}
                  </div>
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                    <div>
                      <span className="badge" style={{ marginBottom: 6, display: 'inline-block' }}>
                        {course.category}
                      </span>
                      <div
                        style={{ fontWeight: 600, fontSize: 15, color: 'var(--color-label-primary)', lineHeight: 1.4 }}
                      >
                        {course.title}
                      </div>
                      <div className="lux-course-meta" style={{ marginTop: 4 }}>
                        <span>{course.instructor}</span>
                        <span>·</span>
                        <span>{course.duration}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <ProgressRing progress={course.progress} />
                      <div style={{ flex: 1 }}>
                        <div className="lux-progress-bar-track">
                          <div className="lux-progress-bar" style={{ width: mounted ? `${course.progress}%` : '0%' }} />
                        </div>
                        <span className="lux-progress-label">{course.progress}% complete</span>
                      </div>
                    </div>
                    <button className="ios-btn-secondary" style={{ fontSize: 13 }}>
                      {course.progress > 0 ? 'Continue' : 'Start'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Certificates */}
          {CERTS.length > 0 && (
            <section>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <h2 className="ios-large-title" style={{ fontSize: 20, margin: 0 }}>
                  Certificates ({CERTS.length})
                </h2>
              </div>
              <div className="lux-cert-row">
                {CERTS.map((cert) => (
                  <div key={cert.id} className="lux-cert-card">
                    <span className="lux-cert-icon">{cert.emoji}</span>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-label-primary)' }}>
                      {cert.courseTitle}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-label-secondary)' }}>Issued {cert.issuedAt}</div>
                    <button className="ios-btn-plain lux-cert-download" style={{ fontSize: 13, padding: 0 }}>
                      Download PDF
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Recommended */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h2 className="ios-large-title" style={{ fontSize: 20, margin: 0 }}>
                Recommended for You
              </h2>
            </div>
            <div className="lux-recommended-grid">
              {RECOMMENDED.map((course) => (
                <div key={course.id} className="lux-enrolled-card lux-recommend-card">
                  <div
                    className="lux-course-thumbnail"
                    style={{ fontSize: 48, background: 'var(--color-fill-tertiary)' }}
                  >
                    {course.emoji}
                  </div>
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                    <div>
                      <span className="badge" style={{ marginBottom: 6, display: 'inline-block' }}>
                        {course.category}
                      </span>
                      <div
                        style={{ fontWeight: 600, fontSize: 15, color: 'var(--color-label-primary)', lineHeight: 1.4 }}
                      >
                        {course.title}
                      </div>
                      <div className="lux-course-meta" style={{ marginTop: 4 }}>
                        <span>{course.instructor}</span>
                        <span>·</span>
                        <span>{course.duration}</span>
                      </div>
                    </div>
                    <Stars rating={course.rating} />
                    <button className="ios-btn-primary" style={{ fontSize: 13 }}>
                      Enroll Free
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </AppLayout>
    </>
  );
}

export const getServerSideProps = async (ctx: any) => ({
  props: { tenant: ctx.query.tenant || 'demo' },
});
