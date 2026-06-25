import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  {
    test: {
      name: 'api-auto',
      include: ['apps/api/src/vitest-auto/**/*.test.ts'],
      environment: 'node',
    },
  },
  {
    test: {
      name: 'web-auto',
      include: ['apps/web/lib/vitest-auto/**/*.test.ts'],
      environment: 'jsdom',
      setupFiles: ['packages/test-harness/src/setup-dom.ts'],
    },
  },
  {
    test: {
      name: 'ui-auto',
      include: ['packages/ui/src/vitest-auto/**/*.test.ts'],
      environment: 'jsdom',
      setupFiles: ['packages/test-harness/src/setup-dom.ts'],
    },
  },
  {
    test: {
      name: 'billing-auto',
      include: ['packages/billing/src/vitest-auto/**/*.test.ts'],
      environment: 'node',
    },
  },
  {
    test: {
      name: 'agent-auto',
      include: ['packages/agent/src/vitest-auto/**/*.test.ts'],
      environment: 'node',
    },
  },
  {
    test: {
      name: 'mcp-auto',
      include: ['packages/mcp-core/src/vitest-auto/**/*.test.ts'],
      environment: 'node',
    },
  },
  {
    test: {
      name: 'worker-auto',
      include: ['apps/agent-worker/src/vitest-auto/**/*.test.ts'],
      environment: 'node',
    },
  },
]);
