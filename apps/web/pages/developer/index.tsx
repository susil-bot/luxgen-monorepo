import React, { useState, useEffect, useCallback } from 'react';
import { useAppShellConfig } from '../../lib/app-shell-config';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  SnackbarProvider,
  useSnackbar,
  AppLayout } from '@luxgen/ui';
import AgentChat from '../../components/agent/AgentChat';
import AgentTransparency from '../../components/agent/AgentTransparency';
import { AGENT_TOOLS } from '@luxgen/agent';
import { SYSTEM_PROMPT } from '../../lib/agent-system-prompt';
import { createHandleUserAction } from '../../lib/user-actions';
import { getTenantPageProps } from '../../lib/tenant-page-props';
import { useLayoutUser } from '../../lib/app-layout-user';

// ── Types ──────────────────────────────────────────────────────────────────────

interface OllamaModel {
  name: string;
  size: number;
  details?: { parameter_size?: string; family?: string };
}

type OllamaStatus = 'checking' | 'ready' | 'no-model' | 'offline';

const TOOL_EMOJI: Record<string, string> = {
  read_file: '📄',
  list_files: '📁',
  write_file: '✏️',
  search_code: '🔍',
  delete_file: '🗑️',
  read_automation_schema: '⚡',
  rename_file: '📝',
  run_command: '▶️',
  fetch_url: '🌐',
  read_project_config: '📦',
};

const TOOL_DEFS = AGENT_TOOLS.map((tool) => ({
  id: tool.name,
  label: tool.name,
  desc: tool.description.split('.')[0] ?? tool.description,
  emoji: TOOL_EMOJI[tool.name] ?? '🔧',
}));

function formatBytes(bytes: number): string {
  if (!bytes) return '';
  const gb = bytes / 1024 / 1024 / 1024;
  return gb >= 1 ? `${gb.toFixed(1)} GB` : `${(bytes / 1024 / 1024).toFixed(0)} MB`;
}

// ── Toggle switch ──────────────────────────────────────────────────────────────

function IosToggle({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <label
      style={{
        position: 'relative',
        display: 'inline-block',
        width: 36,
        height: 22,
        flexShrink: 0,
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer' }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        style={{ opacity: 0, width: 0, height: 0 }}
      />
      <span
        style={{
          position: 'absolute',
          inset: 0,
          background: checked ? 'var(--color-green)' : 'var(--color-fill-secondary)',
          borderRadius: 22,
          transition: 'background 150ms ease' }}
      />
      <span
        style={{
          position: 'absolute',
          top: 3,
          left: checked ? 17 : 3,
          width: 16,
          height: 16,
          background: 'var(--color-bg-primary)',
          borderRadius: '50%',
          boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
          transition: 'left 150ms ease',
          pointerEvents: 'none' }}
      />
    </label>
  );
}

// ── Param slider row ───────────────────────────────────────────────────────────

function ParamRow({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange }: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-label-secondary)' }}>{label}</span>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--color-label-primary)',
            minWidth: 48,
            textAlign: 'right' }}
        >
          {display ?? value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: 'var(--color-blue)', height: 4 }}
      />
    </div>
  );
}

// ── Left config panel ──────────────────────────────────────────────────────────

interface ConfigPanelProps {
  models: OllamaModel[];
  selectedModel: string;
  temperature: number;
  maxTokens: number;
  enabledTools: Set<string>;
  systemPromptMode: 'default' | 'custom';
  customSystemPrompt: string;
  onModelChange: (m: string) => void;
  onTemperatureChange: (v: number) => void;
  onMaxTokensChange: (v: number) => void;
  onToolToggle: (id: string) => void;
  onSystemPromptModeChange: (m: 'default' | 'custom') => void;
  onCustomSystemPromptChange: (v: string) => void;
}

