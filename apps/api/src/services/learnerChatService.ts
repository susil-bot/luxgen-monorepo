import { getOllamaUrl } from '@luxgen/config';

export interface LearnerChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface OllamaChatCompletion {
  message?: {
    content?: string;
  };
}

const SYSTEM_PROMPT =
  'You are LuxGen AI, a friendly learning assistant. Help learners understand concepts, plan study sessions, and stay motivated. Do not claim to access private account data, courses, grades, or files unless the user provides that information. Keep answers practical, concise, and encouraging.';

export class LearnerChatService {
  async respond(messages: LearnerChatMessage[]): Promise<string> {
    const response = await fetch(`${getOllamaUrl()}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.OLLAMA_MODEL || 'qwen2.5-coder:7b',
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
        stream: false,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Learner chat model request failed (${response.status})`);
    }

    const payload = (await response.json()) as { choices?: OllamaChatCompletion[] };
    const content = payload.choices?.[0]?.message?.content?.trim();
    if (!content) throw new Error('Learner chat model returned an empty response');
    return content;
  }
}

export const learnerChatService = new LearnerChatService();
