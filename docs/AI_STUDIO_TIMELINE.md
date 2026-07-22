# AI Studio — Development Timeline & Task List

> Comprehensive plan covering all phases, edge cases, and improvements for the Agent Studio feature.
> Current state: **Phase 1 complete** — basic chat + staging + apply/discard.
> **Phase 2 complete** — reliability, safety limits, model fallback, SSE recovery, concurrency.

---

## Table of Contents

1. [Current Architecture Summary](#1-current-architecture-summary)
2. [Phase Overview](#2-phase-overview)
3. [Phase 2: Reliability & Edge Cases](#3-phase-2-reliability--edge-cases)
4. [Phase 3: UX & Transparency](#4-phase-3-ux--transparency)
5. [Phase 4: Multi-File & Refactoring](#5-phase-4-multi-file--refactoring)
6. [Phase 5: Production Readiness](#6-phase-5-production-readiness)
7. [Phase 6: Advanced Features](#7-phase-6-advanced-features)
8. [Edge Case Matrix](#8-edge-case-matrix)
9. [Risk Register](#9-risk-register)
10. [Dependency Graph](#10-dependency-graph)

---

## 1. Current Architecture Summary

```
Browser (/agent)
├── AgentChat.tsx          — Chat input + SSE streaming
│   └── POST /api/agent/chat
│       ├── Agentic Loop (max 10 iterations)
│       │   ├── Ollama API (qwen2.5-coder:7b @ localhost:11434)
│       │   └── Tool execution (read_file, list_files, search_code, write_file)
│       └── SSE events: text, tool_start, tool_result, file_staged, error, done
├── AgentTransparency.tsx  — Staged file tree + diff viewer
│   ├── GET  /api/agent/stage?sessionId=...
│   ├── POST /api/agent/apply
│   └── DELETE /api/agent/stage?sessionId=...
└── /api/agent/health      — Ollama connectivity + model check
```

**Current limitations:**
- No per-file apply (all-or-nothing)
- No undo after apply
- No session persistence across page refreshes
- No rate limiting or concurrency control
- No error recovery in streaming
- No file conflict detection
- No user authentication for agent actions
- No audit log
- No cancellation of in-flight agent runs
- No model fallback if primary model fails

---

## 2. Phase Overview

| Phase | Focus | Effort | Risk | Value |
|-------|-------|--------|------|-------|
| **1** | ✅ **Core MVP** (done) | — | — | — |
| **2** | Reliability & Edge Cases | Medium | High | Critical |
| **3** | UX & Transparency | Medium | Low | High |
| **4** | Multi-File & Refactoring | Large | Medium | Medium |
| **5** | Production Readiness | Large | High | High |
| **6** | Advanced Features | Very Large | High | Medium |

---

## 3. Phase 2: Reliability & Edge Cases

**Goal:** Make the agent robust against failures, network issues, and unexpected model behavior.

### Task 2.1 — SSE Stream Error Recovery

**Description:** The current SSE stream has no recovery mechanism. If the connection drops mid-stream, the user sees a partial response with no indication of failure.

**Edge cases:**
- Network timeout during long inference (>30s)
- Ollama container restart mid-stream
- Browser tab goes to background (mobile throttling)
- SSE buffer overflow on large responses
- Client disconnects but server continues processing

**Implementation:**
```typescript
// In chat.ts — add connection monitoring
const CONNECTION_TIMEOUT = 120_000; // 2 minutes
const heartbeat = setInterval(() => {
  sendEvent(res, 'heartbeat', { ts: Date.now() });
}, 15_000);

req.on('close', () => {
  clearInterval(heartbeat);
  // Log partial session state for recovery
  logger.warn(`Client disconnected mid-stream for session ${sessionId}`);
  // Optionally: save partial state so user can resume
});
```

**Files to modify:**
- `apps/web/pages/api/agent/chat.ts` — add heartbeat, timeout, disconnect handling
- `apps/web/components/agent/AgentChat.tsx` — add reconnection UI, timeout indicator

**Acceptance criteria:**
- [ ] Stream shows "Connection lost — retrying..." banner on disconnect
- [ ] Auto-retries up to 3 times with exponential backoff
- [ ] Manual "Retry" button available
- [ ] Partial response preserved on reconnect
- [ ] Heartbeat events don't appear in message history

---

### Task 2.2 — Tool Execution Timeouts

**Description:** Tool execution (especially `read_file` on large files, `search_code` on large directories) can hang or take too long, blocking the agentic loop.

**Edge cases:**
- `read_file` on a 10MB file (e.g., a compiled bundle)
- `search_code` on `node_modules` (should be excluded but defense-in-depth)
- `list_files` on a directory with 100,000+ entries
- Symlink loops in directory traversal
- Binary file read (e.g., `.png`, `.ico`) returning garbage
- Permission-denied files

**Implementation:**
```typescript
// In chat.ts executeTool() — add timeouts and limits
const TOOL_TIMEOUTS: Record<string, number> = {
  read_file: 5_000,    // 5 seconds
  list_files: 10_000,  // 10 seconds
  search_code: 15_000, // 15 seconds
  write_file: 2_000,   // 2 seconds
};

const MAX_FILE_SIZE = 1_000_000; // 1MB max read
const MAX_DIR_ENTRIES = 5_000;   // 5K max list

if (name === 'read_file') {
  const stat = fs.statSync(absPath);
  if (stat.size > MAX_FILE_SIZE) {
    return `Error: File too large (${(stat.size / 1024 / 1024).toFixed(1)}MB). Max: 1MB.`;
  }
  // Check for binary content
  const buffer = fs.readFileSync(absPath);
  if (isBinary(buffer)) {
    return `Error: Binary file — cannot display content.`;
  }
}
```

**Files to modify:**
- `apps/web/pages/api/agent/chat.ts` — add timeouts, size limits, binary detection
- `apps/web/lib/agent.ts` — add `isBinary()` utility

**Acceptance criteria:**
- [ ] Tools timeout independently with per-tool limits
- [ ] Large files return a clear error message (not truncated garbage)
- [ ] Binary files detected and rejected
- [ ] Symlink loops don't crash the server
- [ ] Permission errors are caught and reported gracefully

---

### Task 2.3 — Model Fallback Chain

**Description:** If the configured model fails (not downloaded, OOM, wrong format), the agent should fall back gracefully rather than showing a red banner.

**Edge cases:**
- Model not pulled (user skipped `ollama pull`)
- Model name typo in `.env.local`
- Model OOM on large context (14B model on 8GB RAM)
- Ollama running but model not loaded (cold start)
- Model doesn't support tool calling (e.g., `llama2:7b`)

**Implementation:**
```typescript
// In chat.ts — model fallback logic
const MODEL_FALLBACK_CHAIN = [
  process.env.OLLAMA_MODEL || 'qwen2.5-coder:7b',
  'qwen2.5-coder:7b',
  'qwen2.5-coder:1.5b',
  'llama3.2:3b',
];

async function getAvailableModel(): Promise<string | null> {
  for (const model of MODEL_FALLBACK_CHAIN) {
    try {
      const res = await fetch(`${OLLAMA_HOST}/api/show`, {
        method: 'POST',
        body: JSON.stringify({ model }),
      });
      if (res.ok) return model;
    } catch {}
  }
  return null;
}
```

**Files to modify:**
- `apps/web/pages/api/agent/chat.ts` — add fallback chain
- `apps/web/pages/api/agent/health.ts` — return available models list
- `apps/web/pages/agent.tsx` — show fallback model in status banner

**Acceptance criteria:**
- [ ] Agent auto-falls back to next available model if primary is missing
- [ ] User is notified which model is being used
- [ ] If no model supports tool calling, agent shows clear error
- [ ] Fallback doesn't add >2s latency to first request

---

### Task 2.4 — Agentic Loop Safety Limits

**Description:** The current loop has `MAX_ITERATIONS = 10` but no other safeguards. A runaway agent can:
- Call tools in an infinite loop (e.g., read_file → write_file → read_file → ...)
- Accumulate massive message history (context window overflow)
- Stage hundreds of files without user awareness

**Edge cases:**
- Model enters a "tool calling loop" — keeps calling tools without producing text
- Model generates 50+ tool calls in a single response (parallel calls)
- Model calls `write_file` on the same file 20 times in one session
- Model calls `read_file` on every file in the codebase sequentially
- Context window fills up, model starts producing garbage

**Implementation:**
```typescript
// In chat.ts — additional safety limits
const MAX_TOOL_CALLS_PER_RESPONSE = 5;    // Limit parallel tool calls
const MAX_TOTAL_TOOL_CALLS = 30;           // Per user message
const MAX_STAGED_FILES_PER_SESSION = 20;   // Safety limit
const MAX_CONSECUTIVE_TOOL_ONLY = 5;       // No text output = possible loop

let totalToolCalls = 0;
let consecutiveToolOnly = 0;

while (iterations < MAX_ITERATIONS) {
  // ... stream parsing ...
  
  if (toolCallArr.length > MAX_TOOL_CALLS_PER_RESPONSE) {
    sendEvent(res, 'error', {
      message: `Model attempted ${toolCallArr.length} parallel tool calls (max: ${MAX_TOOL_CALLS_PER_RESPONSE}). Truncating.`
    });
    toolCallArr.length = MAX_TOOL_CALLS_PER_RESPONSE;
  }
  
  if (toolCallArr.length > 0 && !textContent.trim()) {
    consecutiveToolOnly++;
    if (consecutiveToolOnly >= MAX_CONSECUTIVE_TOOL_ONLY) {
      sendEvent(res, 'error', {
        message: 'Agent appears stuck in a tool-calling loop. Stopping.'
      });
      break;
    }
  } else {
    consecutiveToolOnly = 0;
  }
  
  totalToolCalls += toolCallArr.length;
  if (totalToolCalls > MAX_TOTAL_TOOL_CALLS) {
    sendEvent(res, 'error', {
      message: `Exceeded maximum ${MAX_TOTAL_TOOL_CALLS} tool calls per message. Stopping.`
    });
    break;
  }
}
```

**Files to modify:**
- `apps/web/pages/api/agent/chat.ts` — add all safety limits
- `apps/web/lib/agent.ts` — add `MAX_STAGED_FILES_PER_SESSION` check in `stageFile()`

**Acceptance criteria:**
- [ ] Tool-calling loops are detected and broken after 5 consecutive tool-only iterations
- [ ] Parallel tool calls capped at 5 per response
- [ ] Total tool calls capped at 30 per user message
- [ ] Staged files capped at 20 per session
- [ ] User sees clear error messages when limits are hit

---

### Task 2.5 — Concurrent Session Handling

**Description:** Multiple browser tabs or users can create sessions simultaneously. Currently no locking or conflict detection.

**Edge cases:**
- Two sessions stage changes to the same file
- Session A applies, then Session B applies (overwrites A's changes silently)
- Session file write race condition (two tabs write to same `.json` simultaneously)
- Orphaned sessions (user closes tab, session file remains on disk forever)

**Implementation:**
```typescript
// In agent.ts — add file-level locking
import { writeFileSync, readFileSync } from 'fs';
import { lock, unlock } from 'proper-lockfile'; // or use simple mutex

export function saveSession(session: AgentSession): void {
  const filePath = getSessionPath(session.id);
  const dir = getStagingDir();
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  
  // Write to temp file first, then rename (atomic on same filesystem)
  const tmpPath = filePath + '.tmp';
  fs.writeFileSync(tmpPath, JSON.stringify(session, null, 2));
  fs.renameSync(tmpPath, filePath);
}
```

**Conflict detection on apply:**
```typescript
export function applySession(sessionId: string): ApplyResult {
  const session = loadSession(sessionId);
  const conflicts: string[] = [];
  
  for (const [filePath, staged] of Object.entries(session.files)) {
    const absPath = path.join(root, filePath);
    if (fs.existsSync(absPath) && staged.originalContent) {
      const currentContent = fs.readFileSync(absPath, 'utf-8');
      if (currentContent !== staged.originalContent) {
        conflicts.push(filePath);
      }
    }
  }
  
  if (conflicts.length > 0) {
    return { applied: [], errors: [], conflicts };
  }
  
  // ... proceed with apply
}
```

**Files to modify:**
- `apps/web/lib/agent.ts` — atomic writes, conflict detection
- `apps/web/pages/api/agent/apply.ts` — return conflict info
- `apps/web/components/agent/AgentTransparency.tsx` — show conflict warning UI

**Acceptance criteria:**
- [ ] No race conditions on session file writes (atomic writes)
- [ ] Apply detects if file changed since staging and warns user
- [ ] User can choose "Overwrite" or "Cancel" on conflict
- [ ] Orphaned session cleanup available (manual + auto)

---

## 4. Phase 3: UX & Transparency

**Goal:** Make the agent interface polished, informative, and trustworthy.

### Task 3.1 — Per-File Apply/Discard

**Description:** Currently apply/discard is all-or-nothing. Users need to selectively apply individual files.

**Edge cases:**
- User applies file A, then agent generates more files — file A should remain applied
- User applies file A, then modifies it manually — subsequent apply of file B should not revert A
- User discards file A but keeps file B staged
- Partial apply leaves session in inconsistent state

**Implementation:**
```typescript
// In apply.ts — support selective apply
const { sessionId, filePaths } = req.body;

export function applySessionFiles(
  sessionId: string,
  filePaths?: string[]
): ApplyResult {
  const session = loadSession(sessionId);
  const toApply = filePaths
    ? Object.fromEntries(
        Object.entries(session.files).filter(([k]) => filePaths.includes(k))
      )
    : session.files;
  
  // Apply only selected files
  const result = writeFiles(toApply);
  
  // Remove only applied files from session (keep unselected)
  if (filePaths) {
    for (const fp of filePaths) {
      delete session.files[fp];
    }
  } else {
    session.files = {};
  }
  
  saveSession(session);
  return result;
}
```

**UI changes in AgentTransparency.tsx:**
```
┌──────────────────────────────────────────────┐
│ Staged Changes                    [Discard All] [Apply All] │
├──────────────────────────────────────────────┤
│ ☐ apps/web/pages/leaderboard.tsx  NEW  [Apply] [Discard] │
│ ☐ apps/web/api/leaderboard.ts     MOD  [Apply] [Discard] │
│                                              │
│ [Apply Selected (2)]                         │
└──────────────────────────────────────────────┘
```

**Files to modify:**
- `apps/web/pages/api/agent/apply.ts` — accept `filePaths` array
- `apps/web/lib/agent.ts` — add `applySessionFiles()`
- `apps/web/components/agent/AgentTransparency.tsx` — per-file buttons, checkboxes

**Acceptance criteria:**
- [ ] Each staged file has individual Apply and Discard buttons
- [ ] Checkbox selection with "Apply Selected" bulk action
- [ ] Applied files disappear from staging list
- [ ] Discarded files are removed from session
- [ ] Partial apply doesn't corrupt session state

---

### Task 3.2 — Undo Last Apply

**Description:** Users need a safety net — the ability to undo the last apply operation.

**Edge cases:**
- Undo after page refresh (state lost)
- Multiple applies in sequence (undo should revert the last one only)
- File was created by agent (undo = delete) vs. modified (undo = restore original)
- File was manually edited between apply and undo
- Undo of a file that was also modified by another session

**Implementation:**
```typescript
// In agent.ts — add apply history
interface ApplyRecord {
  sessionId: string;
  timestamp: number;
  files: Array<{
    path: string;
    action: 'created' | 'modified';
    originalContent?: string;
    backupPath: string; // path to backup file
  }>;
}

const APPLY_HISTORY_FILE = '.agent-staging/.apply-history.json';

export function recordApply(sessionId: string, applied: string[]): void {
  const session = loadSession(sessionId);
  const history = loadApplyHistory();
  
  const record: ApplyRecord = {
    sessionId,
    timestamp: Date.now(),
    files: applied.map(fp => ({
      path: fp,
      action: session.files[fp]?.type === 'new' ? 'created' : 'modified',
      originalContent: session.files[fp]?.originalContent,
      backupPath: '', // store backup if needed
    })),
  };
  
  history.push(record);
  saveApplyHistory(history);
}

export function undoLastApply(): UndoResult {
  const history = loadApplyHistory();
  const last = history.pop();
  if (!last) return { undone: [], errors: ['No apply history'] };
  
  const root = getMonorepoRoot();
  const undone: string[] = [];
  const errors: string[] = [];
  
  for (const file of last.files) {
    try {
      if (file.action === 'created') {
        fs.unlinkSync(path.join(root, file.path));
      } else if (file.originalContent) {
        fs.writeFileSync(path.join(root, file.path), file.originalContent);
      }
      undone.push(file.path);
    } catch (e: any) {
      errors.push(`${file.path}: ${e.message}`);
    }
  }
  
  saveApplyHistory(history);
  return { undone, errors };
}
```

**Files to modify:**
- `apps/web/lib/agent.ts` — add apply history functions
- `apps/web/pages/api/agent/undo.ts` — new API route
- `apps/web/components/agent/AgentTransparency.tsx` — "Undo Last Apply" button
- `apps/web/pages/agent.tsx` — snackbar with undo action

**Acceptance criteria:**
- [ ] "Undo" button appears for 10 seconds after apply (snackbar action)
- [ ] Undo restores original content for modified files
- [ ] Undo deletes created files
- [ ] Undo history persists across page refreshes
- [ ] Clear error if file was manually edited since apply

---

### Task 3.3 — Streaming Progress & Cancellation

**Description:** Users need visibility into what the agent is doing and the ability to cancel a running operation.

**Edge cases:**
- Cancel during tool execution (tool may have side effects like `write_file`)
- Cancel during model inference (Ollama may continue generating)
- Cancel then immediately send new message
- Multiple rapid cancel/send cycles

**Implementation:**
```typescript
// In AgentChat.tsx — cancellation
const abortControllerRef = useRef<AbortController | null>(null);

const handleCancel = () => {
  if (abortControllerRef.current) {
    abortControllerRef.current.abort();
    abortControllerRef.current = null;
    setIsStreaming(false);
    addSystemMessage('⏹️ Agent run cancelled by user.');
  }
};

// In chat.ts — handle abort signal
req.on('close', () => {
  // Ollama doesn't support request cancellation natively,
  // but we can stop processing the stream
  isCancelled = true;
});
```

**Progress indicators:**
```
┌──────────────────────────────────────────────┐
│ 🤖 Agent Studio                              │
│                                              │
│ ┌──────────────────────────────────────────┐ │
│ │ User: Add a leaderboard page             │ │
│ │ ──────────────────────────────────────── │ │
│ │ 🤖 I'll start by exploring the codebase  │ │
│ │                                          │ │
│ │ 📁 Listing apps/web/pages...  ✓          │ │
│ │ 📄 Reading dashboard.tsx...  ⟳           │ │
│ │                                          │ │
│ │ [████████████░░░░░░░░░░] 45%             │ │
│ │                                          │ │
│ │ [Cancel]                                 │ │
│ └──────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

**Files to modify:**
- `apps/web/components/agent/AgentChat.tsx` — cancel button, progress bar
- `apps/web/pages/api/agent/chat.ts` — handle abort signal
- `apps/web/lib/agent.ts` — add progress tracking to session

**Acceptance criteria:**
- [ ] Cancel button visible during streaming
- [ ] Clicking cancel stops the agent loop immediately
- [ ] Partial results (staged files) are preserved
- [ ] User sees "Cancelled" message in chat
- [ ] Can send new message immediately after cancel

---

### Task 3.4 — Session Persistence & History

**Description:** Currently, refreshing the page creates a new session and loses all staged files. Users need session persistence.

**Edge cases:**
- User has 3 tabs open with different sessions
- Session contains 20 staged files — page refresh should restore all
- Session was applied — should show as "completed" not "active"
- Session older than 7 days — auto-cleanup
- Browser localStorage quota exceeded

**Implementation:**
```typescript
// In agent.tsx — restore session from URL or localStorage
useEffect(() => {
  // Try to restore from URL param first
  const urlSession = router.query.session as string;
  if (urlSession) {
    setSessionId(urlSession);
    return;
  }
  
  // Try to restore from localStorage
  const saved = localStorage.getItem('agentSessionId');
  if (saved) {
    // Verify session still exists on server
    fetch(`/api/agent/stage?sessionId=${saved}`)
      .then(r => r.json())
      .then(data => {
        if (data.id) {
          setSessionId(saved);
          return;
        }
        // Session expired or invalid — create new
        createNewSession();
      })
      .catch(() => createNewSession());
  } else {
    createNewSession();
  }
}, []);

// Save session ID to localStorage on every change
useEffect(() => {
  if (sessionId) {
    localStorage.setItem('agentSessionId', sessionId);
    // Update URL without navigation
    router.replace(`/agent?session=${sessionId}`, undefined, { shallow: true });
  }
}, [sessionId]);
```

**Session history sidebar:**
```
┌──────────────────────────────────────────────┐
│ 📋 Session History                           │
│                                              │
│ ● Today                                      │
│   ├─ 10:32 AM — Add leaderboard (3 files)    │
│   └─ 09:15 AM — Fix dashboard (1 file) ✓     │
│                                              │
│ ● Yesterday                                  │
│   └─ 04:20 PM — User management (5 files) ✓  │
└──────────────────────────────────────────────┘
```

**Files to modify:**
- `apps/web/pages/agent.tsx` — session restore logic
- `apps/web/lib/agent.ts` — add session metadata (title, applied count)
- `apps/web/components/agent/AgentTransparency.tsx` — session history panel
- `apps/web/pages/api/agent/stage.ts` — add list-sessions endpoint

**Acceptance criteria:**
- [ ] Page refresh restores session with all staged files intact
- [ ] Session ID in URL for bookmarking/sharing
- [ ] Session history shows last 20 sessions with timestamps
- [ ] Clicking a past session loads its staged files (read-only if applied)
- [ ] Sessions auto-clean after 7 days

---

### Task 3.5 — Diff Quality Improvements

**Description:** The current diff engine uses an 8-line lookahead heuristic that produces suboptimal diffs for large refactors.

**Edge cases:**
- File completely rewritten (should show as delete + create, not line-by-line diff)
- Whitespace-only changes (should be ignored or toggleable)
- File renamed (should show as rename, not delete + create)
- Large file diff (1000+ lines changed) — should paginate
- Binary file diff (should show "Binary file changed" not garbage)

**Implementation:**
```typescript
// Replace heuristic diff with Myers diff algorithm
// Or use diff library
import { diffLines, diffWords } from 'diff';

function computeDiff(original: string, modified: string): DiffLine[] {
  if (!original) {
    // New file — all lines are additions
    return modified.split('\n').map((text, i) => ({
      type: 'add' as const,
      text,
      lineNum: i + 1,
    }));
  }
  
  // Check if file is essentially rewritten (>80% changed)
  const changes = diffLines(original, modified);
  const totalLines = changes.reduce((sum, c) => sum + (c.count || 0), 0);
  const changedLines = changes
    .filter(c => c.added || c.removed)
    .reduce((sum, c) => sum + (c.count || 0), 0);
  
  if (changedLines / totalLines > 0.8) {
    // Show as "File rewritten" with summary stats
    return [{ type: 'rewrite', text: `File rewritten (${changedLines} lines changed of ${totalLines})`, lineNum: 0 }];
  }
  
  // Normal line-by-line diff
  return changes.flatMap(change => {
    if (change.added) {
      return change.value.split('\n').filter(Boolean).map((text, i) => ({
        type: 'add', text, lineNum: 0,
      }));
    }
    if (change.removed) {
      return change.value.split('\n').filter(Boolean).map((text, i) => ({
        type: 'remove', text, lineNum: 0,
      }));
    }
    return [];
  });
}
```

**Files to modify:**
- `apps/web/components/agent/AgentTransparency.tsx` — improved diff engine
- `apps/web/package.json` — add `diff` package

**Acceptance criteria:**
- [ ] Diffs are accurate (no false positives from heuristic)
- [ ] Rewritten files show summary instead of massive diff
- [ ] Whitespace-only changes are toggleable
- [ ] Large diffs (>500 lines) are paginated
- [ ] Binary files show "Binary file changed" badge

---

## 5. Phase 4: Multi-File & Refactoring

**Goal:** Enable the agent to handle complex multi-file features and refactoring operations.

### Task 4.1 — File Rename & Delete Support

**Description:** The agent can currently only create and modify files. It needs the ability to rename and delete files.

**Edge cases:**
- Rename a file that is imported by 10 other files (should update imports)
- Delete a file that is still referenced (should warn)
- Rename to an existing path (should error)
- Delete a file that was created by the agent in the same session
- Rename across directories (e.g., `pages/old.tsx` → `pages/new/name.tsx`)

**Implementation:**
```typescript
// New tool definition
{
  name: 'rename_file',
  description: 'Rename or move a file. The original path will be deleted and a new file created at the target path.',
  input_schema: {
    type: 'object',
    properties: {
      sourcePath: { type: 'string', description: 'Current relative path from monorepo root' },
      targetPath: { type: 'string', description: 'New relative path from monorepo root' },
    },
    required: ['sourcePath', 'targetPath'],
  },
},
{
  name: 'delete_file',
  description: 'Stage a file for deletion. The file will be removed from the filesystem when changes are applied.',
  input_schema: {
    type: 'object',
    properties: {
      path: { type: 'string', description: 'Relative path from monorepo root' },
      reason: { type: 'string', description: 'Why this file should be deleted' },
    },
    required: ['path', 'reason'],
  },
},
```

**Staging extension:**
```typescript
// Extend StagedFile type
interface StagedFile {
  path: string;
  content?: string;          // undefined for deletions
  originalContent?: string;
  type: 'new' | 'modified' | 'deleted' | 'renamed';
  targetPath?: string;       // for renames
  description: string;
  stagedAt: number;
}
```

**Files to modify:**
- `apps/web/lib/agent.ts` — add new tool definitions, extend types
- `apps/web/pages/api/agent/chat.ts` — add `rename_file` and `delete_file` execution
- `apps/web/components/agent/AgentTransparency.tsx` — show rename/delete in diff
- `apps/web/lib/agent.ts` — update `applySession()` to handle renames and deletes

**Acceptance criteria:**
- [ ] Agent can stage file renames (shown as "Moved: old → new")
- [ ] Agent can stage file deletions (shown as "🗑️ Will be deleted")
- [ ] Apply performs the actual rename/delete
- [ ] Rename across directories creates parent dirs
- [ ] Delete of non-existent file returns clear error

---

### Task 4.2 — Cross-File Refactoring Awareness

**Description:** When the agent modifies a file, it should understand the impact on imports, exports, and references across the codebase.

**Edge cases:**
- Renaming a component requires updating all imports
- Changing a function signature requires updating all callers
- Moving a file requires updating all relative imports
- Deleting a file requires removing all imports
- Adding a new export requires adding to barrel file (`index.ts`)

**Implementation:**
```typescript
// Add to system prompt
export const SYSTEM_PROMPT = `...
## Cross-File Refactoring Rules
When you rename, move, or modify a file that is imported elsewhere:
1. Use search_code to find all files that import the original path
2. Update each importing file with the new path
3. If you delete a file, remove all imports of it
4. If you add a new export, check if a barrel file (index.ts) needs updating
5. Stage ALL affected files — not just the primary change
...`
```

**Add a "find references" tool:**
```typescript
{
  name: 'find_references',
  description: 'Find all files that import or reference a given module path or export name.',
  input_schema: {
    type: 'object',
    properties: {
      symbol: { type: 'string', description: 'Export name or module path to search for' },
      directory: { type: 'string', description: 'Optional: limit search scope' },
    },
    required: ['symbol'],
  },
},
```

**Files to modify:**
- `apps/web/lib/agent.ts` — add `find_references` tool, update system prompt
- `apps/web/pages/api/agent/chat.ts` — add `find_references` execution (uses `search_code` under the hood)

**Acceptance criteria:**
- [ ] Agent automatically finds and updates imports when renaming files
- [ ] Agent stages all affected files (not just the primary change)
- [ ] Agent adds new exports to barrel files when appropriate
- [ ] Agent removes imports when deleting files

---

### Task 4.3 — Batch Operation Progress

**Description:** When the agent stages 5+ files, the user needs visibility into overall progress.

**Edge cases:**
- Agent stages 15 files across 3 directories
- Agent stages files, then deletes some, then modifies others
- Batch operation partially fails (some tools error)
- User wants to see "3 of 15 files staged" progress

**Implementation:**
```typescript
// In AgentTransparency.tsx — batch progress
interface BatchProgress {
  total: number;
  staged: number;
  failed: number;
  currentFile?: string;
}

// SSE event for batch progress
sendEvent(res, 'batch_progress', {
  total: 15,
  staged: 3,
  failed: 0,
  currentFile: 'apps/web/pages/leaderboard.tsx',
});
```

**Files to modify:**
- `apps/web/pages/api/agent/chat.ts` — emit `batch_progress` events
- `apps/web/components/agent/AgentChat.tsx` — show batch progress bar
- `apps/web/components/agent/AgentTransparency.tsx` — show "X of Y files staged"

**Acceptance criteria:**
- [ ] Progress bar shows during multi-file operations
- [ ] Each file staged increments the counter
- [ ] Failed files are shown in red
- [ ] User can see which file is currently being processed

---

## 6. Phase 5: Production Readiness

**Goal:** Make the agent secure, auditable, and scalable for team use.

### Task 5.1 — Authentication & Authorization

**Description:** Currently, anyone who can access `/agent` can read any file and write to any file. Need auth integration.

**Edge cases:**
- Unauthenticated user accessing `/agent` (should redirect to login)
- User with `viewer` role trying to apply files (should be read-only)
- User with `admin` role has full access
- Session hijacking (someone steals session ID)
- Cross-tenant access (tenant A user reads tenant B files)

**Implementation:**
```typescript
// In chat.ts — add auth check
import { verifyToken } from '@luxgen/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Extract token from Authorization header or cookie
  const token = req.headers.authorization?.replace('Bearer ', '') 
    || req.cookies?.authToken;
  
  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  
  let user: any;
  try {
    user = verifyToken(token);
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }
  
  // Check authorization
  if (user.role === 'viewer' && req.method !== 'GET') {
    res.status(403).json({ error: 'Viewers cannot modify files' });
    return;
  }
  
  // Attach user to request for audit logging
  (req as any).user = user;
}
```

**Files to modify:**
- `apps/web/pages/api/agent/chat.ts` — add auth middleware
- `apps/web/pages/api/agent/apply.ts` — add auth middleware
- `apps/web/pages/api/agent/stage.ts` — add auth middleware
- `apps/web/pages/api/agent/health.ts` — add auth middleware (optional)
- `apps/web/pages/agent.tsx` — check auth on mount, redirect if needed

**Acceptance criteria:**
- [ ] Unauthenticated users are redirected to login
- [ ] Viewers can chat with agent but cannot apply files
- [ ] Session IDs are tied to user (cannot access another user's session)
- [ ] Token expiration is handled gracefully
- [ ] Cross-tenant access is blocked

---

### Task 5.2 — Audit Logging

**Description:** Every agent action should be logged for accountability and debugging.

**Edge cases:**
- High volume (100+ agent runs per hour) — log rotation needed
- PII in file content (user data read by agent) — should be redacted
- Failed apply — should log partial state
- Logs contain staged file content (sensitive) — access control needed

**Implementation:**
```typescript
// In agent.ts — audit logger
interface AuditEntry {
  timestamp: number;
  userId: string;
  sessionId: string;
  action: 'chat' | 'tool_call' | 'file_staged' | 'file_applied' | 'file_discarded' | 'error';
  details: Record<string, any>;
  duration: number;
}

const AUDIT_LOG_DIR = path.join(getMonorepoRoot(), 'logs', 'agent-audit');

export function logAudit(entry: Omit<AuditEntry, 'timestamp'>): void {
  const logEntry: AuditEntry = {
    ...entry,
    timestamp: Date.now(),
  };
  
  const dateStr = new Date().toISOString().split('T')[0];
  const logFile = path.join(AUDIT_LOG_DIR, `${dateStr}.jsonl`);
  
  if (!fs.existsSync(AUDIT_LOG_DIR)) {
    fs.mkdirSync(AUDIT_LOG_DIR, { recursive: true });
  }
  
  // Redact sensitive content (file contents, search results)
  const sanitized = sanitizeAuditEntry(logEntry);
  
  fs.appendFileSync(logFile, JSON.stringify(sanitized) + '\n');
}

function sanitizeAuditEntry(entry: AuditEntry): AuditEntry {
  if (entry.action === 'file_staged' || entry.action === 'file_applied') {
    return {
      ...entry,
      details: {
        ...entry.details,
        // Log file path and size, not content
        contentLength: entry.details.content?.length || 0,
        content: '[REDACTED]',
      },
    };
  }
  return entry;
}
```

**Files to modify:**
- `apps/web/lib/agent.ts` — add audit logger
- `apps/web/pages/api/agent/chat.ts` — instrument all actions
- `apps/web/pages/api/agent/apply.ts` — log apply
- `apps/web/pages/api/agent/stage.ts` — log discard

**Acceptance criteria:**
- [ ] Every tool call is logged with user ID, timestamp, and tool name
- [ ] Every file stage/apply/discard is logged
- [ ] File contents are redacted in logs (only metadata)
- [ ] Logs are rotated daily
- [ ] Logs are accessible only to admins

---

### Task 5.3 — Rate Limiting & Abuse Prevention

**Description:** Prevent abuse of the agent system (accidental or malicious).

**Edge cases:**
- User sends 100 messages in 1 minute (spam)
- Agent generates 500 tool calls in a single session (runaway)
- Multiple users running agent simultaneously (resource exhaustion)
- Agent reading sensitive files (`.env`, `credentials.json`, `id_rsa`)
- Agent writing to system directories outside monorepo

**Implementation:**
```typescript
// In chat.ts — rate limiting
const RATE_LIMITS = {
  messagesPerMinute: 10,
  maxSessionDuration: 30 * 60 * 1000, // 30 minutes
  maxConcurrentSessions: 5,
};

// Simple in-memory rate limiter
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(userId);
  
  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(userId, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  
  if (entry.count >= RATE_LIMITS.messagesPerMinute) {
    return false;
  }
  
  entry.count++;
  return true;
}

// Path allowlist for file operations
const ALLOWED_PATHS = [
  'apps/web/',
  'apps/api/',
  'packages/',
  'docs/',
  'scripts/',
];

function isPathAllowed(relativePath: string): boolean {
  return ALLOWED_PATHS.some(allowed => relativePath.startsWith(allowed));
}

// In executeTool
if (name === 'read_file' || name === 'write_file') {
  if (!isPathAllowed(input.path)) {
    return `Error: Access denied. Path "${input.path}" is outside allowed directories.`;
  }
}
```

**Files to modify:**
- `apps/web/pages/api/agent/chat.ts` — rate limiting, path validation
- `apps/web/lib/agent.ts` — add `isPathAllowed()` utility
- `apps/web/pages/api/agent/apply.ts` — path validation on apply

**Acceptance criteria:**
- [ ] Rate limit of 10 messages/minute per user
- [ ] Session auto-expires after 30 minutes
- [ ] Max 5 concurrent sessions system-wide
- [ ] Agent cannot read/write outside `apps/`, `packages/`, `docs/`, `scripts/`
- [ ] Sensitive files (`.env`, `*.pem`, `credentials*`) are blocked from reading

---

### Task 5.4 — Error Monitoring & Reporting

**Description:** Production-grade error handling with structured error reporting.

**Edge cases:**
- Ollama returns 500 with HTML error page (not JSON)
- Ollama returns valid JSON but missing expected fields
- Disk full — cannot write staged files
- File descriptor leak (too many open files from tool calls)
- Memory leak from large file reads

**Implementation:**
```typescript
// Structured error types
class AgentError extends Error {
  constructor(
    message: string,
    public code: string,
    public recoverable: boolean,
    public userMessage: string,
  ) {
    super(message);
  }
}

const ERRORS = {
  OLLAMA_OFFLINE: new AgentError(
    'Ollama not reachable',
    'OLLAMA_OFFLINE',
    true,
    'Ollama is not running. Start it with: docker compose up ollama -d',
  ),
  MODEL_NOT_FOUND: new AgentError(
    'Model not found in Ollama',
    'MODEL_NOT_FOUND',
    true,
    'The AI model is not downloaded. Run: docker compose up ollama-model-pull',
  ),
  TOOL_TIMEOUT: new AgentError(
    'Tool execution timed out',
    'TOOL_TIMEOUT',
    true,
    'A tool operation took too long. Try a more specific request.',
  ),
  RATE_LIMITED: new AgentError(
    'Rate limit exceeded',
    'RATE_LIMITED',
    true,
    'You\'ve sent too many messages. Please wait a moment before trying again.',
  ),
  INTERNAL_ERROR: new AgentError(
    'Internal server error',
    'INTERNAL_ERROR',
    false,
    'An unexpected error occurred. Please try again or contact support.',
  ),
};
```

**Files to modify:**
- `apps/web/lib/agent.ts` — add error types
- `apps/web/pages/api/agent/chat.ts` — use structured errors
- `apps/web/components/agent/AgentChat.tsx` — show user-friendly error messages
- `apps/web/pages/api/agent/health.ts` — detailed health check

**Acceptance criteria:**
- [ ] All errors have user-friendly messages (no stack traces in UI)
- [ ] Recoverable errors show actionable next steps
- [ ] Non-recoverable errors show "contact support" message
- [ ] Errors are logged with full context for debugging
- [ ] Health check endpoint returns detailed component status

---

## 7. Phase 6: Advanced Features

**Goal:** Push the agent to its full potential with advanced capabilities.

### Task 6.1 — Multi-Model Support

**Description:** Allow users to choose between different models and compare results.

**Edge cases:**
- Model A supports tool calling, Model B doesn't
- Model A is fast but low quality, Model B is slow but excellent
- User switches model mid-session (context lost)
- Model returns different tool call format

**Implementation:**
```typescript
// Model registry
const MODEL_REGISTRY = {
  'qwen2.5-coder:7b': {
    name: 'Qwen 2.5 Coder 7B',
    supportsTools: true,
    contextWindow: 32768,
    speed: 'medium',
    quality: 'excellent',
  },
  'qwen2.5-coder:1.5b': {
    name: 'Qwen 2.5 Coder 1.5B',
    supportsTools: true,
    contextWindow: 32768,
    speed: 'fast',
    quality: 'good',
  },
  'qwen2.5-coder:14b': {
    name: 'Qwen 2.5 Coder 14B',
    supportsTools: true,
    contextWindow: 32768,
    speed: 'slow',
    quality: 'best',
  },
  'llama3.2:3b': {
    name: 'Llama 3.2 3B',
    supportsTools: false,
    contextWindow: 8192,
    speed: 'fast',
    quality: 'good',
  },
};
```

**Files to modify:**
- `apps/web/lib/agent.ts` — model registry
- `apps/web/pages/agent.tsx` — model selector dropdown
- `apps/web/pages/api/agent/chat.ts` — accept model parameter
- `apps/web/pages/api/agent/health.ts` — return available models with metadata

**Acceptance criteria:**
- [ ] User can select model from dropdown in top bar
- [ ] Models without tool calling show warning badge
- [ ] Model selection persists across page refreshes
- [ ] Available models are fetched from Ollama on page load
- [ ] Switching model mid-session shows context warning

---

### Task 6.2 — Custom Tool Creation (Agent-Configurable)

**Description:** Allow users to define custom tools that the agent can use, without writing code.

**Edge cases:**
- User creates a tool that runs arbitrary shell commands (security risk)
- User creates a tool that conflicts with built-in tool names
- Custom tool has syntax errors in its definition
- Custom tool calls an external API that is down
- User creates 50 custom tools (context window pollution)

**Implementation:**
```typescript
// Custom tool schema (stored in .agent-staging/custom-tools.json)
interface CustomTool {
  name: string;
  description: string;
  input_schema: {
    type: 'object';
    properties: Record<string, any>;
    required: string[];
  };
  handler: 'shell' | 'http' | 'script';
  config: {
    command?: string;       // for shell tools
    url?: string;           // for HTTP tools
    method?: string;
    headers?: Record<string, string>;
    scriptPath?: string;    // for script tools
  };
  allowed: boolean;         // admin must approve
}
```

**Files to modify:**
- `apps/web/lib/agent.ts` — custom tool loading
- `apps/web/pages/api/agent/chat.ts` — custom tool execution
- `apps/web/pages/agent.tsx` — custom tool management UI
- `apps/web/pages/api/agent/custom-tools.ts` — CRUD for custom tools

**Acceptance criteria:**
- [ ] Admin users can create custom tools via UI
- [ ] Custom tools appear in agent's tool list
- [ ] Shell tools are sandboxed (no dangerous commands)
- [ ] HTTP tools support GET/POST with configurable headers
- [ ] Custom tools can be enabled/disabled per session

---

### Task 6.3 — Agent-to-Agent Collaboration

**Description:** Allow multiple agent instances to collaborate on complex tasks.

**Edge cases:**
- Agent A generates code, Agent B reviews it
- Agent A and Agent B modify the same file (conflict)
- Agent A depends on Agent B's output (deadlock)
- Three or more agents collaborating (coordination complexity)

**Implementation:**
```typescript
// Multi-agent session
interface MultiAgentSession {
  id: string;
  agents: Array<{
    name: string;
    role: string;           // 'architect' | 'developer' | 'reviewer'
    model: string;
    systemPrompt: string;
    status: 'idle' | 'running' | 'done' | 'error';
  }>;
  sharedContext: string;    // shared understanding
  files: Record<string, StagedFile>;
  messages: Array<{
    from: string;
    to: string;
    content: string;
    timestamp: number;
  }>;
}
```

**Files to modify:**
- `apps/web/lib/agent.ts` — multi-agent types
- `apps/web/pages/api/agent/chat.ts` — multi-agent orchestration
- `apps/web/components/agent/AgentChat.tsx` — multi-agent UI
- `apps/web/pages/agent.tsx` — multi-agent mode toggle

**Acceptance criteria:**
- [ ] User can create a "team" of agents with different roles
- [ ] Agents can pass messages to each other
- [ ] Architect agent designs, Developer implements, Reviewer checks
- [ ] Conflicts are flagged for user resolution
- [ ] Multi-agent mode is opt-in (not default)

---

### Task 6.4 — Git Integration

**Description:** Automatically create git branches and commits for agent changes.

**Edge cases:**
- Dirty working directory (uncommitted changes)
- Git not installed
- Branch name collision
- Large number of files to commit
- Merge conflicts after agent applies changes

**Implementation:**
```typescript
// In apply.ts — git integration
import { execSync } from 'child_process';

function createAgentBranch(sessionId: string): string {
  const branchName = `agent/${sessionId.slice(0, 8)}`;
  
  try {
    // Check if working directory is clean
    const status = execSync('git status --porcelain', { encoding: 'utf-8' });
    if (status.trim()) {
      // Stash existing changes
      execSync('git stash push -m "auto-stash before agent session"');
    }
    
    // Create and switch to new branch
    execSync(`git checkout -b ${branchName}`);
    
    return branchName;
  } catch (e: any) {
    throw new Error(`Git operation failed: ${e.message}`);
  }
}

function commitAgentChanges(sessionId: string, files: string[]): void {
  const message = `feat(agent): ${sessionId.slice(0, 8)} — AI-generated changes`;
  
  for (const file of files) {
    execSync(`git add "${file}"`);
  }
  
  execSync(`git commit -m "${message}"`);
}
```

**Files to modify:**
- `apps/web/lib/agent.ts` — git helper functions
- `apps/web/pages/api/agent/apply.ts` — optional git integration
- `apps/web/components/agent/AgentTransparency.tsx` — "Create PR" button
- `apps/web/pages/agent.tsx` — git status indicator

**Acceptance criteria:**
- [ ] Apply creates a new git branch automatically (opt-in)
- [ ] Commit message includes session ID and file count
- [ ] Dirty working directory is stashed before branch creation
- [ ] User can see current git branch in agent UI
- [ ] "Create PR" button opens GitHub/GitLab URL

---

## 8. Edge Case Matrix

| # | Edge Case | Phase | Severity | Likelihood | Mitigation |
|---|-----------|-------|----------|------------|------------|
| 1 | Ollama goes down mid-stream | 2 | High | Medium | Heartbeat + auto-retry + clear error message |
| 2 | Model doesn't support tool calling | 2 | High | Medium | Fallback chain + detection + warning |
| 3 | Agent enters infinite tool loop | 2 | High | Low | Max consecutive tool-only iterations limit |
| 4 | User closes tab during streaming | 2 | Medium | High | Partial state preservation + cleanup |
| 5 | Two sessions modify same file | 2 | Medium | Medium | Conflict detection on apply |
| 6 | File read returns binary garbage | 2 | Medium | Medium | Binary content detection |
| 7 | Context window overflow | 2 | High | Medium | Truncation limits + safety checks |
| 8 | Rate limit abuse | 5 | Medium | Low | Per-user rate limiting |
| 9 | Unauthenticated access | 5 | High | Medium | Auth middleware on all API routes |
| 10 | Agent reads .env file | 5 | High | Low | Path allowlist + sensitive file blocking |
| 11 | Disk full during staging | 5 | Medium | Low | Error handling in saveSession |
| 12 | Session file corruption | 2 | Medium | Low | Atomic writes + JSON validation |
| 13 | Browser tab memory pressure | 3 | Low | High | Message limit in chat UI |
| 14 | Agent generates invalid TypeScript | 2 | Medium | High | TypeScript compilation check tool |
| 15 | Cross-tenant file access | 5 | High | Low | Tenant-scoped path validation |
| 16 | Agent deletes critical file | 4 | High | Low | Undo system + confirmation dialog |
| 17 | Large file (10MB+) read attempt | 2 | Medium | Low | File size limit (1MB) |
| 18 | Symlink loop in directory traversal | 2 | Medium | Low | Symlink detection + max depth |
| 19 | Ollama returns malformed JSON | 2 | High | Medium | Robust SSE parsing with error recovery |
| 20 | Multiple rapid cancel/send cycles | 3 | Medium | Medium | Debounce + abort controller cleanup |

---

## 9. Risk Register

| Risk | Impact | Probability | Mitigation | Owner |
|------|--------|-------------|------------|-------|
| **Model quality insufficient** — generated code has bugs or doesn't follow patterns | High | Medium | System prompt engineering, few-shot examples, TypeScript validation | Frontend |
| **Ollama resource usage** — 7B model uses 8GB RAM, 14B uses 16GB | Medium | High | Document requirements, support 1.5B fallback, GPU detection | DevOps |
| **Security: arbitrary file read** — agent reads sensitive files | High | Low | Path allowlist, sensitive file patterns, audit logging | Backend |
| **Security: arbitrary file write** — agent overwrites critical files | High | Low | Staging-only writes, apply confirmation, undo system | Backend |
| **User trust** — users don't trust AI-generated code | Medium | High | Transparency layer, diff viewer, per-file apply, education | Product |
| **Maintenance burden** — agent code diverges from codebase | Medium | Medium | Keep in-app (not package), update system prompt with architecture changes | All |
| **Model vendor lock-in** — tied to Ollama/Qwen | Low | Low | OpenAI-compatible API, multi-model support (Phase 6) | Backend |
| **Context window cost** — large conversations become expensive/slow | Medium | Medium | Message truncation, session limits, context management | Backend |

---

## 10. Dependency Graph

```
Phase 2 (Reliability)
├── Task 2.1 — SSE Error Recovery
│   └── Depends on: nothing
├── Task 2.2 — Tool Timeouts
│   └── Depends on: nothing
├── Task 2.3 — Model Fallback
│   └── Depends on: nothing
├── Task 2.4 — Safety Limits
│   └── Depends on: nothing
└── Task 2.5 — Concurrent Sessions
    └── Depends on: nothing

Phase 3 (UX)
├── Task 3.1 — Per-File Apply
│   └── Depends on: nothing
├── Task 3.2 — Undo
│   └── Depends on: Task 3.1 (per-file tracking)
├── Task 3.3 — Streaming Progress
│   └── Depends on: Task 2.1 (SSE reliability)
├── Task 3.4 — Session Persistence
│   └── Depends on: Task 2.5 (session isolation)
└── Task 3.5 — Diff Quality
    └── Depends on: nothing

Phase 4 (Multi-File)
├── Task 4.1 — Rename & Delete
│   └── Depends on: Task 3.1 (per-file apply)
├── Task 4.2 — Refactoring Awareness
│   └── Depends on: Task 4.1 (rename support)
└── Task 4.3 — Batch Progress
    └── Depends on: Task 3.3 (progress UI)

Phase 5 (Production)
├── Task 5.1 — Auth
│   └── Depends on: nothing (can be done independently)
├── Task 5.2 — Audit Logging
│   └── Depends on: Task 5.1 (user identity)
├── Task 5.3 — Rate Limiting
│   └── Depends on: Task 5.1 (user identity)
└── Task 5.4 — Error Monitoring
    └── Depends on: Task 2.2 (structured errors)

Phase 6 (Advanced)
├── Task 6.1 — Multi-Model
│   └── Depends on: Task 2.3 (model fallback)
├── Task 6.2 — Custom Tools
│   └── Depends on: Task 5.1 (admin auth)
├── Task 6.3 — Agent Collaboration
│   └── Depends on: Task 4.2 (cross-file awareness)
└── Task 6.4 — Git Integration
    └── Depends on: Task 3.2 (undo system)
```

---

## Estimated Timeline

| Phase | Tasks | Estimated Effort | Recommended Order |
|-------|-------|-----------------|-------------------|
| **2** | 5 tasks | 3-4 weeks | **Do first** — without reliability, nothing else matters |
| **3** | 5 tasks | 3-4 weeks | **Do second** — UX improvements have highest user impact |
| **5** | 4 tasks | 3-4 weeks | **Do third** — production readiness before advanced features |
| **4** | 3 tasks | 2-3 weeks | **Do fourth** — multi-file support after production hardening |
| **6** | 4 tasks | 4-6 weeks | **Do last** — advanced features are nice-to-haves |

**Total estimated effort: 15-21 weeks** for full implementation across all phases.

**Recommended immediate next steps (Phase 2):**
1. Task 2.2 (Tool Timeouts) — highest risk mitigation, lowest effort
2. Task 2.4 (Safety Limits) — prevents runaway agent scenarios
3. Task 2.3 (Model Fallback) — improves first-time user experience
4. Task 2.1 (SSE Error Recovery) — reliability for streaming
5. Task 2.5 (Concurrent Sessions) — important for team use