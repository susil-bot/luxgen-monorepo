export type McpScope = 'read' | 'write';

/** Tools that mutate tenant data — require write scope when using API keys. */
export const MCP_WRITE_TOOLS = new Set([
  'create_automation',
  'update_automation_flow',
  'toggle_automation',
  'delete_automation',
  'run_agent_task',
]);

export function toolRequiresWrite(toolName: string): boolean {
  return MCP_WRITE_TOOLS.has(toolName);
}

export function isToolAllowed(toolName: string, scopes: McpScope[]): boolean {
  if (scopes.includes('write')) return true;
  if (toolRequiresWrite(toolName)) return false;
  return scopes.includes('read');
}

export function filterToolsByScope<T extends { name: string }>(tools: T[], scopes: McpScope[]): T[] {
  return tools.filter((t) => isToolAllowed(t.name, scopes));
}
