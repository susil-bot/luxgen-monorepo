import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AIStudioSidekickFooter } from '@luxgen/ui';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolEvents?: ToolEvent[];
  timestamp: number;
}

export interface ToolEvent {
  id: string;
  name: string;
  input: Record<string, unknown>;
  result?: string;
  status: 'running' | 'done';
}

interface AgentChatProps {
  sessionId: string;
  onFileStaged: (path: string, type: string, description: string) => void;
  onSessionChange?: () => void;
  // Optional config forwarded to /api/agent/chat
  model?: string;
  temperature?: number;
  maxTokens?: number;
  toolFilter?: string[];
  systemPrompt?: string;
  /** `sidekick` = Shopify Sidekick docked panel (compact messages + footer input). */
  layout?: 'default' | 'sidekick';
}

const TOOL_ICONS: Record<string, string> = {
  read_file: '📄',
  list_files: '📁',
  write_file: '✏️',
  delete_file: '🗑️',
  search_code: '🔍',
  read_automation_schema: '⚙️',
  rename_file: '📦',
  run_command: '▶️',
  fetch_url: '🌐',
  read_project_config: '📋',
};

function ToolBadge({ event }: { event: ToolEvent }) {
  const icon = TOOL_ICONS[event.name] || '🔧';
  const label =
    event.name === 'write_file'
      ? `Staging ${event.input.path?.split('/').pop()}`
      : event.name === 'delete_file'
        ? `Deleting ${event.input.path?.split('/').pop()}`
        : event.name === 'read_file'
          ? `Reading ${event.input.path?.split('/').pop()}`
          : event.name === 'list_files'
            ? `Listing ${event.input.path}`
            : event.name === 'search_code'
              ? `Searching "${event.input.query}"`
              : event.name === 'read_automation_schema'
                ? 'Reading automation schema'
                : event.name;

  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium my-1 animate-fade-in"
      style={{
        backgroundColor: event.status === 'running' ? 'rgba(0,122,255,0.1)' : 'var(--color-fill-quaternary)',
        color: event.status === 'running' ? 'var(--color-blue)' : 'var(--color-label-secondary)',
        border: `1px solid ${event.status === 'running' ? 'rgba(0,122,255,0.2)' : 'var(--color-separator)'}`,
      }}
    >
      <span>{icon}</span>
      <span>{label}</span>
      {event.status === 'running' && (
        <span className="animate-spin-ios inline-block w-3 h-3 border border-current rounded-full border-t-transparent ml-auto" />
      )}
      {event.status === 'done' && <span className="ml-auto text-green-500">✓</span>}
    </div>
  );
}

