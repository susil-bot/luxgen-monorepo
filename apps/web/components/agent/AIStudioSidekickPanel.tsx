import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAIStudio } from '@luxgen/ui';
import AgentChat from './AgentChat';

function makeSessionId() {
  return `sidekick-${Date.now().toString(36)}`;
}

/** Global Sidekick panel — agent chat in Shopify-style docked layout. */
export function AIStudioSidekickPanel() {
  const router = useRouter();
  const { setTitle } = useAIStudio();
  const [sessionId, setSessionId] = useState('');

  useEffect(() => {
    setSessionId(makeSessionId());
  }, []);

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

  if (!sessionId) return null;

  return (
    <AgentChat
      sessionId={sessionId}
      layout="sidekick"
      onFileStaged={() => {}}
      onSessionChange={() => setSessionId(makeSessionId())}
    />
  );
}
