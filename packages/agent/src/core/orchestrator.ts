import { AGENT_TOOLS_OPENAI } from '../tools/definitions';
import { executeToolWithTimeout } from '../tools/execute';
import { SYSTEM_PROMPT } from '../prompts/system';
import { findAvailableModel } from '../providers/ollama';
import {
  MAX_CONSECUTIVE_TOOL_ONLY,
  MAX_CONTEXT_CHARS,
  MAX_ITERATIONS,
  MAX_TOOL_CALLS_PER_RESPONSE,
  MAX_TOTAL_TOOL_CALLS,
} from '../config/limits';
import type { RunAgentLoopOptions, RunAgentLoopResult } from '../types/events';

interface OllamaMessage {
  role: string;
  content: string | null;
  tool_calls?: Array<{
    id: string;
    type: string;
    function: { name: string; arguments: string };
  }>;
  tool_call_id?: string;
}

interface ToolCallAccum {
  id: string;
  name: string;
  arguments: string;
}

export async function runAgentLoop(options: RunAgentLoopOptions): Promise<RunAgentLoopResult> {
  const {
    sessionId,
    messages,
    ollamaHost,
    model: requestedModel,
    temperature: requestedTemp,
    maxTokens: requestedMaxTokens,
    toolFilter,
    systemPrompt: requestedSystem,
    onEvent,
    shouldCancel,
  } = options;

  const defaultModel = process.env.OLLAMA_MODEL || 'qwen2.5-coder:7b';
  const requestedModelVal = requestedModel || defaultModel;
  const temperature = typeof requestedTemp === 'number' ? requestedTemp : 0.0;
  const numCtx = typeof requestedMaxTokens === 'number' ? requestedMaxTokens : 32768;

  let activeModel = requestedModelVal;
  let usingFallback = false;

  const availableModel = await findAvailableModel(ollamaHost, requestedModelVal);
  if (availableModel) {
    activeModel = availableModel.model;
    usingFallback = availableModel.fromFallback;
  }

  if (usingFallback) {
    onEvent({
      type: 'text',
      content: `_[Using model: ${activeModel} (fallback — preferred model "${requestedModelVal}" not available)]_\n\n`,
    });
  }

  const activeTools = toolFilter
    ? AGENT_TOOLS_OPENAI.filter((t) => toolFilter.includes(t.function.name))
    : AGENT_TOOLS_OPENAI;

  const systemContent = requestedSystem || SYSTEM_PROMPT;

  let currentMessages: OllamaMessage[] = [
    { role: 'system', content: systemContent },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  let iterations = 0;
  let totalToolCalls = 0;
  let consecutiveToolOnly = 0;
  let cancelled = false;

  try {
    while (iterations < MAX_ITERATIONS) {
      iterations++;

      if (shouldCancel?.()) {
        cancelled = true;
        break;
      }

      const totalChars = JSON.stringify(currentMessages).length;
      if (totalChars > MAX_CONTEXT_CHARS) {
        const systemMsg = currentMessages[0];
        const lastMessages = currentMessages.slice(-6);
        currentMessages = [systemMsg, ...lastMessages];
        onEvent({ type: 'text', content: '\n\n_[Context window optimized — older messages trimmed]_' });
      }

      const response = await fetch(`${ollamaHost}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: activeModel,
          messages: currentMessages,
          tools: activeTools.length > 0 ? activeTools : undefined,
          stream: true,
          options: {
            temperature,
            num_ctx: numCtx,
          },
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        onEvent({ type: 'error', message: `Ollama error ${response.status}: ${err}` });
        break;
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let streamBuffer = '';
      let textContent = '';
      const toolCalls: Record<number, ToolCallAccum> = {};

      while (true) {
        if (shouldCancel?.()) {
          cancelled = true;
          break;
        }

        const { done, value } = await reader.read();
        if (done) break;

        streamBuffer += decoder.decode(value, { stream: true });
        const lines = streamBuffer.split('\n');
        streamBuffer = lines.pop() || '';

        for (const line of lines) {
          if (line === 'data: [DONE]') break;
          if (!line.startsWith('data: ')) continue;

          let chunk: {
            choices?: Array<{
              delta?: {
                content?: string;
                tool_calls?: Array<{
                  index?: number;
                  id?: string;
                  function?: { name?: string; arguments?: string };
                }>;
              };
              finish_reason?: string;
            }>;
          };
          try {
            chunk = JSON.parse(line.slice(6));
          } catch {
            continue;
          }

          const choice = chunk.choices?.[0];
          if (!choice) continue;

          const delta = choice.delta;

          if (delta?.content) {
            textContent += delta.content;
            onEvent({ type: 'text', content: delta.content });
          }

          if (delta?.tool_calls) {
            for (const tc of delta.tool_calls) {
              const idx = typeof tc.index === 'number' ? tc.index : 0;
              if (!toolCalls[idx]) toolCalls[idx] = { id: '', name: '', arguments: '' };
              if (tc.id) toolCalls[idx].id = tc.id;
              if (tc.function?.name) toolCalls[idx].name += tc.function.name;
              if (tc.function?.arguments) toolCalls[idx].arguments += tc.function.arguments;
            }
          }
        }
      }

      if (cancelled) break;

      let toolCallArr = Object.values(toolCalls).filter((tc) => tc.name);

      if (toolCallArr.length > MAX_TOOL_CALLS_PER_RESPONSE) {
        onEvent({
          type: 'text',
          content: `\n\n_[⚠️ Model attempted ${toolCallArr.length} parallel tool calls (max: ${MAX_TOOL_CALLS_PER_RESPONSE}). Executing only the first ${MAX_TOOL_CALLS_PER_RESPONSE}.]_`,
        });
        toolCallArr = toolCallArr.slice(0, MAX_TOOL_CALLS_PER_RESPONSE);
      }

      if (toolCallArr.length > 0 && !textContent.trim()) {
        consecutiveToolOnly++;
        if (consecutiveToolOnly >= MAX_CONSECUTIVE_TOOL_ONLY) {
          onEvent({
            type: 'error',
            message: `Agent appears stuck in a tool-calling loop (${consecutiveToolOnly} consecutive tool-only responses). Stopping.`,
          });
          break;
        }
      } else {
        consecutiveToolOnly = 0;
      }

      totalToolCalls += toolCallArr.length;
      if (totalToolCalls > MAX_TOTAL_TOOL_CALLS) {
        onEvent({
          type: 'error',
          message: `Exceeded maximum of ${MAX_TOTAL_TOOL_CALLS} tool calls per message. Stopping.`,
        });
        break;
      }

      if (toolCallArr.length > 0) {
        const toolMessages: OllamaMessage[] = [];

        for (const tc of toolCallArr) {
          let input: Record<string, unknown> = {};
          try {
            input = JSON.parse(tc.arguments) as Record<string, unknown>;
          } catch {
            // empty input
          }

          onEvent({ type: 'tool_start', toolId: tc.id, name: tc.name, input });

          const toolResult = await executeToolWithTimeout(tc.name, input, sessionId);

          if (tc.name === 'write_file') {
            try {
              const parsed = JSON.parse(toolResult) as {
                staged?: boolean;
                path?: string;
                type?: string;
                error?: boolean;
                message?: string;
              };
              if (parsed.staged) {
                onEvent({
                  type: 'file_staged',
                  path: parsed.path,
                  stagedType: parsed.type,
                  description: input.description,
                });
              } else if (parsed.error) {
                onEvent({ type: 'text', content: `\n\n_[⚠️ ${parsed.message}]_` });
              }
            } catch {
              // not JSON
            }
          }

          onEvent({
            type: 'tool_result',
            toolId: tc.id,
            name: tc.name,
            result: toolResult.length > 500 ? toolResult.slice(0, 500) + '…' : toolResult,
          });

          toolMessages.push({
            role: 'tool',
            tool_call_id: tc.id || `call_${tc.name}_${Date.now()}`,
            content: toolResult,
          });
        }

        currentMessages = [
          ...currentMessages,
          {
            role: 'assistant',
            content: textContent || null,
            tool_calls: toolCallArr.map((tc) => ({
              id: tc.id || `call_${tc.name}`,
              type: 'function',
              function: { name: tc.name, arguments: tc.arguments },
            })),
          },
          ...toolMessages,
        ];
      } else {
        break;
      }
    }

    onEvent({ type: 'done', sessionId });
  } catch (e: unknown) {
    if (!cancelled) {
      const message = e instanceof Error ? e.message : String(e);
      onEvent({ type: 'error', message });
    }
  }

  return { sessionId, cancelled };
}
