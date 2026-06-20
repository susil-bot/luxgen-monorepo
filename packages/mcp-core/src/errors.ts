import { LuxgenGraphqlError } from './graphql/client';

export interface McpTextContent {
  type: 'text';
  text: string;
}

export interface McpToolResult {
  content: McpTextContent[];
  isError?: boolean;
}

function redactForProduction(message: string, production: boolean): string {
  if (!production) return message;
  if (message.includes(' at ') && message.includes('.ts:')) {
    return message.split('\n')[0] ?? message;
  }
  return message.split('\n')[0] ?? message;
}

export function formatToolSuccess(data: unknown): McpToolResult {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}

export function formatToolError(error: unknown, production = false): McpToolResult {
  let message: string;
  let code: string | undefined;

  if (error instanceof LuxgenGraphqlError) {
    message = error.message;
    code = error.code;
  } else if (error instanceof Error) {
    message = error.message;
  } else {
    message = String(error);
  }

  const payload: Record<string, unknown> = {
    error: redactForProduction(message, production),
  };
  if (code) payload.code = code;

  return {
    content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }],
    isError: true,
  };
}
