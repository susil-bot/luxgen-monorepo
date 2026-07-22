import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';

import { useAuth } from '../hooks/useAuth';
import { getToken } from '../lib/auth';
import { SPLASH_ROUTE } from '../lib/guest-flow';
import { DASHBOARD_ROUTE, resolvePostAuthRoute, SKILL_CHECK_INTRO_ROUTE } from '../lib/skill-check';

/**
 * App entry:
 * - No token → Splash (then Onboarding → Sign up)
 * - Token + unfinished skill check → “We wanna know about you”
 * - Token + finished skill check → Dashboard
 */
export default function Index() {
  const { user, loading } = useAuth();
  const [href, setHref] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;

    let mounted = true;

    void (async () => {
      const token = await getToken();
      if (!mounted) return;

      if (!token || !user) {
        setHref(SPLASH_ROUTE);
        return;
      }

      const next = await resolvePostAuthRoute(user.id);
      if (mounted) setHref(next);
    })();

    return () => {
      mounted = false;
    };
  }, [user, loading]);

  if (loading || !href) return null;

  return <Redirect href={href as typeof SPLASH_ROUTE | typeof SKILL_CHECK_INTRO_ROUTE | typeof DASHBOARD_ROUTE} />;
}
