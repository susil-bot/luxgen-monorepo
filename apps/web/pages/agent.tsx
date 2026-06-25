import React, { useState, useCallback, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  SnackbarProvider,
  useSnackbar,
  AppLayout,
  getDefaultUser,
  getDefaultLogo,
  getDefaultSidebarSections,
  type UserMenu,
} from '@luxgen/ui';
import { createHandleUserAction } from '../lib/user-actions';
import AgentChat from '../components/agent/AgentChat';
import AgentTransparency from '../components/agent/AgentTransparency';

function AgentStudioContent() {
  const router = useRouter();
  const { showSuccess, showError: _showError, showInfo } = useSnackbar();
  const [user, setUser] = useState<UserMenu | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [transparencyRefresh, setTransparencyRefresh] = useState(0);
  const [appliedCount, setAppliedCount] = useState(0);
  const [ollamaStatus, setOllamaStatus] = useState<'checking' | 'ready' | 'no-model' | 'offline'>('checking');
  const [rightPanelWidth, setRightPanelWidth] = useState(50); // percent
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setSessionId(`session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
  }, []);

  useEffect(() => {
    if (!sessionId) return;

    fetch('/api/agent/git', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    }).catch(() => {});
  }, [sessionId]);

  useEffect(() => {
    const data = localStorage.getItem('user');
    if (data) {
      try {
        const p = JSON.parse(data);
        setUser({ name: `${p.firstName} ${p.lastName}`, email: p.email, role: p.role });
      } catch {
        setUser(getDefaultUser());
      }
    } else {
      setUser(getDefaultUser());
    }

    fetch('/api/agent/health')
      .then((r) => r.json())
      .then((d) => {
        if (!d.ok) setOllamaStatus('offline');
        else if (!d.hasModel) setOllamaStatus('no-model');
        else setOllamaStatus('ready');
      })
      .catch(() => setOllamaStatus('offline'));
  }, []);

  const handleUserAction = createHandleUserAction(router);

  const handleFileStaged = useCallback(
    (path: string, _type: string, _description: string) => {
      showInfo(`Staged: ${path.split('/').pop()}`);
    },
    [showInfo],
  );

  const handleSessionChange = useCallback(() => {
    setTransparencyRefresh((n) => n + 1);
  }, []);

  const handleApplied = useCallback(
    (applied: string[]) => {
      setAppliedCount((c) => c + applied.length);
      setTransparencyRefresh((n) => n + 1);
      showSuccess(`Applied ${applied.length} file${applied.length !== 1 ? 's' : ''} to the codebase!`);
    },
    [showSuccess],
  );

  const handleCommitted = useCallback(
    ({ branch }: { branch: string; commitSha?: string }) => {
      setTransparencyRefresh((n) => n + 1);
      showSuccess(`Committed to branch ${branch}`);
    },
    [showSuccess],
  );

  const handleMerged = useCallback(() => {
    setTransparencyRefresh((n) => n + 1);
    showSuccess('Changes squash-merged to base branch');
  }, [showSuccess]);

  const handleDiscarded = useCallback(() => {
    setTransparencyRefresh((n) => n + 1);
    showInfo('Changes discarded.');
  }, [showInfo]);

  // Drag-to-resize divider
  const handleDividerMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const startX = e.clientX;
    const startWidth = rightPanelWidth;

    const onMove = (ev: MouseEvent) => {
      const containerWidth = window.innerWidth;
      const dx = ev.clientX - startX;
      const newRight = startWidth - (dx / containerWidth) * 100;
      setRightPanelWidth(Math.min(75, Math.max(25, newRight)));
    };
    const onUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  return (
    <>
      <Head>
        <title>Agent Studio - LuxGen</title>
        <meta name="description" content="AI developer agent for LuxGen" />
      </Head>

      <AppLayout
        sidebarSections={getDefaultSidebarSections()}
        user={user ?? undefined}
        onUserAction={handleUserAction}
        logo={getDefaultLogo()}
        sidebarCollapsible
        responsive
      >
        <div className="flex flex-col h-full" style={{ height: 'calc(100vh - 64px)' }}>
          {/* Top bar */}
          <div
            className="flex items-center justify-between px-4 py-2.5 border-b flex-shrink-0"
            style={{
              borderColor: 'var(--color-separator)',
              backgroundColor: 'var(--color-bg-secondary)',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-lg"
                style={{ backgroundColor: 'var(--color-blue)', color: 'white' }}
              >
                🤖
              </div>
              <div>
                <h1 className="text-sm font-bold text-primary">Agent Studio</h1>
                <p className="text-xs text-secondary">Describe features — the AI builds them transparently</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {appliedCount > 0 && (
                <span className="badge badge-green">
                  {appliedCount} file{appliedCount !== 1 ? 's' : ''} applied
                </span>
              )}
              {sessionId && <span className="badge badge-blue">Session: {sessionId.slice(-8)}</span>}
            </div>
          </div>

          {/* Ollama status banner */}
          {ollamaStatus === 'offline' && (
            <div
              className="px-4 py-3 flex items-center gap-3 border-b flex-shrink-0"
              style={{ backgroundColor: 'rgba(255,59,48,0.08)', borderColor: 'rgba(255,59,48,0.2)' }}
            >
              <span className="text-base">🔴</span>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--color-red)' }}>
                  Ollama is not running
                </p>
                <p className="text-xs text-secondary">
                  Start it with:{' '}
                  <code
                    className="px-1 py-0.5 rounded text-xs font-mono"
                    style={{ backgroundColor: 'var(--color-fill-secondary)' }}
                  >
                    docker compose up ollama -d
                  </code>
                </p>
              </div>
            </div>
          )}
          {ollamaStatus === 'no-model' && (
            <div
              className="px-4 py-3 flex items-center gap-3 border-b flex-shrink-0"
              style={{ backgroundColor: 'rgba(255,149,0,0.08)', borderColor: 'rgba(255,149,0,0.2)' }}
            >
              <span className="text-base">🟡</span>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--color-orange)' }}>
                  Model not yet downloaded
                </p>
                <p className="text-xs text-secondary">
                  Pull it with:{' '}
                  <code
                    className="px-1 py-0.5 rounded text-xs font-mono"
                    style={{ backgroundColor: 'var(--color-fill-secondary)' }}
                  >
                    docker compose up ollama-model-pull
                  </code>{' '}
                  (~4.7 GB, one time)
                </p>
              </div>
            </div>
          )}

          {/* Main two-panel layout */}
          <div className="flex flex-1 min-h-0 overflow-hidden" style={{ userSelect: isDragging ? 'none' : 'auto' }}>
            {/* Left: Chat */}
            <div className="flex flex-col min-h-0 overflow-hidden" style={{ width: `${100 - rightPanelWidth}%` }}>
              <AgentChat sessionId={sessionId} onFileStaged={handleFileStaged} onSessionChange={handleSessionChange} />
            </div>

            {/* Divider */}
            <div
              className="flex-shrink-0 cursor-col-resize flex items-center justify-center transition-colors"
              style={{
                width: '4px',
                backgroundColor: isDragging ? 'var(--color-blue)' : 'var(--color-separator)',
              }}
              onMouseDown={handleDividerMouseDown}
            >
              <div
                className="w-1 h-8 rounded-full"
                style={{ backgroundColor: isDragging ? 'var(--color-blue)' : 'var(--color-separator-opaque)' }}
              />
            </div>

            {/* Right: Transparency layer */}
            <div
              className="flex flex-col min-h-0 overflow-hidden border-l"
              style={{ width: `${rightPanelWidth}%`, borderColor: 'var(--color-separator)' }}
            >
              <AgentTransparency
                sessionId={sessionId}
                refreshTrigger={transparencyRefresh}
                onApplied={handleApplied}
                onDiscarded={handleDiscarded}
                onCommitted={handleCommitted}
                onMerged={handleMerged}
              />
            </div>
          </div>
        </div>
      </AppLayout>
    </>
  );
}

export default function AgentStudio() {
  return (
    <SnackbarProvider position="top-right" maxSnackbars={4}>
      <AgentStudioContent />
    </SnackbarProvider>
  );
}
