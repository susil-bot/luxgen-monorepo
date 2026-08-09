import { useEffect, useState } from 'react';
import { fetchTenantVocabulary, type TenantVocabularyPayload } from '../lib/tenant-api';

/**
 * Tenant Vocabulary Layer — display-name overrides only. Internal model/route names
 * (Course, Enrollment, Student...) never change; see docs/PLATFORM_VERTICALIZATION_STRATEGY.md §3.
 * A digital-products tenant sees "Product" everywhere this hook is adopted; a default LMS
 * tenant sees "Course". Adoption is incremental, file by file — components that don't call
 * this hook yet keep their hardcoded label until touched.
 */

export const DEFAULT_VOCABULARY: Required<TenantVocabularyPayload> = {
  course: 'Course',
  enrollment: 'Enrollment',
  student: 'Student',
  instructor: 'Instructor',
  certificate: 'Certificate',
  group: 'Group',
  order: 'Order',
  product: 'Product',
};

type Term = keyof TenantVocabularyPayload;
type Form = 'singular' | 'plural';

/** Naive english pluralization — good enough for the short admin/storefront labels this covers. */
function pluralize(label: string): string {
  if (/[sxz]$|[^aeiou]h$/i.test(label)) return `${label}es`;
  if (/[^aeiou]y$/i.test(label)) return `${label.slice(0, -1)}ies`;
  if (/s$/i.test(label)) return label;
  return `${label}s`;
}

// One shared in-flight fetch + cache so every component using this hook on a page (nav,
// page title, storefront cards) doesn't each issue their own /api/tenant/vocabulary request.
let cache: TenantVocabularyPayload | null = null;
let inflight: Promise<TenantVocabularyPayload> | null = null;
const listeners = new Set<(v: TenantVocabularyPayload) => void>();

function loadShared(): Promise<TenantVocabularyPayload> {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = fetchTenantVocabulary()
      .then((v) => {
        cache = v;
        listeners.forEach((l) => l(v));
        return v;
      })
      .catch(() => {
        cache = {};
        return {};
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

/** Call after a successful save on the Settings > Vocabulary screen so open tabs/components pick it up. */
export function invalidateVocabularyCache(next?: TenantVocabularyPayload): void {
  cache = next ?? null;
  if (next) listeners.forEach((l) => l(next));
}

export interface UseVocabularyResult {
  vocabulary: Required<TenantVocabularyPayload>;
  loading: boolean;
  /** t('course') -> "Course" (or tenant override); t('course', 'plural') -> "Courses" */
  t: (term: Term, form?: Form) => string;
}

/**
 * @param preloaded Optional vocabulary already fetched elsewhere on the page (e.g. a GraphQL
 * `tenant { vocabulary { ... } }` query on public storefront pages that don't hit the
 * session-authenticated REST endpoint). When provided, no extra fetch is made.
 */
export function useVocabulary(preloaded?: TenantVocabularyPayload | null): UseVocabularyResult {
  const [resolved, setResolved] = useState<TenantVocabularyPayload>(preloaded ?? cache ?? {});
  const [loading, setLoading] = useState(!preloaded && !cache);

  useEffect(() => {
    if (preloaded) {
      setResolved(preloaded);
      setLoading(false);
      return;
    }
    let cancelled = false;
    const onUpdate = (v: TenantVocabularyPayload) => {
      if (!cancelled) setResolved(v);
    };
    listeners.add(onUpdate);
    loadShared().then((v) => {
      if (!cancelled) {
        setResolved(v);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
      listeners.delete(onUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preloaded && JSON.stringify(preloaded)]);

  const vocabulary: Required<TenantVocabularyPayload> = { ...DEFAULT_VOCABULARY, ...resolved };

  const t = (term: Term, form: Form = 'singular'): string => {
    const label = vocabulary[term];
    return form === 'plural' ? pluralize(label) : label;
  };

  return { vocabulary, loading, t };
}
