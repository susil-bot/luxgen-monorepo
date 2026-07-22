import { useEffect, useId, useState } from 'react';
import { useRouter } from 'next/router';
import { useAIStudio } from '@luxgen/ui';
import AgentChat from './AgentChat';

function makeSessionId(baseId: string, suffix: string) {
  return `sidekick-${baseId}-${suffix}`;
}

/** Global Sidekick panel — agent chat in Shopify-style docked layout. */
export function AIStudioSidekickPanel() {
  const router = useRouter();
  const { setTitle } = useAIStudio();
  const baseId = useId().replace(/:/g, '');
  const [sessionSuffix, setSessionSuffix] = useState('0');
  const sessionId = makeSessionId(baseId, sessionSuffix);

  useEffect(() => {
    const path = router.pathname;
    if (path.includes('/customers')) {
      setTitle('Help with customers…');
    } else if (path.includes('/orders')) {
      setTitle('Help with orders…');
    } else if (path.includes('/products')) {
      setTitle('Help with products…');
    } else if (path.includes('/dashboard')) {
      setTitle('Ask about your store…');
    } else {
      setTitle('AI Studio');
    }
  }, [router.pathname, setTitle]);

  return (
    <AgentChat
      sessionId={sessionId}
      layout="sidekick"
      onFileStaged={() => window.dispatchEvent(new CustomEvent('luxgen:file-staged'))}
      onSessionChange={() => setSessionSuffix(String(Date.now()))}
    />
  );
}
