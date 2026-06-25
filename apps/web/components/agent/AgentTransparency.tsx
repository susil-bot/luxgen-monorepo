import React, { useState, useEffect, useCallback } from 'react';
import type { AgentSession, StagedFile } from '../../../../packages/agent/src/types/session';
import type { ValidationCheckName } from '../../../../packages/agent/src/types/validation';
import ValidationReport from './ValidationReport';

interface AgentTransparencyProps {
  sessionId: string;
  refreshTrigger: number;
  onApplied: (applied: string[]) => void;
  onDiscarded: () => void;
  onCommitted?: (result: { branch: string; commitSha?: string }) => void;
  onMerged?: () => void;
}

interface GitStatus {
  available: boolean;
  gitEnabled: boolean;
  reason?: string;
  session?: {
    branch: string;
    baseBranch: string;
    status: string;
    commitSha?: string;
    prUrl?: string;
  };
  canCommit: boolean;
  canMerge: boolean;
  canCreatePr: boolean;
}

interface ValidationState {
  passed: boolean | null;
  checks: Array<{ name: ValidationCheckName; scope: string; passed: boolean; output: string; durationMs: number }>;
  ranAt: number | null;
}

function computeDiff(
  original: string,
  modified: string,
): Array<{ type: 'same' | 'add' | 'remove'; text: string; lineNum: number }> {
  const oldLines = (original || '').split('\n');
  const newLines = (modified || '').split('\n');
  const result: Array<{ type: 'same' | 'add' | 'remove'; text: string; lineNum: number }> = [];

  // Simple LCS-based diff (myers algorithm approximation)
  let oi = 0,
    ni = 0;
  while (oi < oldLines.length || ni < newLines.length) {
    if (oi >= oldLines.length) {
      result.push({ type: 'add', text: newLines[ni], lineNum: ni + 1 });
      ni++;
    } else if (ni >= newLines.length) {
      result.push({ type: 'remove', text: oldLines[oi], lineNum: oi + 1 });
      oi++;
    } else if (oldLines[oi] === newLines[ni]) {
      result.push({ type: 'same', text: newLines[ni], lineNum: ni + 1 });
      oi++;
      ni++;
    } else {
      // Look ahead to find next match
      let found = false;
      for (let lookahead = 1; lookahead <= 8; lookahead++) {
        if (ni + lookahead < newLines.length && oldLines[oi] === newLines[ni + lookahead]) {
          for (let k = 0; k < lookahead; k++) {
            result.push({ type: 'add', text: newLines[ni + k], lineNum: ni + k + 1 });
          }
          ni += lookahead;
          found = true;
          break;
        }
        if (oi + lookahead < oldLines.length && oldLines[oi + lookahead] === newLines[ni]) {
          for (let k = 0; k < lookahead; k++) {
            result.push({ type: 'remove', text: oldLines[oi + k], lineNum: oi + k + 1 });
          }
          oi += lookahead;
          found = true;
          break;
        }
      }
      if (!found) {
        result.push({ type: 'remove', text: oldLines[oi], lineNum: oi + 1 });
        result.push({ type: 'add', text: newLines[ni], lineNum: ni + 1 });
        oi++;
        ni++;
      }
    }
  }
  return result;
}

