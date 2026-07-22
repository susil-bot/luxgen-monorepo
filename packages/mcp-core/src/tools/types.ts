import type { LuxgenMcpConfig, McpScope } from '../config';

export type ToolConfig = Pick<LuxgenMcpConfig, 'tenant' | 'production' | 'keyId'> & {
  scopes: McpScope[];
};

export type JsonSchema = {
  type: 'object';
  properties?: Record<string, unknown>;
  required?: string[];
  additionalProperties?: boolean;
};

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: JsonSchema;
}

export type ToolContent = { content: { type: 'text'; text: string }[]; isError?: boolean };
