export type AgentEventType = 'text' | 'tool_start' | 'tool_result' | 'file_staged' | 'error' | 'done' | 'heartbeat';

export interface AgentEvent {
  type: AgentEventType;
  [key: string]: unknown;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface RunAgentLoopOptions {
  sessionId: string;
  messages: ChatMessage[];
  ollamaHost: string;
  model?: string;
  /** When true, `model` was already resolved via findAvailableModel — skip Ollama tags lookup. */
  modelResolved?: boolean;
  /** Preferred model name before fallback resolution (for user-facing fallback notice). */
  preferredModel?: string;
  modelFromFallback?: boolean;
  temperature?: number;
  maxTokens?: number;
  toolFilter?: string[];
  systemPrompt?: string;
  onEvent: (event: AgentEvent) => void;
  shouldCancel?: () => boolean;
}

export interface RunAgentLoopResult {
  sessionId: string;
  cancelled: boolean;
}
