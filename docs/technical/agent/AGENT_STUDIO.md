# LuxGen Agent Studio — Full Technical Documentation

Complete reference for the AI developer agent embedded in LuxGen. Covers the model context system, transparency layer, scalability design, all APIs, environment variables, and extension points.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Quick Start](#2-quick-start)
3. [Architecture Map](#3-architecture-map)
4. [Model Context System](#4-model-context-system)
   - 4.1 [System Prompt](#41-system-prompt)
   - 4.2 [Tool System](#42-tool-system)
   - 4.3 [Agentic Loop](#43-agentic-loop)
   - 4.4 [Context Window Management](#44-context-window-management)
   - 4.5 [Model Configuration](#45-model-configuration)
5. [Transparency Layer](#5-transparency-layer)
   - 5.1 [Staging System](#51-staging-system)
   - 5.2 [Session Lifecycle](#52-session-lifecycle)
   - 5.3 [Diff Engine](#53-diff-engine)
   - 5.4 [Apply & Discard Flow](#54-apply--discard-flow)
6. [Scalability Design](#6-scalability-design)
   - 6.1 [Session Isolation](#61-session-isolation)
   - 6.2 [File-System State](#62-file-system-state)
   - 6.3 [Model Layer Scaling](#63-model-layer-scaling)
   - 6.4 [Extending Tools](#64-extending-tools)
   - 6.5 [Swapping Models](#65-swapping-models)
7. [API Reference](#7-api-reference)
8. [Component Reference](#8-component-reference)
9. [Environment Variables](#9-environment-variables)
10. [Docker Services](#10-docker-services)
11. [File Structure](#11-file-structure)
12. [Data Schemas](#12-data-schemas)
13. [Extending the Agent](#13-extending-the-agent)
14. [Troubleshooting](#14-troubleshooting)

---

## 1. Overview

Agent Studio is a full-stack AI developer assistant built into LuxGen at `/agent`. It allows any team member — regardless of coding experience — to describe a feature in plain English, watch the AI read the actual codebase, and review every line it proposes to write before anything is applied.

**Core design principle:** The agent can never modify the live codebase without explicit user approval. Every file write goes to a staging area first.

**Key capabilities:**

| Capability                                                   | How                              |
| ------------------------------------------------------------ | -------------------------------- |
| Read any file in the monorepo                                | `read_file` tool                 |
| Browse directory structure                                   | `list_files` tool                |
| Search across the codebase                                   | `search_code` tool               |
| Propose file changes (staged)                                | `write_file` tool → staging area |
| Show a unified diff of every change                          | Transparency panel               |
| Apply all changes at once                                    | `POST /api/agent/apply`          |
| Discard changes without touching code                        | `DELETE /api/agent/stage`        |
| Runs 100% locally — no API keys, no data leaves your machine | Ollama + Qwen2.5-Coder:7b        |

---

## 2. Quick Start

### Start Ollama and download the model (one time, ~4.7 GB)

```bash
# 1. Start the Ollama container
docker compose up ollama -d

# 2. Pull the model (Qwen2.5-Coder 7B — best small coding model)
#    This takes a few minutes on first run. The model is cached in a Docker volume.
docker compose up ollama-model-pull

# 3. Verify Ollama is ready
curl http://localhost:11434/api/tags
# Should list: qwen2.5-coder:7b

# 4. Start the full LuxGen stack
docker compose up -d

# 5. Open Agent Studio
open http://localhost:3000/agent
```

### Without Docker (host Ollama)

```bash
# Install Ollama from https://ollama.ai
ollama pull qwen2.5-coder:7b

# Then start the LuxGen web app (with turbo or next dev)
cd apps/web
npm run dev
```

### After startup the banner in Agent Studio will show:

- **Green / no banner** — Ollama running and model ready, start chatting
- **Yellow banner** — Ollama is running but model not yet downloaded, run the pull command shown
- **Red banner** — Ollama is not reachable, run `docker compose up ollama -d`

---

## 3. Architecture Map

```
Browser (/agent)
│
├── AgentChat.tsx          — Chat input + streaming message display
│   └── SSE stream ──────→ POST /api/agent/chat
│                               │
│                    ┌──────────┴──────────────────┐
│                    │   Agentic Loop (max 10 iter) │
│                    │                              │
│                    │  Ollama API (streaming)       │
│                    │  http://localhost:11434       │
│                    │  model: qwen2.5-coder:7b     │
│                    │                              │
│                    │  Tool execution (server-side)│
│                    │  ├─ read_file  → real fs     │
│                    │  ├─ list_files → real fs     │
│                    │  ├─ search_code→ real fs     │
│                    │  └─ write_file → .agent-staging/{sessionId}.json
│                    └──────────────────────────────┘
│
├── AgentTransparency.tsx  — Staged file tree + diff viewer
│   ├── GET  /api/agent/stage?sessionId=...  (poll for updates)
│   ├── POST /api/agent/apply  { sessionId } (write to real fs)
│   └── DELETE /api/agent/stage?sessionId=... (discard)
│
└── /api/agent/health      — Ollama connectivity + model check
```

**Data flow for a single agent turn:**

```
User types: "add a leaderboard page"
    │
    ▼
AgentChat → POST /api/agent/chat
    │
    ▼ (SSE stream opens)
Ollama generates: calls list_files("apps/web/pages") → reads existing pages
    │  ← SSE: tool_start event → ToolBadge "📁 Listing apps/web/pages"
    ▼
executeTool("list_files") runs on Node.js server, returns file list
    │  ← SSE: tool_result event → ToolBadge turns ✓
    ▼
Ollama reads dashboard.tsx as reference → calls read_file
    │  ← SSE: tool_start event → ToolBadge "📄 Reading dashboard.tsx"
    ▼
Ollama generates leaderboard.tsx → calls write_file
    │  writes to .agent-staging/{sessionId}.json
    │  ← SSE: file_staged event → AgentTransparency refreshes
    ▼
SSE: done event
AgentTransparency shows diff, user clicks "Apply All"
    │
    ▼
POST /api/agent/apply → files written to real apps/web/pages/leaderboard.tsx
```

---

## 4. Model Context System

### 4.1 System Prompt

The system prompt is defined in `apps/web/lib/agent.ts` as `SYSTEM_PROMPT`. It gives the model a complete mental model of LuxGen before any conversation begins.

**What the system prompt encodes:**

| Section               | Purpose                                                                                |
| --------------------- | -------------------------------------------------------------------------------------- |
| Identity              | "You are LuxGen Dev Agent — an expert full-stack developer…"                           |
| Mission               | Explains staging area, user approval requirement                                       |
| Frontend architecture | Next.js 14 Pages Router, TypeScript, Tailwind, directory layout                        |
| UI package exports    | AppLayout, getDefaultSidebarSections, SnackbarProvider, etc.                           |
| iOS design system     | All CSS custom properties, utility classes, radius scale                               |
| Page pattern          | Exact code template every new page must follow                                         |
| Rules                 | 7 strict rules (read before write, iOS variables only, no premature abstraction, etc.) |

**System prompt is passed as the first message in OpenAI format:**

```typescript
currentMessages = [{ role: 'system', content: SYSTEM_PROMPT }, ...userMessages];
```

This is important: Ollama's OpenAI-compatible endpoint accepts system as a message, unlike Anthropic which takes it as a separate field.

**Why the page pattern matters:** Without it, the model generates pages that don't use `AppLayout`, miss `SnackbarProvider`, or use hardcoded Tailwind colors instead of CSS variables. The pattern enforces architectural consistency automatically.

### 4.2 Tool System

Tools give the model the ability to act on the real codebase. There are two formats maintained in `agent.ts`:

**Anthropic format** (`AGENT_TOOLS`) — kept for reference/future use:

```typescript
{
  name: 'read_file',
  description: '...',
  input_schema: { type: 'object', properties: { path: ... }, required: ['path'] }
}
```

**OpenAI/Ollama format** (`AGENT_TOOLS_OPENAI`) — used by the chat endpoint:

```typescript
{
  type: 'function',
  function: {
    name: 'read_file',
    description: '...',
    parameters: { type: 'object', properties: { path: ... }, required: ['path'] }
  }
}
```

`AGENT_TOOLS_OPENAI` is derived automatically:

```typescript
export const AGENT_TOOLS_OPENAI = AGENT_TOOLS.map((tool) => ({
  type: 'function' as const,
  function: {
    name: tool.name,
    description: tool.description,
    parameters: tool.input_schema,
  },
}));
```

**The four tools:**

| Tool          | What it does                                                                                                     | Safety      |
| ------------- | ---------------------------------------------------------------------------------------------------------------- | ----------- |
| `read_file`   | Read any file by path relative to monorepo root. Truncates at 8,000 chars.                                       | Read-only   |
| `list_files`  | List a directory, optionally recursive. Skips `node_modules`, `.next`, `dist`, `.git`, `.agent-staging`.         | Read-only   |
| `search_code` | Text search across files with optional directory and extension filter. Returns up to 50 matches, 120 chars each. | Read-only   |
| `write_file`  | Writes to `.agent-staging/{sessionId}.json` ONLY — never to the real filesystem.                                 | Staged only |

**Tool execution runs entirely server-side** in `pages/api/agent/chat.ts`. The browser never touches the filesystem directly.

### 4.3 Agentic Loop

The chat endpoint runs a loop of up to 10 iterations per user message. Each iteration is one Ollama call.

```
Iteration 1:
  Input:  [system, user: "add leaderboard page"]
  Output: [tool_call: list_files("apps/web/pages")]
  → Execute tool, collect result

Iteration 2:
  Input:  [system, user, assistant+tool_calls, tool_results]
  Output: [tool_call: read_file("apps/web/pages/dashboard.tsx")]
  → Execute tool, collect result

Iteration 3:
  Input:  [system, user, assistant+tool_calls, tool_results, assistant+tool_calls, tool_results]
  Output: [tool_call: write_file("apps/web/pages/leaderboard.tsx", content, description)]
  → Stage file, emit file_staged SSE event

Iteration 4:
  Input:  [all previous + staged confirmation]
  Output: [text: "I've created leaderboard.tsx with…"]
  finish_reason: "stop" → loop exits
```

**When the loop exits:**

- `finish_reason === 'stop'` — model is done, no more tool calls
- No tool calls in the response — break
- 10 iterations reached — safety limit

**Message history format (OpenAI):**

```typescript
// After a tool call iteration, messages become:
[
  { role: 'system', content: SYSTEM_PROMPT },
  { role: 'user', content: 'add leaderboard page' },
  {
    role: 'assistant',
    content: null, // null when tool calls are present
    tool_calls: [
      {
        id: 'call_abc',
        type: 'function',
        function: { name: 'list_files', arguments: '{"path":"apps/web/pages"}' },
      },
    ],
  },
  {
    role: 'tool',
    tool_call_id: 'call_abc',
    content: 'apps/web/pages/dashboard.tsx\napps/web/pages/groups/index.tsx\n…',
  },
];
```

### 4.4 Context Window Management

Qwen2.5-Coder:7b has a 128k token context window but runs faster with smaller contexts.

**Configured context in the Ollama request:**

```typescript
options: {
  temperature: 0.1,   // Low temp → deterministic, consistent code
  num_ctx: 32768,     // 32k tokens — enough for large files + full history
}
```

**Built-in limits that protect the context:**

| Limit                   | Value       | Location                   |
| ----------------------- | ----------- | -------------------------- |
| File read truncation    | 8,000 chars | `executeTool("read_file")` |
| Search result limit     | 50 matches  | `searchInDir()`            |
| Per-match text limit    | 120 chars   | `searchInDir()`            |
| File scan limit         | 200 files   | `searchInDir()`            |
| Agentic loop iterations | 10          | `MAX_ITERATIONS` constant  |

**Why 0.1 temperature:** Code generation needs to be deterministic. High temperature causes syntax errors and inconsistent naming. 0.1 gives a small amount of variation while keeping code syntactically correct.

### 4.5 Model Configuration

The model is **Qwen2.5-Coder:7b** — a 7-billion parameter model specifically fine-tuned for code generation. It was chosen because:

- **Tool calling support** — Native function calling via OpenAI-compatible API
- **Code quality** — State-of-the-art at the 7B scale for code generation tasks
- **Size** — 4.7 GB quantized, runs on 8 GB RAM (CPU) or any GPU
- **Free and local** — No API costs, no data leaving the machine
- **Ollama support** — First-class support in Ollama with quantized GGUF weights

**Alternative models (change `OLLAMA_MODEL` env var):**

| Model                    | Size   | Speed  | Quality   | Notes                         |
| ------------------------ | ------ | ------ | --------- | ----------------------------- |
| `qwen2.5-coder:7b`       | 4.7 GB | Medium | Excellent | Default — best balance        |
| `qwen2.5-coder:1.5b`     | 1.0 GB | Fast   | Good      | For machines with limited RAM |
| `qwen2.5-coder:14b`      | 9.0 GB | Slow   | Best      | If you have 16+ GB RAM        |
| `deepseek-coder-v2:lite` | 9.1 GB | Medium | Excellent | Strong alternative            |
| `codellama:7b`           | 3.8 GB | Fast   | Good      | Meta's model, older           |

To switch model at runtime (no restart needed):

```bash
# Pull the new model
docker exec luxgen-ollama ollama pull qwen2.5-coder:14b

# Set the env var in apps/web/.env.local
OLLAMA_MODEL=qwen2.5-coder:14b

# Restart Next.js (picks up env var change)
```

---

## 5. Transparency Layer

The transparency layer is the fundamental safety guarantee of Agent Studio: **nothing the agent generates can reach the real codebase without your explicit approval.**

### 5.1 Staging System

All staged state lives in a single JSON file per session:

```
apps/web/
└── .agent-staging/
    ├── session-1749123456789-abc123.json
    ├── session-1749123456790-def456.json
    └── ...
```

Each session file has this schema:

```typescript
interface AgentSession {
  id: string;
  files: Record<string, StagedFile>; // keyed by relative file path
  createdAt: number;
  updatedAt: number;
}

interface StagedFile {
  path: string; // e.g. "apps/web/pages/leaderboard.tsx"
  content: string; // complete proposed file content
  originalContent?: string; // read from disk at staging time (undefined = new file)
  type: 'new' | 'modified'; // derived from whether originalContent exists
  description: string; // agent's description of what changed
  stagedAt: number;
}
```

**At staging time**, `stageFile()` in `agent.ts` reads the current file from disk (if it exists) and stores it as `originalContent`. This is what powers the diff viewer — it captures the "before" state at the moment the agent proposes the change.

**Critical:** If you edit the real file between staging and applying, the `originalContent` snapshot becomes stale. The diff may show false positives. Always review diffs carefully before applying.

The `.agent-staging/` directory is automatically created if it does not exist:

```typescript
export function saveSession(session: AgentSession): void {
  const dir = getStagingDir();
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(getSessionPath(session.id), JSON.stringify(session, null, 2));
}
```

**Add `.agent-staging/` to `.gitignore`** — staged files contain generated code that hasn't been reviewed yet and should never be committed:

```
# in apps/web/.gitignore
.agent-staging/
```

### 5.2 Session Lifecycle

Each browser tab that opens `/agent` generates a new session ID:

```typescript
const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
```

This means:

- Two browser tabs = two completely independent sessions with separate staging areas
- Refreshing the page = new session, previous staged files from that session are lost (but the `.json` file remains on disk until the staging dir is cleaned)
- Applying files clears `session.files` but keeps the session file (now empty)

**Session state transitions:**

```
[new session]
     │
     ▼
[files: {}]              ← empty, nothing staged
     │
     │ agent calls write_file
     ▼
[files: { "path/A": {...}, "path/B": {...} }]  ← staged
     │
     ├── "Apply All" → files written to real fs → files: {}
     │
     └── "Discard All" → files: {}
```

### 5.3 Diff Engine

`AgentTransparency.tsx` includes a built-in diff engine — no external dependencies needed.

**Algorithm:** Simplified LCS (Longest Common Subsequence) with an 8-line lookahead:

```typescript
function computeDiff(original: string, modified: string): DiffLine[] {
  const oldLines = original.split('\n');
  const newLines = modified.split('\n');
  // Walk both arrays simultaneously
  // When lines match: emit 'same'
  // When lines differ: look ahead up to 8 lines for next match
  //   - If new content has the match: emit 'add' lines until match
  //   - If old content has the match: emit 'remove' lines until match
  //   - If no match found in 8 lines: emit one 'remove' + one 'add'
}
```

**For new files:** All lines are emitted as `'add'` lines.

**Output:**

```typescript
type DiffLine = {
  type: 'same' | 'add' | 'remove';
  text: string;
  lineNum: number; // line number in the new file
};
```

**Visual rendering:**

| Line type | Background                          | Gutter symbol |
| --------- | ----------------------------------- | ------------- |
| `same`    | transparent                         | (space)       |
| `add`     | `rgba(52,199,89,0.12)` — green tint | `+` in green  |
| `remove`  | `rgba(255,59,48,0.10)` — red tint   | `−` in red    |

The header shows `+N` added and `−N` removed counts derived from the diff output.

**Known limitation:** The 8-line lookahead heuristic works well for most code changes but can produce suboptimal diffs for large refactors where blocks move significantly. For such cases, the diff may show more removes+adds than a true Myers diff would. This does not affect correctness — the content that will be written is always `StagedFile.content`, never derived from the diff.

### 5.4 Apply & Discard Flow

**Apply All (`POST /api/agent/apply`):**

```typescript
export function applySession(sessionId: string): { applied: string[]; errors: string[] } {
  const session = loadSession(sessionId);
  const root = getMonorepoRoot();
  const applied: string[] = [];
  const errors: string[] = [];

  for (const [filePath, staged] of Object.entries(session.files)) {
    try {
      const absPath = path.join(root, filePath);
      fs.mkdirSync(path.dirname(absPath), { recursive: true }); // create dirs if needed
      fs.writeFileSync(absPath, staged.content, 'utf-8');
      applied.push(filePath);
    } catch (e: any) {
      errors.push(`${filePath}: ${e.message}`);
    }
  }

  session.files = {}; // clear staging
  session.updatedAt = Date.now();
  saveSession(session);
  return { applied, errors };
}
```

Key behaviors:

- Creates parent directories automatically (so the agent can propose files in new directories)
- Reports individual errors per file (partial apply is possible)
- Clears staging after apply regardless of errors
- The applied files immediately trigger Next.js hot reload in dev mode

**Discard All (`DELETE /api/agent/stage`):**

```typescript
export function discardSession(sessionId: string): void {
  const session = loadSession(sessionId);
  session.files = {};
  session.updatedAt = Date.now();
  saveSession(session);
}
```

Simply clears `session.files`. The original file on disk is never touched.

---

## 6. Scalability Design

### 6.1 Session Isolation

Every user (browser tab) gets its own session ID and its own staging file. Sessions never share state.

**What this means in practice:**

- **Multiple developers** can use Agent Studio simultaneously — their staged changes are completely independent
- **No locking required** — each session reads/writes only its own `.json` file
- **No conflict** — two agents can stage changes to the same file in different sessions; whichever applies last wins (same as git conflicts)

**Multi-user consideration:** In a team environment, if Developer A and Developer B both stage changes to `apps/web/pages/dashboard.tsx` in separate sessions, whichever applies first will be overwritten by the second. This is intentional — Agent Studio is a development tool, not a concurrent editing system. Use git branching per developer.

### 6.2 File-System State

Agent Studio uses the filesystem for all persistent state — no database table, no Redis key, no external service.

**Advantages:**

- Zero infrastructure for state — the staging directory is just files
- Inspectable with any text editor
- Survives server restarts (sessions persist across Next.js restarts)
- Easy to back up or version

**Cleanup:** Session files accumulate in `.agent-staging/`. Add a cleanup script or cron if long-term operation is needed:

```bash
# Remove session files older than 24 hours
find apps/web/.agent-staging -name "session-*.json" -mtime +1 -delete
```

Or add a cleanup endpoint:

```typescript
// apps/web/pages/api/agent/cleanup.ts
import fs from 'fs';
import path from 'path';
import { getStagingDir } from '../../../lib/agent';

export default function handler(req, res) {
  const dir = getStagingDir();
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  const files = fs.readdirSync(dir);
  let removed = 0;
  for (const f of files) {
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.mtimeMs < cutoff) {
      fs.unlinkSync(full);
      removed++;
    }
  }
  res.json({ removed });
}
```

### 6.3 Model Layer Scaling

**Single Ollama instance** handles one inference request at a time. This is fine for development (one developer at a time) but limits production use.

**Scaling Ollama horizontally:**

```yaml
# docker-compose.scale.yml
services:
  ollama-1:
    image: ollama/ollama:latest
    ports: ['11434:11434']
    volumes: ['ollama_data:/root/.ollama']

  ollama-2:
    image: ollama/ollama:latest
    ports: ['11435:11434']
    volumes: ['ollama_data:/root/.ollama']

  ollama-lb:
    image: nginx:alpine
    ports: ['11434:80']
    volumes: ['./nginx-ollama.conf:/etc/nginx/nginx.conf:ro']
    depends_on: [ollama-1, ollama-2]
```

Then point `OLLAMA_HOST=http://ollama-lb:11434`.

**GPU acceleration:** Ollama auto-detects CUDA/Metal/ROCm. To enable in Docker:

```yaml
# In docker-compose.yml, add to ollama service:
deploy:
  resources:
    reservations:
      devices:
        - driver: nvidia
          count: all
          capabilities: [gpu]
```

With a GPU, Qwen2.5-Coder:7b generates at ~50-100 tokens/second vs ~5-10 tokens/second on CPU.

### 6.4 Extending Tools

All tools are defined in two places in `apps/web/lib/agent.ts`:

1. `AGENT_TOOLS` (Anthropic format — for docs/reference)
2. `AGENT_TOOLS_OPENAI` (auto-derived — sent to Ollama)

And executed in `apps/web/pages/api/agent/chat.ts` in the `executeTool()` function.

**Adding a new tool — example: `run_typecheck`**

Step 1 — Add to `AGENT_TOOLS` in `agent.ts`:

```typescript
{
  name: 'run_typecheck',
  description: 'Run TypeScript type checking on a specific package and return errors.',
  input_schema: {
    type: 'object',
    properties: {
      package: {
        type: 'string',
        description: 'Package to check: "web", "ui", "api"',
        enum: ['web', 'ui', 'api'],
      },
    },
    required: ['package'],
  },
},
```

Step 2 — Add execution in `chat.ts` `executeTool()`:

```typescript
if (name === 'run_typecheck') {
  const { execSync } = require('child_process');
  const root = getMonorepoRoot();
  const dirs: Record<string, string> = {
    web: 'apps/web',
    ui: 'packages/ui',
    api: 'apps/api',
  };
  const dir = path.join(root, dirs[input.package] || 'apps/web');
  try {
    execSync('npx tsc --noEmit 2>&1', { cwd: dir, timeout: 30000 });
    return 'No TypeScript errors found.';
  } catch (e: any) {
    return e.stdout?.toString().slice(0, 3000) || e.message;
  }
}
```

Step 3 — Add a tool badge icon in `AgentChat.tsx`:

```typescript
const TOOL_ICONS: Record<string, string> = {
  read_file: '📄',
  list_files: '📁',
  write_file: '✏️',
  search_code: '🔍',
  run_typecheck: '🔬', // ← add this
};
```

`AGENT_TOOLS_OPENAI` is automatically re-derived from `AGENT_TOOLS` so no changes needed there.

### 6.5 Swapping Models

The model is controlled by the `OLLAMA_MODEL` environment variable. No code changes required to switch models.

```bash
# In apps/web/.env.local
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=qwen2.5-coder:14b
```

**Switching to a remote Ollama instance** (e.g., a GPU server):

```bash
OLLAMA_HOST=http://gpu-server.internal:11434
OLLAMA_MODEL=qwen2.5-coder:14b
```

**Important:** The model must support tool/function calling. Models that do NOT work well with tool calling and should be avoided: `llama2`, `mistral:7b`, `phi3:mini` (older versions). Models that work: any `qwen2.5-coder:*`, `deepseek-coder-v2:*`, `llama3.1:*`, `mistral-nemo`.

---

## 7. API Reference

All endpoints are under `apps/web/pages/api/agent/`.

### `POST /api/agent/chat`

Streams an agent response over Server-Sent Events.

**Request body:**

```typescript
{
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  sessionId: string;
}
```

**SSE event types (streamed response):**

| Event type    | Payload                       | When                                                                                         |
| ------------- | ----------------------------- | -------------------------------------------------------------------------------------------- |
| `text`        | `{ content: string }`         | Each text chunk from the model                                                               |
| `tool_start`  | `{ toolId, name, input }`     | When a tool call begins                                                                      |
| `tool_result` | `{ toolId, name, result }`    | After tool executes (result truncated to 500 chars for the event; full result goes to model) |
| `file_staged` | `{ path, type, description }` | After write_file stages a file                                                               |
| `error`       | `{ message }`                 | On any error                                                                                 |
| `done`        | `{ sessionId }`               | When agent loop finishes                                                                     |

**SSE format:**

```
data: {"type":"text","content":"I'll read the existing pages first..."}\n\n
data: {"type":"tool_start","toolId":"call_abc","name":"list_files","input":{"path":"apps/web/pages"}}\n\n
data: {"type":"tool_result","toolId":"call_abc","name":"list_files","result":"apps/web/pages/dashboard.tsx\n..."}\n\n
data: {"type":"file_staged","path":"apps/web/pages/leaderboard.tsx","type":"new","description":"Leaderboard page"}\n\n
data: {"type":"text","content":"I've staged leaderboard.tsx for your review."}\n\n
data: {"type":"done","sessionId":"session-123-abc"}\n\n
```

**Error responses (JSON, not SSE):**

- `405 Method Not Allowed` — not a POST
- `400 Bad Request` — missing messages or sessionId
- `503 Service Unavailable` — Ollama not reachable

---

### `GET /api/agent/stage?sessionId=<id>`

Returns the full staged session including all files and their content.

**Response:**

```typescript
{
  id: string;
  files: Record<
    string,
    {
      path: string;
      content: string;
      originalContent?: string;
      type: 'new' | 'modified';
      description: string;
      stagedAt: number;
    }
  >;
  createdAt: number;
  updatedAt: number;
}
```

---

### `DELETE /api/agent/stage?sessionId=<id>`

Discards all staged files for a session. Returns `{ ok: true }`.

---

### `POST /api/agent/apply`

Writes all staged files to the real filesystem.

**Request body:**

```typescript
{
  sessionId: string;
}
```

**Response:**

```typescript
{
  applied: string[];  // paths successfully written
  errors: string[];   // "path: error message" for any failures
}
```

---

### `GET /api/agent/health`

Checks Ollama connectivity and model availability.

**Response:**

```typescript
{
  ok: boolean;          // true if Ollama is reachable
  hasModel: boolean;    // true if OLLAMA_MODEL is downloaded
  model: string;        // e.g. "qwen2.5-coder:7b"
  models: string[];     // all models currently in Ollama
}
```

Used by the Agent Studio page to display the status banner on load.

---

## 8. Component Reference

### `AgentChat` (`apps/web/components/agent/AgentChat.tsx`)

**Props:**

```typescript
interface AgentChatProps {
  sessionId: string;
  onFileStaged: (path: string, type: string, description: string) => void;
  onSessionChange?: () => void;
}
```

**Internal state:**

- `messages: ChatMessage[]` — full conversation history (welcome message + all turns)
- `input: string` — current textarea value
- `isStreaming: boolean` — true while SSE stream is open

**Key behaviors:**

- Sends `Enter` to submit (Shift+Enter for newline)
- Aborts streaming on unmount via `AbortController`
- SSE events are parsed and update the last assistant message in place
- Tool events appear as `ToolBadge` components inside the assistant message bubble
- Auto-scrolls to bottom on every message update

**ChatMessage schema:**

```typescript
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string; // accumulated text (empty until text events arrive)
  toolEvents?: ToolEvent[];
  timestamp: number;
}

interface ToolEvent {
  id: string;
  name: string;
  input: Record<string, any>;
  result?: string;
  status: 'running' | 'done';
}
```

---

### `AgentTransparency` (`apps/web/components/agent/AgentTransparency.tsx`)

**Props:**

```typescript
interface AgentTransparencyProps {
  sessionId: string;
  refreshTrigger: number; // increment to force a reload of staged files
  onApplied: (applied: string[]) => void;
  onDiscarded: () => void;
}
```

**Internal state:**

- `session: AgentSession | null` — current staged session from API
- `selectedPath: string | null` — which file's diff is shown in the right panel

**Refresh mechanism:** Parent (`agent.tsx`) increments `refreshTrigger` on every `file_staged` SSE event. The component re-fetches from `GET /api/agent/stage` whenever this prop changes.

**Layout:**

```
┌───────────────────────────────────────────┐
│ Header: "Staged Changes"   [Discard] [✓ Apply All] │
├──────────────┬────────────────────────────┤
│ File tree    │  Diff viewer               │
│              │                            │
│ ● file-a.tsx │  apps/web/pages/file-a.tsx │
│ ● file-b.ts  │  NEW   +45 −0              │
│              │  1  │  + import React...   │
│              │  2  │  + export default... │
│              │    ...                     │
└──────────────┴────────────────────────────┘
```

---

### `agent.tsx` (page) (`apps/web/pages/agent.tsx`)

The `/agent` page. Composes `AgentChat` and `AgentTransparency` into a drag-resizable split layout.

**Session ID generation:** `session-${Date.now()}-${random6chars}` — unique per page load.

**Resize logic:** Mouse drag on the 4px divider updates `rightPanelWidth` (clamped 25–75%). Uses `userSelect: none` during drag to prevent text selection.

**Snackbar events:**

- `showInfo()` — file staged notification
- `showSuccess()` — files applied
- `showInfo()` — changes discarded

---

## 9. Environment Variables

### `apps/web/.env.local`

| Variable       | Default                  | Description                                                                   |
| -------------- | ------------------------ | ----------------------------------------------------------------------------- |
| `OLLAMA_HOST`  | `http://localhost:11434` | Ollama server URL. Change to `http://ollama:11434` when running inside Docker |
| `OLLAMA_MODEL` | `qwen2.5-coder:7b`       | Model to use. Must be pulled in Ollama first                                  |

**Minimal `.env.local` needed to run Agent Studio:**

```bash
# apps/web/.env.local — only needed if defaults don't apply
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=qwen2.5-coder:7b
```

No API keys, no external services, no paid accounts required.

### `apps/api/.env`

The agent system uses no API variables. Existing variables remain unchanged.

---

## 10. Docker Services

### `ollama`

```yaml
image: ollama/ollama:latest
container_name: luxgen-ollama
ports:
  - '11434:11434'
volumes:
  - ollama_data:/root/.ollama # model weights stored here
healthcheck:
  test: ['CMD', 'ollama', 'list']
  interval: 10s
  retries: 10
  start_period: 20s
```

**Port 11434** — Ollama's default. The Next.js API routes call this from the host (or from within Docker if `OLLAMA_HOST=http://ollama:11434`).

**`ollama_data` volume** — Stores the downloaded model weights (~4.7 GB for qwen2.5-coder:7b). Persists across container restarts so you only download once.

### `ollama-model-pull`

```yaml
image: ollama/ollama:latest
container_name: luxgen-ollama-pull
depends_on:
  ollama:
    condition: service_healthy
environment:
  - OLLAMA_HOST=http://ollama:11434
command: ['pull', 'qwen2.5-coder:7b']
restart: 'no'
```

One-shot service. Waits for `ollama` to be healthy, then issues a pull command to the running Ollama server (via `OLLAMA_HOST`). The model is stored in the `ollama_data` volume. On subsequent `docker compose up`, it re-runs but exits quickly since the model is already cached.

**To pull a different model manually:**

```bash
docker exec luxgen-ollama ollama pull qwen2.5-coder:14b
```

**To see what's downloaded:**

```bash
docker exec luxgen-ollama ollama list
```

**To remove a model and free disk space:**

```bash
docker exec luxgen-ollama ollama rm qwen2.5-coder:7b
```

---

## 11. File Structure

```
apps/web/
├── .agent-staging/                   ← generated, add to .gitignore
│   └── session-{timestamp}-{id}.json
│
├── lib/
│   └── agent.ts                      ← core: types, session mgmt, tools, system prompt
│
├── pages/
│   ├── agent.tsx                     ← /agent page (split layout)
│   └── api/
│       └── agent/
│           ├── chat.ts               ← POST: SSE streaming + agentic loop
│           ├── stage.ts              ← GET/DELETE: staged file management
│           ├── apply.ts              ← POST: write staged files to real fs
│           └── health.ts             ← GET: Ollama connectivity check
│
└── components/
    └── agent/
        ├── AgentChat.tsx             ← chat UI + SSE stream parsing
        └── AgentTransparency.tsx     ← diff viewer + apply/discard

packages/ui/src/Layout/
└── DefaultNavigation.tsx             ← "Agent Studio" sidebar link under Developer section

docker-compose.yml                    ← ollama + ollama-model-pull services
AGENT_STUDIO.md                       ← this file
```

---

## 12. Data Schemas

### AgentSession (`.agent-staging/{id}.json`)

```typescript
{
  "id": "session-1749123456789-abc123",
  "files": {
    "apps/web/pages/leaderboard.tsx": {
      "path": "apps/web/pages/leaderboard.tsx",
      "content": "import React from 'react';\n...",
      "originalContent": undefined,       // undefined = new file
      "type": "new",
      "description": "New leaderboard page with top 10 users ranked by course completion",
      "stagedAt": 1749123456900
    },
    "apps/web/pages/api/leaderboard.ts": {
      "path": "apps/web/pages/api/leaderboard.ts",
      "content": "import type { NextApiRequest...",
      "originalContent": "// old content...",   // captured from disk at staging time
      "type": "modified",
      "description": "Add leaderboard API endpoint",
      "stagedAt": 1749123457100
    }
  },
  "createdAt": 1749123456789,
  "updatedAt": 1749123457100
}
```

### SSE Event Payloads

```typescript
// text — streamed text from the model
{ type: 'text', content: 'I will create...' }

// tool_start — before tool executes
{ type: 'tool_start', toolId: 'call_abc123', name: 'read_file', input: { path: 'apps/web/pages/dashboard.tsx' } }

// tool_result — after tool executes
{ type: 'tool_result', toolId: 'call_abc123', name: 'read_file', result: 'import React...' }

// file_staged — after write_file completes
{ type: 'file_staged', path: 'apps/web/pages/leaderboard.tsx', type: 'new', description: '...' }

// error
{ type: 'error', message: 'Ollama error 500: ...' }

// done
{ type: 'done', sessionId: 'session-1749123456789-abc123' }
```

---

## 13. Extending the Agent

### Add a backend tool (e.g., `create_graphql_resolver`)

The agent currently only stages frontend files. To support backend file generation with the same transparency guarantee:

1. The agent already CAN stage files to `apps/api/src/resolvers/newResolver.ts` — just use `write_file` with the correct path
2. No special handling needed — `applySession()` creates directories automatically

To teach the agent about the backend architecture, add it to the system prompt in `agent.ts`:

```typescript
export const SYSTEM_PROMPT = `...
### Backend (apps/api/src/)
- GraphQL API with Apollo Server + Express
- MongoDB via Mongoose (models in apps/api/src/schema/)
- Resolvers pattern: export default { Query: {}, Mutation: {} }
- Service layer in apps/api/src/services/ (business logic)
- Auth middleware in apps/api/src/middleware/auth.ts

## Resolver Pattern
\`\`\`typescript
// apps/api/src/resolvers/leaderboard.ts
export default {
  Query: {
    leaderboard: async (_: any, args: any, ctx: any) => {
      // ctx.user — authenticated user from middleware
      // ctx.db — mongoose models
    }
  }
};
\`\`\`
...`;
```

### Add streaming progress for long operations

If a tool takes a long time (e.g., running tests), send intermediate SSE events:

```typescript
// In executeTool, after starting a long operation:
if (name === 'run_tests') {
  sendEvent(res, 'text', { content: '\n⏳ Running tests...\n' });
  // ... run tests ...
  sendEvent(res, 'text', { content: `\n✅ Tests complete.\n` });
}
```

### Selective file apply (approve per-file)

The current UI applies all staged files at once. To add per-file approval, update `AgentTransparency.tsx` to add an "Apply this file" button per file, and extend `apply.ts` to accept an optional `filePaths` array:

```typescript
// In apply.ts
const { sessionId, filePaths } = req.body;
// If filePaths provided, only apply those paths
const toApply = filePaths
  ? Object.fromEntries(Object.entries(session.files).filter(([k]) => filePaths.includes(k)))
  : session.files;
```

---

## 14. Troubleshooting

### Red banner: "Ollama is not running"

```bash
# Check if the container is up
docker compose ps ollama

# Start it
docker compose up ollama -d

# Check logs
docker compose logs ollama --tail=50
```

### Yellow banner: "Model not yet downloaded"

```bash
# Run the model pull service
docker compose up ollama-model-pull

# Or pull manually
docker exec luxgen-ollama ollama pull qwen2.5-coder:7b

# Watch download progress
docker compose logs ollama-model-pull -f
```

### Agent sends a message but nothing appears / stream hangs

```bash
# Check Ollama health directly
curl http://localhost:11434/api/tags

# Check if the model is loaded
curl http://localhost:11434/api/ps

# Try a simple inference to confirm it works
curl http://localhost:11434/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"qwen2.5-coder:7b","messages":[{"role":"user","content":"Say hello"}],"stream":false}'
```

### Agent does not call tools (writes code in text instead)

This means the model is not following the tool calling format. Causes:

1. Wrong model pulled — verify `ollama list` shows `qwen2.5-coder:7b`, not a base/non-instruct variant
2. Model context too small — increase `num_ctx` in `chat.ts` options
3. Conversation history too long — the context window fills up, tool calling degrades

Quick fix: refresh the page to start a new session with empty history.

### Diff viewer shows the same content as removed + added (false diff)

This happens when `originalContent` was captured before an edit made outside Agent Studio. The actual content that will be written is always `StagedFile.content` — the diff is just a visual aid, not a contract. Review the "new file content" to confirm it's what you want before applying.

### `ENOENT: no such file or directory` on apply

The agent staged a file with a path that contains a new directory (e.g., `apps/web/pages/reports/index.tsx`). The `applySession()` function calls `fs.mkdirSync(dirname, { recursive: true })` before writing, so this should not happen unless the path is invalid. Check that the path in `StagedFile.path` uses forward slashes and is relative to the monorepo root.

### Ollama is slow (5–10 tokens/second)

Running on CPU. To speed up:

- Enable GPU (see Section 6.3)
- Use a smaller model: `OLLAMA_MODEL=qwen2.5-coder:1.5b`
- Reduce context: lower `num_ctx` to `8192` in `chat.ts`

### Session files accumulate on disk

Add a cleanup step to your CI or daily cron:

```bash
find apps/web/.agent-staging -name "session-*.json" -mtime +1 -delete
```