function ConfigPanel({
  models,
  selectedModel,
  temperature,
  maxTokens,
  enabledTools,
  systemPromptMode,
  customSystemPrompt,
  onModelChange,
  onTemperatureChange,
  onMaxTokensChange,
  onToolToggle,
  onSystemPromptModeChange,
  onCustomSystemPromptChange }: ConfigPanelProps) {
  const [promptExpanded, setPromptExpanded] = useState(false);

  const selectedMeta = models.find((m) => m.name === selectedModel);

  return (
    <div
      style={{
        width: 260,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        borderRight: '1px solid var(--color-separator)',
        overflowY: 'auto',
        background: 'var(--color-bg-secondary)' }}
    >
      {/* Model section */}
      <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--color-separator)' }}>
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--color-label-tertiary)',
            marginBottom: 10 }}
        >
          Model
        </p>
        <select
          value={selectedModel}
          onChange={(e) => onModelChange(e.target.value)}
          className="lux-model-selector"
          style={{ marginBottom: 8 }}
        >
          {models.length === 0 ? (
            <option value="">No models available</option>
          ) : (
            models.map((m) => (
              <option key={m.name} value={m.name}>
                {m.name}
              </option>
            ))
          )}
        </select>
        {selectedMeta && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {selectedMeta.details?.family && <span className="lux-model-badge">{selectedMeta.details.family}</span>}
            {selectedMeta.details?.parameter_size && (
              <span className="lux-model-badge">{selectedMeta.details.parameter_size}</span>
            )}
            {selectedMeta.size > 0 && <span className="lux-model-badge">{formatBytes(selectedMeta.size)}</span>}
          </div>
        )}
      </div>

      {/* Parameters */}
      <div
        style={{
          padding: '14px 16px',
          borderBottom: '1px solid var(--color-separator)',
          display: 'flex',
          flexDirection: 'column',
          gap: 14 }}
      >
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--color-label-tertiary)',
            margin: 0 }}
        >
          Parameters
        </p>
        <ParamRow
          label="Temperature"
          value={temperature}
          min={0}
          max={2}
          step={0.05}
          display={temperature.toFixed(2)}
          onChange={onTemperatureChange}
        />
        <ParamRow
          label="Max Tokens"
          value={maxTokens}
          min={256}
          max={8192}
          step={256}
          display={maxTokens.toLocaleString()}
          onChange={onMaxTokensChange}
        />
      </div>

      {/* Tools */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-separator)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--color-label-tertiary)',
              margin: 0 }}
          >
            Tools
          </p>
          <span style={{ fontSize: 11, color: 'var(--color-label-tertiary)' }}>
            {enabledTools.size}/{TOOL_DEFS.length}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {TOOL_DEFS.map((tool) => (
            <div
              key={tool.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 10px',
                background: enabledTools.has(tool.id) ? 'rgba(10,132,255,0.06)' : 'var(--color-bg-primary)',
                border: `1px solid ${enabledTools.has(tool.id) ? 'rgba(10,132,255,0.25)' : 'var(--color-separator)'}`,
                borderRadius: 'var(--radius-md)',
                transition: 'all 150ms ease' }}
            >
              <span style={{ fontSize: 16, flexShrink: 0 }}>{tool.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    fontFamily: 'ui-monospace, monospace',
                    color: 'var(--color-label-primary)',
                    marginBottom: 1 }}
                >
                  {tool.label}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-label-tertiary)', lineHeight: 1.3 }}>{tool.desc}</div>
              </div>
              <IosToggle checked={enabledTools.has(tool.id)} onChange={() => onToolToggle(tool.id)} />
            </div>
          ))}
        </div>
      </div>

      {/* System Prompt */}
      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--color-label-tertiary)',
              margin: 0 }}
          >
            System Prompt
          </p>
          <button
            onClick={() => setPromptExpanded((v) => !v)}
            style={{
              fontSize: 11,
              color: 'var(--color-blue)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit' }}
          >
            {promptExpanded ? 'Hide' : 'Edit'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: 6, marginBottom: promptExpanded ? 10 : 0 }}>
          {(['default', 'custom'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => onSystemPromptModeChange(mode)}
              style={{
                flex: 1,
                padding: '5px 0',
                fontSize: 12,
                fontFamily: 'inherit',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 500,
                background: systemPromptMode === mode ? 'var(--color-blue)' : 'var(--color-fill-tertiary)',
                color: systemPromptMode === mode ? '#fff' : 'var(--color-label-secondary)',
                transition: 'all 150ms ease' }}
            >
              {mode === 'default' ? 'Default' : 'Custom'}
            </button>
          ))}
        </div>

        {promptExpanded && (
          <>
            {systemPromptMode === 'default' ? (
              <pre
                style={{
                  margin: 0,
                  padding: '10px',
                  fontSize: 10,
                  lineHeight: 1.5,
                  fontFamily: 'ui-monospace, monospace',
                  color: 'var(--color-label-secondary)',
                  background: 'var(--color-bg-primary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-separator)',
                  maxHeight: 200,
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word' }}
              >
                {SYSTEM_PROMPT.slice(0, 600)}…
              </pre>
            ) : (
              <>
                <textarea
                  className="lux-system-prompt"
                  value={customSystemPrompt}
                  onChange={(e) => onCustomSystemPromptChange(e.target.value)}
                  placeholder="Write a custom system prompt…"
                  rows={8}
                />
                <div className="lux-prompt-char-count">{customSystemPrompt.length} chars</div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Main page content ──────────────────────────────────────────────────────────

function AIStudioContent() {
  const router = useRouter();
  const { showSuccess, showInfo } = useSnackbar();
  const layoutUser = useLayoutUser();
  const { sidebarSections, logo } = useAppShellConfig();

  // Session
  const [sessionId, setSessionId] = useState('');

  // Ollama
  const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus>('checking');
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [selectedModel, setSelectedModel] = useState('');

  // Config
  const [temperature, setTemperature] = useState(0.1);
  const [maxTokens, setMaxTokens] = useState(4096);
  const [enabledTools, setEnabledTools] = useState<Set<string>>(
    new Set(['read_file', 'list_files', 'write_file', 'search_code']),
  );
  const [systemPromptMode, setSystemPromptMode] = useState<'default' | 'custom'>('default');
  const [customSystemPrompt, setCustomSystemPrompt] = useState('');

  // Layout
  const [rightPanelWidth, setRightPanelWidth] = useState(45); // % of chat+transparency area
  const [isDragging, setIsDragging] = useState(false);
  const [configOpen, setConfigOpen] = useState(true);
  const [appliedCount, setAppliedCount] = useState(0);
  const [transparencyRefresh, setTransparencyRefresh] = useState(0);

  useEffect(() => {
    // Session ID (client-only to avoid hydration mismatch)
    setSessionId(`session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);

    // Ollama health + model list
    const checkHealth = async () => {
      try {
        const [healthRes, modelsRes] = await Promise.all([fetch('/api/agent/health'), fetch('/api/agent/models')]);
        const health = await healthRes.json();
        const modelData = await modelsRes.json();

        if (!health.ok) {
          setOllamaStatus('offline');
        } else if (!health.hasModel && modelData.models.length === 0) {
          setOllamaStatus('no-model');
        } else {
          setOllamaStatus('ready');
        }

        if (modelData.models.length > 0) {
          setModels(modelData.models);
          setSelectedModel(modelData.models[0].name);
        }
      } catch {
        setOllamaStatus('offline');
      }
    };
    checkHealth();
  }, []);

  const handleUserAction = createHandleUserAction(router);

  const handleToolToggle = (id: string) => {
    setEnabledTools((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleFileStaged = useCallback(
    (path: string, _type: string, _desc: string) => {
      showInfo(`Staged: ${path.split('/').pop()}`);
      setTransparencyRefresh((n) => n + 1);
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
      showSuccess(`Applied ${applied.length} file${applied.length !== 1 ? 's' : ''} to the codebase`);
    },
    [showSuccess],
  );

  const handleDiscarded = useCallback(() => {
    setTransparencyRefresh((n) => n + 1);
    showInfo('Changes discarded');
  }, [showInfo]);

  // Drag-to-resize divider between chat and transparency
  const handleDividerMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const startX = e.clientX;
    const startW = rightPanelWidth;

    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX;
      const pct = (dx / window.innerWidth) * 100;
      setRightPanelWidth(Math.min(70, Math.max(25, startW - pct)));
    };
    const onUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // Status indicator
  const statusDot =
    ollamaStatus === 'ready'
      ? 'var(--color-green)'
      : ollamaStatus === 'checking'
        ? 'var(--color-orange)'
        : 'var(--color-red)';
  const statusText =
    ollamaStatus === 'ready'
      ? 'Ollama ready'
      : ollamaStatus === 'checking'
        ? 'Checking…'
        : ollamaStatus === 'no-model'
          ? 'No model downloaded'
          : 'Ollama offline';

  const activeSystemPrompt =
    systemPromptMode === 'custom' && customSystemPrompt.trim() ? customSystemPrompt : undefined; // undefined → API uses its default SYSTEM_PROMPT

  return (
    <>
      <Head>
        <title>AI Studio — LuxGen</title>
        <meta name="description" content="Configure and interact with LuxGen's AI agent" />
      </Head>

      <AppLayout
        sidebarSections={sidebarSections}
        user={layoutUser ?? undefined}
        onUserAction={handleUserAction}
        logo={logo}
        sidebarCollapsible
        responsive
        contentMaxWidth={false}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
          {/* ── Top bar ───────────────────────────────────────────────────────── */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 16px',
              borderBottom: '1px solid var(--color-separator)',
              background: 'var(--color-bg-secondary)',
              flexShrink: 0,
              gap: 12 }}
          >
            {/* Left: identity */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: 'var(--color-blue)',
                  color: 'var(--color-label-on-fill)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 17 }}
              >
                🤖
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-label-primary)' }}>AI Studio</div>
                <div style={{ fontSize: 11, color: 'var(--color-label-secondary)' }}>
                  Describe features — the agent reads, writes, and stages changes for your review
                </div>
              </div>
            </div>

            {/* Right: status + badges + controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: 12,
                  color: 'var(--color-label-secondary)' }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: statusDot,
                    display: 'inline-block',
                    flexShrink: 0 }}
                />
                {statusText}
                {selectedModel && ollamaStatus === 'ready' && (
                  <span className="lux-model-badge" style={{ marginLeft: 4 }}>
                    {selectedModel}
                  </span>
                )}
              </div>

              {appliedCount > 0 && <span className="badge badge-green">{appliedCount} applied</span>}
              {sessionId && <span className="badge badge-blue">Session {sessionId.slice(-8)}</span>}

              <button
                onClick={() => setConfigOpen((v) => !v)}
                style={{
                  height: 30,
                  padding: '0 10px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-separator)',
                  background: configOpen ? 'var(--color-fill-tertiary)' : 'var(--color-bg-primary)',
                  color: 'var(--color-label-secondary)',
                  fontSize: 12,
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  transition: 'all 150ms ease' }}
              >
                ⚙️ {configOpen ? 'Hide Config' : 'Show Config'}
              </button>
            </div>
          </div>

          {/* ── Status banners ─────────────────────────────────────────────── */}
          {ollamaStatus === 'offline' && (
            <div
              style={{
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: 'rgba(255,59,48,0.08)',
                borderBottom: '1px solid rgba(255,59,48,0.20)',
                flexShrink: 0 }}
            >
              <span style={{ fontSize: 16 }}>🔴</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-red)' }}>Ollama is not running</div>
                <div style={{ fontSize: 12, color: 'var(--color-label-secondary)' }}>
                  Start it:{' '}
                  <code
                    style={{
                      padding: '1px 6px',
                      borderRadius: 4,
                      background: 'var(--color-fill-secondary)',
                      fontFamily: 'ui-monospace, monospace',
                      fontSize: 11 }}
                  >
                    docker compose up ollama -d
                  </code>
                </div>
              </div>
            </div>
          )}
          {ollamaStatus === 'no-model' && (
            <div
              style={{
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: 'rgba(255,149,0,0.08)',
                borderBottom: '1px solid rgba(255,149,0,0.20)',
                flexShrink: 0 }}
            >
              <span style={{ fontSize: 16 }}>🟡</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-orange)' }}>
                  No model downloaded yet
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-label-secondary)' }}>
                  Pull a model:{' '}
                  <code
                    style={{
                      padding: '1px 6px',
                      borderRadius: 4,
                      background: 'var(--color-fill-secondary)',
                      fontFamily: 'ui-monospace, monospace',
                      fontSize: 11 }}
                  >
                    ollama pull mistral
                  </code>{' '}
                  or{' '}
                  <code
                    style={{
                      padding: '1px 6px',
                      borderRadius: 4,
                      background: 'var(--color-fill-secondary)',
                      fontFamily: 'ui-monospace, monospace',
                      fontSize: 11 }}
                  >
                    docker compose up ollama-model-pull
                  </code>
                </div>
              </div>
            </div>
          )}

          {/* ── 3-zone body ────────────────────────────────────────────────── */}
          <div
            style={{
              display: 'flex',
              flex: 1,
              minHeight: 0,
              overflow: 'hidden',
              userSelect: isDragging ? 'none' : 'auto' }}
          >
            {/* Zone 1: Config panel (collapsible) */}
            {configOpen && (
              <ConfigPanel
                models={models}
                selectedModel={selectedModel}
                temperature={temperature}
                maxTokens={maxTokens}
                enabledTools={enabledTools}
                systemPromptMode={systemPromptMode}
                customSystemPrompt={customSystemPrompt}
                onModelChange={setSelectedModel}
                onTemperatureChange={setTemperature}
                onMaxTokensChange={setMaxTokens}
                onToolToggle={handleToolToggle}
                onSystemPromptModeChange={setSystemPromptMode}
                onCustomSystemPromptChange={setCustomSystemPrompt}
              />
            )}

            {/* Zone 2: Chat (existing AgentChat) */}
            <div
              style={{
                flex: 1,
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                width: `${100 - rightPanelWidth}%` }}
            >
              {sessionId && (
                <AgentChat
                  sessionId={sessionId}
                  onFileStaged={handleFileStaged}
                  onSessionChange={handleSessionChange}
                  model={selectedModel || undefined}
                  temperature={temperature}
                  maxTokens={maxTokens}
                  toolFilter={[...enabledTools]}
                  systemPrompt={activeSystemPrompt}
                />
              )}
            </div>

            {/* Divider */}
            <div
              onMouseDown={handleDividerMouseDown}
              style={{
                width: 5,
                flexShrink: 0,
                cursor: 'col-resize',
                background: isDragging ? 'var(--color-blue)' : 'var(--color-separator)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 100ms ease' }}
            >
              <div
                style={{
                  width: 2,
                  height: 32,
                  borderRadius: 2,
                  background: isDragging ? 'var(--color-blue)' : 'var(--color-separator-opaque)' }}
              />
            </div>

            {/* Zone 3: Transparency (existing AgentTransparency) */}
            <div
              style={{
                width: `${rightPanelWidth}%`,
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                borderLeft: '1px solid var(--color-separator)' }}
            >
              {sessionId && (
                <AgentTransparency
                  sessionId={sessionId}
                  refreshTrigger={transparencyRefresh}
                  onApplied={handleApplied}
                  onDiscarded={handleDiscarded}
                />
              )}
            </div>
          </div>
        </div>
      </AppLayout>
    </>
  );
}

// ── Root export with Snackbar ──────────────────────────────────────────────────

export default function AiStudioPage() {
  return (
    <SnackbarProvider position="top-right" maxSnackbars={4}>
      <AIStudioContent />
    </SnackbarProvider>
  );
}

export const getServerSideProps = getTenantPageProps;