function MessageBubble({ message, layout = 'default' }: { message: ChatMessage; layout?: 'default' | 'sidekick' }) {
  const isUser = message.role === 'user';

  if (layout === 'sidekick') {
    return (
      <div className={`lux-sidekick-msg ${isUser ? 'lux-sidekick-msg--user' : 'lux-sidekick-msg--agent'}`}>
        {message.toolEvents && message.toolEvents.length > 0 && (
          <div className="lux-sidekick-tools">
            {message.toolEvents.map((e) => (
              <ToolBadge key={e.id} event={e} />
            ))}
          </div>
        )}
        {message.content && <div className="lux-sidekick-msg-content">{message.content}</div>}
      </div>
    );
  }
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-slide-up`}>
      {!isUser && (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mr-2 mt-0.5"
          style={{ backgroundColor: 'var(--color-blue)' }}
        >
          AI
        </div>
      )}
      <div className={`max-w-[85%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        {/* Tool events */}
        {message.toolEvents && message.toolEvents.length > 0 && (
          <div className="w-full mb-2">
            {message.toolEvents.map((e) => (
              <ToolBadge key={e.id} event={e} />
            ))}
          </div>
        )}
        {/* Content */}
        {message.content && (
          <div
            className="px-4 py-3 text-sm leading-relaxed"
            style={{
              backgroundColor: isUser ? 'var(--color-blue)' : 'var(--color-bg-secondary)',
              color: isUser ? '#FFFFFF' : 'var(--color-label-primary)',
              borderRadius: isUser
                ? 'var(--radius-lg) var(--radius-sm) var(--radius-lg) var(--radius-lg)'
                : 'var(--radius-sm) var(--radius-lg) var(--radius-lg) var(--radius-lg)',
              border: isUser ? 'none' : '1px solid var(--color-separator)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {message.content}
          </div>
        )}
        <span className="text-xs text-tertiary mt-1 px-1">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}

export default function AgentChat({
  sessionId,
  onFileStaged,
  onSessionChange,
  model,
  temperature,
  maxTokens,
  toolFilter,
  systemPrompt,
  layout = 'default',
}: AgentChatProps) {
  const [streamError, setStreamError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!isStreaming) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') abortRef.current?.abort();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isStreaming]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load persisted messages or show welcome
  useEffect(() => {
    let cancelled = false;

    const welcome: ChatMessage = {
      id: 'welcome',
      role: 'assistant',
      content:
        layout === 'sidekick'
          ? "Hi! I'm your LuxGen assistant.\n\nAsk about customers, orders, products, or describe a feature you want to build — I'll read the codebase and stage changes for your review."
          : "👋 Hi! I'm LuxGen Dev Agent.\n\nDescribe what you want to build — a new page, a feature, a component, or a backend endpoint. I'll read the codebase, write the code, and show you exactly what I'm going to change before anything is applied.",
      timestamp: Date.now(),
    };

    const load = async () => {
      try {
        const res = await fetch(`/api/agent/stage?sessionId=${encodeURIComponent(sessionId)}`);
        if (!res.ok) throw new Error('load failed');
        const session = await res.json();
        if (cancelled) return;
        if (session.messages?.length) {
          setMessages(
            session.messages.map(
              (m: { role: 'user' | 'assistant'; content: string; timestamp: number }, i: number) => ({
                id: `loaded-${m.timestamp}-${i}`,
                role: m.role,
                content: m.content,
                timestamp: m.timestamp,
              }),
            ),
          );
        } else {
          setMessages([welcome]);
        }
      } catch {
        if (!cancelled) setMessages([welcome]);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [sessionId, layout]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const assistantMsg: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: '',
      toolEvents: [],
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput('');
    setIsStreaming(true);

    const allMessages = [
      ...messages.filter((m) => m.id !== 'welcome').map((m) => ({ role: m.role, content: m.content })),
      { role: 'user' as const, content: text },
    ];

    abortRef.current = new AbortController();

    try {
      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: allMessages,
          sessionId,
          ...(model && { model }),
          ...(temperature !== undefined && { temperature }),
          ...(maxTokens !== undefined && { maxTokens }),
          ...(toolFilter && { toolFilter }),
          ...(systemPrompt && { systemPrompt }),
        }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) {
        setStreamError('Connection lost — try sending again.');
        const err = await response.json();
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantMsg.id ? { ...m, content: `Error: ${err.error}` } : m)),
        );
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

            if (event.type === 'text') {
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantMsg.id ? { ...m, content: m.content + event.content } : m)),
              );
            } else if (event.type === 'tool_start') {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsg.id
                    ? {
                        ...m,
                        toolEvents: [
                          ...(m.toolEvents || []),
                          { id: event.toolId, name: event.name, input: event.input, status: 'running' },
                        ],
                      }
                    : m,
                ),
              );
            } else if (event.type === 'tool_result') {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsg.id
                    ? {
                        ...m,
                        toolEvents: (m.toolEvents || []).map((t) =>
                          t.id === event.toolId ? { ...t, result: event.result, status: 'done' } : t,
                        ),
                      }
                    : m,
                ),
              );
            } else if (event.type === 'file_staged') {
              onFileStaged(event.path, event.stagedType ?? 'modified', event.description);
              onSessionChange?.();
            }
          } catch {}
        }
      }
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id ? { ...m, content: m.content || `Connection error: ${e.message}` } : m,
          ),
        );
      }
    } finally {
      setIsStreaming(false);
    }
  }, [input, isStreaming, messages, sessionId, onFileStaged, onSessionChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isSidekick = layout === 'sidekick';

  return (
    <div className={isSidekick ? 'lux-sidekick-chat' : 'flex flex-col h-full'}>
      {streamError && (
        <div
          role="alert"
          className="mx-4 mt-2 p-3 text-sm rounded-lg flex items-center justify-between gap-3"
          style={{ background: 'rgba(255,59,48,0.12)', color: 'var(--color-red)' }}
        >
          <span>{streamError}</span>
          <button
            type="button"
            className="ios-btn-secondary text-xs py-1 px-2"
            onClick={() => {
              setStreamError(null);
              void sendMessage();
            }}
          >
            Reconnect
          </button>
        </div>
      )}
      {/* Messages */}
      <div className={isSidekick ? 'lux-sidekick-messages' : 'flex-1 overflow-y-auto px-4 py-4'}>
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} layout={layout} />
        ))}
        {isStreaming && messages[messages.length - 1]?.content === '' && (
          <div className="flex items-center gap-2 px-4 py-2">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: 'var(--color-label-tertiary)',
                    animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {isSidekick ? (
        <AIStudioSidekickFooter
          value={input}
          onChange={setInput}
          onSubmit={sendMessage}
          disabled={isStreaming}
          placeholder="Ask anything…"
        />
      ) : (
        <div
          className="p-4 border-t"
          style={{ borderColor: 'var(--color-separator)', backgroundColor: 'var(--color-bg-secondary)' }}
        >
          <div className="flex items-end gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe what you want to build… (Enter to send, Shift+Enter for new line)"
              rows={2}
              className="flex-1 resize-none input-field"
              disabled={isStreaming}
              style={{ minHeight: '56px', maxHeight: 'min(40vh, 160px)' }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isStreaming}
              className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white transition-all"
              style={{
                backgroundColor: !input.trim() || isStreaming ? 'var(--color-fill-secondary)' : 'var(--color-blue)',
                color: !input.trim() || isStreaming ? 'var(--color-label-tertiary)' : 'white',
              }}
            >
              {isStreaming ? (
                <div className="w-4 h-4 border-2 border-current rounded-full border-t-transparent animate-spin-ios" />
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              )}
            </button>
          </div>
          {isStreaming && <p className="text-xs text-tertiary mt-2">Agent is working… Press Escape to stop.</p>}
        </div>
      )}
    </div>
  );
}
