import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export interface AIStudioContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  title: string;
  setTitle: (title: string) => void;
  panelContent: React.ReactNode;
  setPanelContent: (content: React.ReactNode) => void;
}

const AIStudioContext = createContext<AIStudioContextValue | null>(null);

export function AIStudioProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('AI Studio');
  const [panelContent, setPanelContent] = useState<React.ReactNode>(null);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  const value = useMemo(
    () => ({ isOpen, open, close, toggle, title, setTitle, panelContent, setPanelContent }),
    [isOpen, open, close, toggle, title, panelContent],
  );

  return <AIStudioContext.Provider value={value}>{children}</AIStudioContext.Provider>;
}

export function useAIStudio(): AIStudioContextValue {
  const ctx = useContext(AIStudioContext);
  if (!ctx) {
    throw new Error('useAIStudio must be used within AIStudioProvider');
  }
  return ctx;
}

export function useAIStudioOptional(): AIStudioContextValue | null {
  return useContext(AIStudioContext);
}
