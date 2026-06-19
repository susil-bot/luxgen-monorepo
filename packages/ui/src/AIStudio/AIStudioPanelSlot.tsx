import React, { useEffect } from 'react';
import { useAIStudio } from './AIStudioContext';

/** Registers global Sidekick panel content (mount once in app root). */
export function AIStudioPanelSlot({ children }: { children: React.ReactNode }) {
  const { setPanelContent } = useAIStudio();

  useEffect(() => {
    setPanelContent(children);
    return () => setPanelContent(null);
  }, [children, setPanelContent]);

  return null;
}
