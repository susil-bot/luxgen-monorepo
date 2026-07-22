export const MCP_KEY_CONTEXT = `
  query McpKeyContext {
    mcpKeyContext {
      keyId
      tenantId
      name
      scopes
    }
  }
`;

export const RECORD_MCP_TOOL_AUDIT = `
  mutation RecordMcpToolAudit($input: RecordMcpToolAuditInput!) {
    recordMcpToolAudit(input: $input)
  }
`;

export interface McpKeyContextResult {
  mcpKeyContext: {
    keyId: string;
    tenantId: string;
    name: string;
    scopes: string[];
  } | null;
}

export interface RecordMcpToolAuditInput {
  tenantId: string;
  tool: string;
  success: boolean;
  durationMs: number;
  error?: string;
}
