import type { NextRouter } from 'next/router';
export function prefetchCommonRoutes(r: NextRouter) {
  ['/courses', '/dashboard'].forEach((p) => void r.prefetch(p));
}
