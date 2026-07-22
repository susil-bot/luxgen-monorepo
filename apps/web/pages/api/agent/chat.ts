import type { NextApiRequest, NextApiResponse } from 'next';
import {
  runAgentLoop,
  findAvailableModel,
  ensureGitSession,
  bindSessionAuthAsync,
  appendAuditEntry,
  acquireTenantStreamSlot,
  releaseTenantStreamSlot,
  isAgentMessageRateLimited,
  saveSessionMessages,
} from '@luxgen/agent';
import { requireAgentStudio } from '../../../lib/agent-auth';
import { getOllamaUrl } from '@luxgen/config';

type EventType = 'text' | 'tool_start' | 'tool_result' | 'file_staged' | 'error' | 'done' | 'heartbeat';

function sendEvent(res: NextApiResponse, type: EventType, data: Record<string, unknown> = {}) {
  if (res.writableEnded) return;
  res.write(`data: ${JSON.stringify({ type, ...data })}\n\n`);
  (res as NextApiResponse & { flush?: () => void }).flush?.();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const OLLAMA_HOST = getOllamaUrl();
  const DEFAULT_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5-coder:7b';

  const {
    messages,
    sessionId,
    model: requestedModel,
    temperature: requestedTemp,
    maxTokens: requestedMaxTokens,
    toolFilter,
    systemPrompt: requestedSystem,
  } = req.body as {
    messages: Array<{ role: 'user' | 'assistant'; content: string }>;
    sessionId: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    toolFilter?: string[];
    systemPrompt?: string;
  };

  if (!messages || !sessionId) {
    res.status(400).json({ error: 'Missing messages or sessionId' });
    return;
  }

  const auth = await requireAgentStudio(req, res);
  if (!auth) return;

  if (await isAgentMessageRateLimited(auth.userId)) {
    res.status(429).json({
      error: 'Too many agent messages. Please wait a minute before sending more.',
    });
    return;
  }

  const streamSlotAcquired = await acquireTenantStreamSlot(auth.tenantId);
  if (!streamSlotAcquired) {
    res.status(429).json({
      error: 'Too many concurrent agent sessions for this tenant. Try again when a session finishes.',
    });
    return;
  }

  try {
    await bindSessionAuthAsync(sessionId, auth, { mode: 'interactive' });
    await appendAuditEntry({
      sessionId,
      tenantId: auth.tenantId,
      userId: auth.userId,
      action: 'run_started',
      details: { mode: 'interactive' },
    }).catch(() => {});

    const requestedModelVal = requestedModel || DEFAULT_MODEL;
    const available = await findAvailableModel(OLLAMA_HOST, requestedModelVal);
    if (!available) {
      res.status(503).json({
        error: `Ollama not reachable or no models available at ${OLLAMA_HOST}. Run: docker compose up ollama`,
      });
      return;
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.status(200);
    res.flushHeaders();

    let isCancelled = false;
    let responseEnded = false;

    const endResponse = () => {
      if (responseEnded || res.writableEnded) return;
      responseEnded = true;
      res.end();
    };

    const heartbeatInterval = setInterval(() => {
      if (isCancelled) {
        clearInterval(heartbeatInterval);
        return;
      }
      sendEvent(res, 'heartbeat', { ts: Date.now() });
    }, 15_000);

    req.on('close', () => {
      isCancelled = true;
      clearInterval(heartbeatInterval);
      endResponse();
    });

    const connectionTimer = setTimeout(() => {
      if (!isCancelled) {
        isCancelled = true;
        sendEvent(res, 'error', { message: 'Connection timed out after 2 minutes.' });
        endResponse();
      }
    }, 120_000);

    try {
      await ensureGitSession(sessionId);

      let assistantText = '';

      await runAgentLoop({
        sessionId,
        messages,
        ollamaHost: OLLAMA_HOST,
        model: available.model,
        modelResolved: true,
        preferredModel: requestedModelVal,
        modelFromFallback: available.fromFallback,
        temperature: requestedTemp,
        maxTokens: requestedMaxTokens,
        toolFilter,
        systemPrompt: requestedSystem,
        shouldCancel: () => isCancelled,
        onEvent: (event) => {
          if (isCancelled && event.type !== 'done') return;
          if (event.type === 'text' && typeof event.content === 'string') {
            assistantText += event.content;
          }
          const { type, ...rest } = event;
          sendEvent(res, type as EventType, rest);
        },
      });

      if (!isCancelled && assistantText.trim()) {
        const lastUser = [...messages].reverse().find((m) => m.role === 'user');
        const turns: Array<{ role: 'user' | 'assistant'; content: string }> = [];
        if (lastUser) turns.push(lastUser);
        turns.push({ role: 'assistant', content: assistantText });
        saveSessionMessages(sessionId, turns);
      }
    } finally {
      clearInterval(heartbeatInterval);
      clearTimeout(connectionTimer);
      endResponse();
    }
  } finally {
    await releaseTenantStreamSlot(auth.tenantId);
  }
}
