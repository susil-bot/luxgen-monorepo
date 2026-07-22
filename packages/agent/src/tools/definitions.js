'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.AGENT_TOOLS_OPENAI = exports.AGENT_TOOLS = void 0;
exports.AGENT_TOOLS = [
  {
    name: 'read_file',
    description:
      'Read the contents of a file from the LuxGen codebase. Use relative paths from the monorepo root (e.g. "apps/web/pages/groups/index.tsx" or "packages/ui/src/Layout/AppLayout.tsx").',
    input_schema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Relative path from monorepo root' },
      },
      required: ['path'],
    },
  },
  {
    name: 'list_files',
    description: 'List files in a directory of the LuxGen codebase.',
    input_schema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Relative directory path from monorepo root' },
        recursive: { type: 'boolean', description: 'Whether to list recursively', default: false },
      },
      required: ['path'],
    },
  },
  {
    name: 'write_file',
    description:
      'Stage a new or modified file. The file goes into a STAGING AREA — the user must approve before it is applied to the real codebase. Always write complete file content.',
    input_schema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Relative file path from monorepo root (e.g. "apps/web/pages/newpage.tsx")',
        },
        content: { type: 'string', description: 'Complete file content' },
        description: { type: 'string', description: 'Short description of what this file does / what changed' },
      },
      required: ['path', 'content', 'description'],
    },
  },
  {
    name: 'search_code',
    description: 'Search for a string or pattern across the codebase files (simple text search, not regex).',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Text to search for' },
        directory: {
          type: 'string',
          description: 'Optional: limit search to this directory (relative to monorepo root)',
        },
        file_extension: { type: 'string', description: 'Optional: filter by file extension e.g. ".tsx" or ".ts"' },
      },
      required: ['query'],
    },
  },
];
exports.AGENT_TOOLS_OPENAI = exports.AGENT_TOOLS.map((tool) => ({
  type: 'function',
  function: {
    name: tool.name,
    description: tool.description,
    parameters: tool.input_schema,
  },
}));
