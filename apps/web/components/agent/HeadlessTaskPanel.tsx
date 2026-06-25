import React, { useEffect, useState, useRef } from 'react';

interface HeadlessTaskPanelProps {
  sessionId: string;
  prompt?: string;
  onComplete?: (status: string) => void;
  onClose?: () => void;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  created: { label: 'Queued', color: 'var(--color-label-secondary)' },
  running: { label: 'Running', color: 'var(--color-blue)' },
  staged: { label: 'Staged', color: 'var(--color-orange)' },
  validating: { label: 'Validating', color: 'var(--color-orange)' },
  pending_review: { label: 'Ready for review', color: 'var(--color-green)' },
  committed: { label: 'Committed', color: 'var(--color-green)' },
  merged: { label: 'Merged', color: 'var(--color-green)' },
  failed: { label: 'Failed', color: 'var(--color-red)' },
  cancelled: { label: 'Cancelled', color: 'var(--color-label-tertiary)' },
};

const TERMINAL = new Set(['pending_review', 'failed', 'merged', 'cancelled']);

export default function HeadlessTaskPanel({ sessionId, prompt, onComplete, onClose }: HeadlessTaskPanelProps) {
  const [status, setStatus] = useState('created');
  const [validation, setValidation] = useState<{ passed?: boolean; checks?: unknown[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortRef.current = new AbortController();

    const connect = async () => {
      try {
        const response = await fetch(`/api/agent/tasks/stream?sessionId=${encodeURIComponent(sessionId)}`, {
          signal: abortRef.current!.signal,
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({ error: 'Stream failed' }));
          setError(err.error || 'Stream failed');
          return;
        }

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            try {
              const event = JSON.parse(line.slice(6));
              if (event.type === 'status' || event.type === 'done') {
                setStatus(event.status);
                if (event.validation) setValidation(event.validation);
                if (event.type === 'done' || TERMINAL.has(event.status)) {
                  onComplete?.(event.status);
                }
              } else if (event.type === 'error') {
                setError(event.message);
              }
            } catch {
              // skip malformed events
            }
          }
        }
      } catch (e: unknown) {
        if (e instanceof Error && e.name !== 'AbortError') {
          setError(e.message);
        }
      }
    };

    void connect();
    return () => abortRef.current?.abort();
  }, [sessionId, onComplete, retryKey]);

  const statusInfo = STATUS_LABELS[status] || { label: status, color: 'var(--color-label-secondary)' };
  const isActive = !TERMINAL.has(status) && !error;

  return (
    <div
      className="w-full max-w-full min-w-0 rounded-xl border p-4 animate-slide-up"
      style={{
        backgroundColor: 'var(--color-bg-secondary)',
        borderColor: 'var(--color-separator)',
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3 min-w-0">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--color-label-primary)' }}>
            Background task
          </h3>
          {prompt && (
            <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--color-label-secondary)' }}>
              {prompt}
            </p>
          )}
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-xs px-2 py-1 rounded-md"
            style={{ color: 'var(--color-label-tertiary)' }}
            aria-label="Close panel"
          >
            ✕
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 mb-2">
        {isActive && (
          <span
            className="inline-block w-3 h-3 border-2 rounded-full border-t-transparent animate-spin-ios"
            style={{ borderColor: statusInfo.color, borderTopColor: 'transparent' }}
          />
        )}
        <span className="text-sm font-medium" style={{ color: statusInfo.color }}>
          {statusInfo.label}
        </span>
      </div>

      {validation && (
        <p className="text-xs" style={{ color: validation.passed ? 'var(--color-green)' : 'var(--color-orange)' }}>
          Validation: {validation.passed ? 'passed' : 'failed'}
          {validation.checks ? ` (${validation.checks.length} checks)` : ''}
        </p>
      )}

      {error && (
        <div className="mt-1 flex items-center gap-2">
          <p className="text-xs" style={{ color: 'var(--color-red)' }}>
            {error}
          </p>
          <button
            type="button"
            className="text-xs underline"
            onClick={() => {
              setError(null);
              setRetryKey((k) => k + 1);
            }}
          >
            Retry
          </button>
        </div>
      )}

      <p className="text-xs mt-2 font-mono truncate" style={{ color: 'var(--color-label-tertiary)' }}>
        {sessionId}
      </p>
    </div>
  );
}