function DiffViewer({ file }: { file: StagedFile & { pendingDelete?: boolean } }) {
  const diff = file.pendingDelete
    ? (file.originalContent || '').split('\n').map((text, i) => ({ type: 'remove' as const, text, lineNum: i + 1 }))
    : file.type === 'new'
      ? file.content.split('\n').map((text, i) => ({ type: 'add' as const, text, lineNum: i + 1 }))
      : computeDiff(file.originalContent || '', file.content);

  const stats = {
    added: diff.filter((d) => d.type === 'add').length,
    removed: diff.filter((d) => d.type === 'remove').length,
  };

  return (
    <div className="flex flex-col h-full">
      {/* File header */}
      <div
        className="px-4 py-3 flex items-center gap-3 border-b"
        style={{ borderColor: 'var(--color-separator)', backgroundColor: 'var(--color-bg-secondary)' }}
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-mono font-medium text-primary truncate">{file.path}</p>
          <p className="text-xs text-secondary mt-0.5">{file.description}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className={`badge ${(file as StagedFile & { pendingDelete?: boolean }).pendingDelete ? 'badge-red' : file.type === 'new' ? 'badge-green' : 'badge-blue'}`}
          >
            {(file as StagedFile & { pendingDelete?: boolean }).pendingDelete
              ? 'DELETE'
              : file.type === 'new'
                ? 'NEW'
                : 'MODIFIED'}
          </span>
          <span className="text-xs font-medium" style={{ color: 'var(--color-green)' }}>
            +{stats.added}
          </span>
          <span className="text-xs font-medium" style={{ color: 'var(--color-red)' }}>
            −{stats.removed}
          </span>
        </div>
      </div>

      {/* Diff content */}
      <div className="flex-1 overflow-auto font-mono text-xs">
        {diff.map((line, i) => (
          <div
            key={i}
            className="flex px-0 leading-5 hover:opacity-80"
            style={{
              backgroundColor:
                line.type === 'add'
                  ? 'rgba(52,199,89,0.12)'
                  : line.type === 'remove'
                    ? 'rgba(255,59,48,0.10)'
                    : 'transparent',
            }}
          >
            <span
              className="w-10 flex-shrink-0 px-2 text-right select-none border-r"
              style={{
                color: 'var(--color-label-tertiary)',
                borderColor: 'var(--color-separator)',
                backgroundColor: 'var(--color-fill-quaternary)',
              }}
            >
              {line.lineNum}
            </span>
            <span
              className="w-6 flex-shrink-0 text-center select-none"
              style={{
                color:
                  line.type === 'add'
                    ? 'var(--color-green)'
                    : line.type === 'remove'
                      ? 'var(--color-red)'
                      : 'transparent',
              }}
            >
              {line.type === 'add' ? '+' : line.type === 'remove' ? '−' : ' '}
            </span>
            <span
              className="flex-1 px-1 whitespace-pre overflow-x-auto"
              style={{ color: 'var(--color-label-primary)' }}
            >
              {line.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AgentTransparency({
  sessionId,
  refreshTrigger,
  onApplied,
  onDiscarded,
  onCommitted,
  onMerged,
}: AgentTransparencyProps) {
  const [session, setSession] = useState<AgentSession | null>(null);
  const [gitStatus, setGitStatus] = useState<GitStatus | null>(null);
  const [validation, setValidation] = useState<ValidationState | null>(null);
  const [validating, setValidating] = useState(false);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadSession = useCallback(async () => {
    setLoading(true);
    try {
      const [stageRes, gitRes, valRes] = await Promise.all([
        fetch(`/api/agent/stage?sessionId=${sessionId}`),
        fetch(`/api/agent/git?sessionId=${sessionId}`),
        fetch(`/api/agent/validate?sessionId=${sessionId}`),
      ]);
      const data = await stageRes.json();
      const git = await gitRes.json();
      const val = await valRes.json();
      setSession(data);
      setGitStatus(git);
      if (val && val.ranAt) setValidation(val);
      const paths = Object.keys(data.files || {});
      // Only auto-select first file if nothing is currently selected.
      setSelectedPath((prev) => (prev ? prev : (paths[0] ?? null)));
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    loadSession();
  }, [refreshTrigger, sessionId]);

  const handleValidate = useCallback(async () => {
    setValidating(true);
    try {
      const res = await fetch('/api/agent/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (data.checks) setValidation(data);
    } finally {
      setValidating(false);
    }
  }, [sessionId]);

  const handleApplyAll = async () => {
    setApplying(true);
    setActionError(null);
    try {
      const res = await fetch('/api/agent/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error || 'Apply failed');
        return;
      }
      onApplied(data.applied || []);
      setSession((prev) => (prev ? { ...prev, files: {} } : prev));
      setSelectedPath(null);
      await loadSession();
    } finally {
      setApplying(false);
    }
  };

  const handleCommit = async () => {
    setApplying(true);
    setActionError(null);
    try {
      const res = await fetch('/api/agent/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (!res.ok || !data.committed) {
        setActionError(data.error || 'Commit failed — check validation results.');
        await loadSession();
        return;
      }
      onCommitted?.({ branch: data.branch, commitSha: data.commitSha });
      setSession((prev) => (prev ? { ...prev, files: {} } : prev));
      setSelectedPath(null);
      await loadSession();
    } finally {
      setApplying(false);
    }
  };

  const handleMerge = async () => {
    setApplying(true);
    setActionError(null);
    try {
      const res = await fetch('/api/agent/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (!res.ok || !data.merged) {
        setActionError(
          data.errors?.join('; ') ||
            data.error ||
            `Merge failed${data.conflicts?.length ? ' — conflicts detected' : ''}`,
        );
        await loadSession();
        return;
      }
      onMerged?.();
      await loadSession();
    } finally {
      setApplying(false);
    }
  };

  const handleCreatePr = async () => {
    setApplying(true);
    setActionError(null);
    try {
      const res = await fetch('/api/agent/pr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (!res.ok || !data.created) {
        setActionError(data.error || 'Failed to create pull request');
      }
      await loadSession();
    } finally {
      setApplying(false);
    }
  };

  const handleDiscard = async () => {
    await fetch(`/api/agent/stage?sessionId=${sessionId}`, { method: 'DELETE' });
    setSession((prev) => (prev ? { ...prev, files: {} } : prev));
    setSelectedPath(null);
    onDiscarded();
  };

  const stagedFiles = Object.values(session?.files || {});
  const selectedFile = selectedPath ? session?.files[selectedPath] : null;
  const gitActive = Boolean(gitStatus?.available);
  const showApply = !gitActive && stagedFiles.length > 0;
  const showCommit = Boolean(gitStatus?.canCommit);

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      {loading && (
        <div
          className="px-4 py-2 border-b text-xs text-secondary flex items-center gap-2 flex-shrink-0"
          style={{ borderColor: 'var(--color-separator)' }}
        >
          <div className="w-3 h-3 border border-current rounded-full border-t-transparent animate-spin" />
          Loading session…
        </div>
      )}
      {actionError && (
        <div
          className="px-4 py-2 border-b flex items-center gap-2 flex-shrink-0"
          style={{ borderColor: 'rgba(255,59,48,0.2)', backgroundColor: 'rgba(255,59,48,0.08)' }}
        >
          <span className="text-xs" style={{ color: 'var(--color-red)' }}>
            ⚠ {actionError}
          </span>
          <button
            className="ml-auto text-xs underline"
            style={{ color: 'var(--color-red)' }}
            onClick={() => setActionError(null)}
          >
            Dismiss
          </button>
        </div>
      )}
      {gitActive && gitStatus?.session && (
        <div
          className="px-4 py-2 border-b flex items-center gap-2 flex-shrink-0 text-xs"
          style={{ borderColor: 'var(--color-separator)', backgroundColor: 'var(--color-fill-quaternary)' }}
        >
          <span className="badge badge-blue font-mono">{gitStatus.session.branch}</span>
          <span className="text-secondary">→ {gitStatus.session.baseBranch}</span>
          <span className="badge badge-gray ml-auto">{gitStatus.session.status}</span>
          {gitStatus.session.prUrl && (
            <a
              href={gitStatus.session.prUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs"
              style={{ color: 'var(--color-blue)' }}
            >
              PR ↗
            </a>
          )}
        </div>
      )}
      {!gitActive && gitStatus?.gitEnabled && gitStatus.reason && (
        <div
          className="px-4 py-2 border-b text-xs text-secondary flex-shrink-0"
          style={{ borderColor: 'var(--color-separator)' }}
        >
          {gitStatus.reason}
        </div>
      )}

      {stagedFiles.length > 0 && (
        <ValidationReport
          sessionId={sessionId}
          validation={
            validation && validation.ranAt
              ? { passed: validation.passed ?? false, checks: validation.checks, ranAt: validation.ranAt }
              : null
          }
          onValidate={handleValidate}
          validating={validating}
        />
      )}

      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
        style={{ borderColor: 'var(--color-separator)', backgroundColor: 'var(--color-bg-secondary)' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-primary">Staged Changes</span>
          {stagedFiles.length > 0 && (
            <span className="badge badge-orange">
              {stagedFiles.length} file{stagedFiles.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        {(stagedFiles.length > 0 || gitStatus?.canMerge || gitStatus?.canCreatePr) && (
          <div className="flex gap-2 flex-wrap justify-end">
            {stagedFiles.length > 0 && (
              <button
                onClick={handleDiscard}
                className="px-3 py-1.5 text-xs font-medium rounded-lg transition-all"
                style={{ backgroundColor: 'var(--color-fill-secondary)', color: 'var(--color-red)' }}
              >
                Discard All
              </button>
            )}
            {showApply && (
              <button
                onClick={handleApplyAll}
                disabled={applying}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg text-white transition-all"
                style={{ backgroundColor: applying ? 'var(--color-fill-secondary)' : 'var(--color-green)' }}
              >
                {applying ? 'Applying…' : '✓ Apply All'}
              </button>
            )}
            {showCommit && (
              <button
                onClick={handleCommit}
                disabled={applying}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg text-white transition-all"
                style={{ backgroundColor: applying ? 'var(--color-fill-secondary)' : 'var(--color-blue)' }}
              >
                {applying ? 'Committing…' : 'Commit to Branch'}
              </button>
            )}
            {gitStatus?.canMerge && (
              <button
                onClick={handleMerge}
                disabled={applying}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg text-white transition-all"
                style={{ backgroundColor: applying ? 'var(--color-fill-secondary)' : 'var(--color-green)' }}
              >
                Squash Merge
              </button>
            )}
            {gitStatus?.canCreatePr && (
              <button
                onClick={handleCreatePr}
                disabled={applying}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all"
                style={{ backgroundColor: 'var(--color-fill-secondary)', color: 'var(--color-blue)' }}
              >
                Create PR
              </button>
            )}
          </div>
        )}
      </div>

      {stagedFiles.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-3xl"
            style={{ backgroundColor: 'var(--color-fill-quaternary)' }}
          >
            🔍
          </div>
          <p className="text-sm font-medium text-primary mb-1">No staged changes</p>
          <p className="text-xs text-secondary max-w-xs">
            Ask the agent to build something. Every file it creates or modifies will appear here for your review before
            being applied.
          </p>
        </div>
      ) : (
        <div className="flex flex-1 min-h-0">
          {/* File tree */}
          <div
            className="w-56 flex-shrink-0 border-r overflow-y-auto"
            style={{ borderColor: 'var(--color-separator)', backgroundColor: 'var(--color-bg-secondary)' }}
          >
            <div className="px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-tertiary mb-2">Files</p>
              {stagedFiles.map((file) => (
                <button
                  key={file.path}
                  onClick={() => setSelectedPath(file.path)}
                  className="w-full text-left px-2 py-2 rounded-lg mb-1 transition-all"
                  style={{
                    backgroundColor: selectedPath === file.path ? 'var(--color-sidebar-item-active)' : 'transparent',
                    color: selectedPath === file.path ? 'var(--color-blue)' : 'var(--color-label-primary)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: (file as StagedFile & { pendingDelete?: boolean }).pendingDelete
                          ? 'var(--color-red)'
                          : file.type === 'new'
                            ? 'var(--color-green)'
                            : 'var(--color-blue)',
                      }}
                    />
                    <span className="text-xs font-mono truncate">{file.path.split('/').pop()}</span>
                  </div>
                  <p className="text-xs text-tertiary truncate pl-3.5 mt-0.5">{file.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Diff panel */}
          <div className="flex-1 min-w-0 overflow-hidden">
            {selectedFile ? (
              <DiffViewer file={selectedFile} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-secondary">Select a file to view diff</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
