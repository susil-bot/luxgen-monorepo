import { useEffect } from 'react';
import { useRouter } from 'next/router';

/** Thin top-bar indicator during Next.js client-side route transitions. */
export function RouteProgressBar() {
  const router = useRouter();

  useEffect(() => {
    const start = () => document.documentElement.classList.add('route-loading');
    const end = () => document.documentElement.classList.remove('route-loading');

    router.events.on('routeChangeStart', start);
    router.events.on('routeChangeComplete', end);
    router.events.on('routeChangeError', end);

    return () => {
      router.events.off('routeChangeStart', start);
      router.events.off('routeChangeComplete', end);
      router.events.off('routeChangeError', end);
    };
  }, [router]);

  return null;
}
