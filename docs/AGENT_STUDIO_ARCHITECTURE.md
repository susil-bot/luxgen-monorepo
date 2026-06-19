# Agent Studio — Target Architecture

> **Status:** Architecture specification (v1)  
> **Audience:** Engineers implementing Agent Studio phases 3–6  
> **Related:** `AGENT_STUDIO.md` (current implementation), `docs/AI_STUDIO_TIMELINE.md` (task backlog)

---

## 1. Executive Summary

Agent Studio today is a **local, interactive coding assistant** with a JSON staging layer and direct filesystem apply. That is the right MVP, but it cannot scale to:

- Safe team workflows (review, audit, rollback)
- Git-native merge with CI gates
- Headless runs triggered by LuxGen Automations
- Multi-tenant production deployment

**Target:** Agent Studio becomes a **Change Management Platform** — an orchestration layer that plans changes, stages them in isolation, validates them, requires approval, then commits and merges through Git.

**Core invariant (unchanged):** No change reaches the live codebase without passing through staging and an explicit approval step.

---

## 2. Gap Analysis — Current vs Target

| Capability | Current (Phase 1–2) | Target |
|---|---|---|
| Change isolation | JSON snapshot in `.agent-staging/` | Git worktree + feature branch per task |
| Apply mechanism | `fs.writeFileSync` to working tree | Commit to branch → PR → merge |
| Approval | Single "Apply All" button | Per-file + bulk approve → commit → optional PR merge |
| Validation | None before apply | Lint, typecheck, tests on changed packages |
| Audit trail | Session JSON only | Immutable task log in DB + Git commits |
| Headless execution | UI-only (`/agent`) | API + worker for automations & CI |
| Multi-user | File-level last-write-wins | Branch-per-task, merge conflicts at PR |
| Automation | Not connected | First-class trigger + action in Automations |
| Model provider | Ollama only | Pluggable `ModelProvider` interface |
| Service boundary | Logic in `apps/web/lib/agent.ts` | `@luxgen/agent` package + thin API routes |

---

## 3. Design Principles

1. **Git is the source of truth for applied changes** — staging is ephemeral; commits are permanent.
2. **Worktree isolation** — each agent task gets its own working directory and branch ([industry standard for parallel agents](https://www.augmentcode.com/guides/how-to-run-a-multi-agent-coding-workspace)).
3. **Maker–Checker–Human** — agent proposes (maker), automated checks + optional verifier agent review (checker), human approves merge (human).
4. **Validation before commit** — no commit without passing scoped CI gates.
5. **Headless = same engine** — UI and Automations call the same `@luxgen/agent` orchestrator.
6. **Tenant-aware** — tasks scoped to tenant + user; audit logs include both.
7. **Progressive enhancement** — each phase ships independently; JSON staging remains valid in dev mode.

---

## 4. Target System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Presentation Layer                                 │
├──────────────────────────────┬──────────────────────────────────────────────┤
│  Agent Studio UI (/agent)    │  Automations UI (/automations)               │
│  • Chat + diff viewer        │  • "Run Agent Task" action block             │
│  • Approve / merge controls  │  • Task status in run history                │
└──────────────┬───────────────┴──────────────────────┬───────────────────────┘
               │                                       │
               ▼                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     API Gateway (apps/web/pages/api/agent/)                  │
│  Thin handlers — auth, rate limit, SSE transport, delegate to @luxgen/agent  │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        @luxgen/agent (new package)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│  Orchestrator        │ Agentic loop, tool dispatch, SSE event emission       │
│  TaskService         │ CRUD, state machine, persistence                      │
│  ChangeSetService     │ Stage files, diff, conflict detection                 │
│  GitService          │ Worktree, branch, commit, PR, merge                   │
│  ValidationPipeline  │ lint → typecheck → test (scoped to changed paths)     │
│  ToolRegistry        │ read_file, write_file, search_code, run_validation…   │
│  ModelProvider       │ Ollama (default), OpenAI, Anthropic adapters          │
│  AutomationBridge    │ Emit/consume automation events                          │
│  AuditLog            │ Append-only task + action history                     │
└──────────────┬───────────────────────────────┬──────────────────────────────┘
               │                               │
               ▼                               ▼
┌──────────────────────────┐    ┌─────────────────────────────────────────────┐
│  Git + Worktrees         │    │  Persistence                                 │
│  agent/{taskId} branches │    │  MongoDB: AgentTask, AgentRun, AuditEntry      │
│  .agent-worktrees/       │    │  Redis: job queue, distributed locks         │
└──────────────────────────┘    │  FS: .agent-staging/ (dev fallback)            │
                                └─────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  External                                                                   │
│  Ollama :11434  │  GitHub/GitLab (PR)  │  Automation Engine (future)        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Core Workflow — Plan → Stage → Verify → Approve → Merge

### 5.1 Task State Machine

```
                    ┌──────────┐
                    │  CREATED │
                    └────┬─────┘
                         │ start run
                         ▼
                    ┌──────────┐     error/cancel
         ┌─────────│ RUNNING  │──────────────────┐
         │         └────┬─────┘                  │
         │              │ agent finishes           │
         │              ▼                          │
         │         ┌──────────┐                    │
         │         │  STAGED  │ (files in changeset)
         │         └────┬─────┘                    │
         │              │ run validation            │
         │              ▼                          │
         │    ┌─────────────────┐                   │
         │    │   VALIDATING    │                   │
         │    └────────┬────────┘                   │
         │         pass│      fail                 │
         │              ▼         └────► STAGED (with errors)
         │    ┌─────────────────┐                   │
         │    │ PENDING_REVIEW  │◄── human sees diff + validation report
         │    └────────┬────────┘                   │
         │    approve  │  reject                     │
         │              ▼         └────► DISCARDED   │
         │    ┌─────────────────┐                   │
         │    │   COMMITTING    │ git commit on branch
         │    └────────┬────────┘                   │
         │              ▼                          │
         │    ┌─────────────────┐                   │
         │    │    COMMITTED    │ (branch pushed, PR optional)
         │    └────────┬────────┘                   │
         │    merge     │  abandon branch           │
         │              ▼                          │
         │    ┌─────────────────┐                   │
         └────│     MERGED      │                   │
              └─────────────────┘                   │
                                                    ▼
                                              ┌───────────┐
                                              │ CANCELLED │
                                              │  FAILED   │
                                              └───────────┘
```

### 5.2 End-to-End Flow (Interactive)

```
1. User: "Add leaderboard page with GraphQL resolver"
2. Orchestrator creates AgentTask + git worktree at .agent-worktrees/task-{id}/
3. Branch: agent/task-{id}-leaderboard
4. Agent loop runs in worktree context (tools read/write worktree files)
5. write_file → ChangeSetService stages diff (same as today, but paths relative to worktree)
6. On done → auto-run ValidationPipeline
7. UI shows: diff + validation report + "Approve & Commit" / "Create PR" / "Discard"
8. On approve:
   a. GitService commits with message: "agent(task-{id}): Add leaderboard page"
   b. Optional: push branch + open PR via gh CLI / GitHub API
9. On merge (manual or via PR approval):
   a. GitService merges agent/task-{id}-* → target branch (default: current dev branch)
   b. Cleanup worktree
   c. AutomationBridge emits code_change_merged event
```

### 5.3 End-to-End Flow (Automation-Triggered)

```
1. Automation trigger: schedule | webhook | course_completed
2. Action: run_agent_task { prompt, skill?, targetBranch?, autoMerge?: false }
3. AgentWorker picks job from Redis queue
4. Same orchestrator flow as interactive, but no SSE — poll/webhook status
5. On STAGED + validation pass:
   - If autoMerge=false → notify admin, wait for UI approval
   - If autoMerge=true + all gates pass → commit + merge (tenant policy gated)
6. Run history shows agent task outcome in Automations UI
```

---

## 6. Git Integration (Critical Upgrade)

Direct filesystem apply (`applySession`) is acceptable for **local dev mode only**. Production path:

| Step | Mechanism |
|---|---|
| Isolation | `git worktree add .agent-worktrees/{taskId} -b agent/task-{id}` |
| Agent writes | Tools operate inside worktree directory |
| Staging | In-memory + optional JSON mirror for UI speed |
| Approve | `git add -A && git commit -m "..."` inside worktree |
| Review | Push branch; open PR with auto-generated description |
| Merge | Squash merge (single clean commit on target) |
| Cleanup | `git worktree remove` + branch delete after merge |

**Why worktrees over clones:** Shared object database, fast creation, industry-standard for parallel agent sessions.

**Conflict policy:** If target branch moves during task, rebase worktree branch before merge. Surface conflicts in UI — never silent overwrite.

---

## 7. Validation Pipeline

Run automatically when agent reaches `STAGED`, and again before `COMMITTING`.

```typescript
interface ValidationResult {
  passed: boolean;
  checks: Array<{
    name: 'lint' | 'typecheck' | 'test' | 'security';
    scope: string;       // e.g. "apps/web", "packages/ui"
    passed: boolean;
    output: string;      // truncated log
    durationMs: number;
  }>;
}
```

**Scoped execution** — only run checks for packages touched by the changeset:

| Changed path prefix | Checks |
|---|---|
| `apps/web/` | `next lint`, `tsc --noEmit` |
| `packages/ui/` | `tsc --noEmit` (ui package) |
| `apps/api/` | `tsc --noEmit`, `jest` (api tests) |

**Gate policy:**

| Environment | Required to commit | Required to auto-merge |
|---|---|---|
| Local dev | None (warn only) | N/A |
| Staging | lint + typecheck | + tests |
| Production | All checks + human PR approval | All checks + 1 human reviewer |

Add tool: `run_validation({ scope })` so the agent can self-correct before finishing.

---

## 8. Package Structure — `@luxgen/agent`

Extract from `apps/web/lib/agent.ts` and `pages/api/agent/*.ts`:

```
packages/agent/
├── package.json
├── src/
│   ├── index.ts
│   ├── types/
│   │   ├── task.ts              # AgentTask, AgentRun, TaskStatus
│   │   ├── changeset.ts         # StagedFile, ChangeSet
│   │   └── events.ts            # SSE event types
│   ├── core/
│   │   ├── orchestrator.ts      # Agentic loop (from chat.ts)
│   │   ├── state-machine.ts     # Task status transitions
│   │   └── session-store.ts     # FS (dev) + Mongo (prod) adapters
│   ├── changeset/
│   │   ├── stage.ts             # stageFile, loadSession, applySession
│   │   ├── diff.ts              # Diff engine (move from AgentTransparency)
│   │   └── conflict.ts          # originalContent vs disk vs branch
│   ├── git/
│   │   ├── worktree.ts          # create, remove, path resolution
│   │   ├── branch.ts            # naming: agent/task-{id}-{slug}
│   │   ├── commit.ts
│   │   └── merge.ts             # squash merge, conflict report
│   ├── validation/
│   │   ├── pipeline.ts
│   │   └── scopes.ts            # map paths → check commands
│   ├── tools/
│   │   ├── registry.ts
│   │   ├── read-file.ts
│   │   ├── list-files.ts
│   │   ├── search-code.ts
│   │   ├── write-file.ts
│   │   └── run-validation.ts
│   ├── providers/
│   │   ├── model-provider.ts    # interface
│   │   └── ollama.ts            # current implementation
│   ├── prompts/
│   │   └── system.ts            # SYSTEM_PROMPT + skill injection
│   ├── automation/
│   │   ├── bridge.ts            # event emitter
│   │   └── schemas.ts           # run_agent_task action schema
│   └── audit/
│       └── logger.ts            # append-only audit entries
```

**apps/web** retains only:
- React components (`AgentChat`, `AgentTransparency`, new `AgentTaskPanel`, `ValidationReport`)
- Thin API routes that call `@luxgen/agent`
- SSE transport wiring

---

## 9. API Design (Target)

Replace session-centric endpoints with task-centric ones. Keep backward compat aliases during migration.

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/agent/tasks` | Create task `{ prompt, mode: 'interactive' \| 'headless', tenantId, userId }` |
| `GET` | `/api/agent/tasks/:id` | Task status, changeset summary, validation result |
| `POST` | `/api/agent/tasks/:id/run` | Start/resume agent loop (returns SSE stream) |
| `POST` | `/api/agent/tasks/:id/cancel` | Cancel in-flight run |
| `GET` | `/api/agent/tasks/:id/changes` | Full changeset with diffs |
| `POST` | `/api/agent/tasks/:id/validate` | Re-run validation pipeline |
| `POST` | `/api/agent/tasks/:id/approve` | `{ filePaths?: string[] }` — commit approved files |
| `POST` | `/api/agent/tasks/:id/merge` | Merge branch to target |
| `DELETE` | `/api/agent/tasks/:id` | Discard task, remove worktree |
| `GET` | `/api/agent/health` | Model provider status (unchanged) |

**Legacy mapping:**
- `sessionId` → `taskId`
- `POST /api/agent/chat` → `POST /api/agent/tasks/:id/run`
- `POST /api/agent/apply` → `POST /api/agent/tasks/:id/approve`
- `GET/DELETE /api/agent/stage` → `GET/DELETE /api/agent/tasks/:id/changes`

---

## 10. Data Models

### 10.1 AgentTask (MongoDB)

```typescript
interface AgentTask {
  id: string;
  tenantId: string;
  userId: string;
  status: TaskStatus;
  mode: 'interactive' | 'headless' | 'automation';
  prompt: string;
  skill?: string;                    // e.g. "ios-design", "sidebar"
  automationId?: string;             // if triggered by automation
  git: {
    worktreePath: string;
    branch: string;
    baseBranch: string;
    commitSha?: string;
    prUrl?: string;
  };
  changeset: Record<string, StagedFile>;
  validation?: ValidationResult;
  metadata: {
    model: string;
    toolCallCount: number;
    iterationCount: number;
    createdAt: Date;
    updatedAt: Date;
    completedAt?: Date;
  };
}
```

### 10.2 AuditEntry (append-only)

```typescript
interface AuditEntry {
  taskId: string;
  tenantId: string;
  userId: string;
  action: 'created' | 'staged' | 'validated' | 'approved' | 'committed' | 'merged' | 'discarded' | 'failed';
  details: Record<string, unknown>;
  timestamp: Date;
}
```

### 10.3 Dev Fallback

Keep `.agent-staging/{taskId}.json` when `AGENT_MODE=filesystem` (local dev without git).

---

## 11. Automations Integration

LuxGen Automations (`/automations`) is currently UI mock data. Agent Studio integration defines the **contract** both systems will share.

### 11.1 New Automation Triggers

| Trigger | Fires when |
|---|---|
| `code_change_staged` | Agent task reaches STAGED with ≥1 file |
| `code_change_committed` | Agent branch committed |
| `code_change_merged` | Agent branch merged to target |
| `code_change_failed` | Task FAILED or validation failed |

### 11.2 New Automation Actions

| Action | Config | Behavior |
|---|---|---|
| `run_agent_task` | `{ prompt, skill?, autoApprove?: boolean, autoMerge?: boolean }` | Enqueue headless agent task |
| `notify_review_required` | `{ channel: 'email' \| 'slack', recipients }` | Alert when task awaits review |
| `create_automation` | `{ name, trigger, actions }` | Agent tool to scaffold automation JSON (future) |

### 11.3 Agent → Automation Authoring

Add tool `read_automation_schema` + extend system prompt with `docs/PERSONA_PAGES.md` automation section so the agent can:

1. Read existing automation patterns
2. Stage new automation definitions (when backend exists)
3. Wire triggers to agent-generated features (e.g. new webhook endpoint)

**AutomationBridge** emits events to a shared event bus (Redis pub/sub initially; GraphQL subscriptions later).

---

## 12. UI Evolution

### 12.1 Agent Studio Layout (Target)

```
┌────────────────────────────────────────────────────────────────────────────┐
│ Agent Studio          [Task: leaderboard]  [Branch: agent/task-abc]  [●]  │
├───────────────────────────────┬────────────────────────────────────────────┤
│ Chat                          │ Changes (3 files)                          │
│                               │ ┌ Validation ──────────────────────────┐ │
│                               │ │ ✓ lint web  ✓ typecheck  ✗ test api   │ │
│                               │ └───────────────────────────────────────┘ │
│                               │ ☑ pages/leaderboard.tsx        [Diff]    │
│                               │ ☑ api/schema/leaderboard/...   [Diff]    │
│                               │ ☐ sidebar nav entry            [Diff]    │
│                               │                                          │
│                               │ [Discard] [Validate] [Approve Selected]  │
│                               │ [Commit & Push] [Create PR] [Merge]      │
└───────────────────────────────┴────────────────────────────────────────────┘
```

### 12.2 New Components

| Component | Responsibility |
|---|---|
| `AgentTaskHeader` | Task id, branch, status badge, git link |
| `ValidationReport` | Check results, expandable logs |
| `ChangeSetPanel` | Per-file checkbox, diff, individual approve |
| `MergeControls` | Commit, PR, merge with confirmation |
| `AutomationLink` | Show if task was automation-triggered |

---

## 13. Security & Multi-Tenancy

| Control | Implementation |
|---|---|
| Path allowlist | Keep `ALLOWED_PATHS` — extend with tenant-scoped roots if needed |
| Sensitive files | Keep `SENSITIVE_FILE_PATTERNS` |
| Auth | Require JWT on all `/api/agent/tasks/*`; bind task to `userId` + `tenantId` |
| Rate limits | Per-user: 10 tasks/hour, 30 tool calls/message (existing limits) |
| Auto-merge | Disabled by default; tenant policy flag `agent.autoMergeAllowed` |
| Git credentials | Server-side only; never exposed to browser |
| Audit | All approve/merge actions logged with user attribution |

---

## 14. Model Provider Abstraction

```typescript
interface ModelProvider {
  name: string;
  chat(params: {
    messages: Message[];
    tools: ToolDefinition[];
    stream: boolean;
    onChunk: (chunk: StreamChunk) => void;
  }): Promise<ChatResult>;
  healthCheck(): Promise<{ ok: boolean; models: string[] }>;
}
```

| Provider | Use case |
|---|---|
| `OllamaProvider` | Local dev, air-gapped, no API cost |
| `OpenAIProvider` | Production quality, cloud |
| `AnthropicProvider` | Long-context planning tasks |

Configuration via env: `AGENT_MODEL_PROVIDER=ollama|openai|anthropic`.

---

## 15. Deployment Modes

| Mode | Staging | Git | Validation | Storage |
|---|---|---|---|---|
| `local` | JSON files | Optional | Warn only | Filesystem |
| `dev` | Worktree | Branch, no push | lint + typecheck | MongoDB |
| `staging` | Worktree | Branch + PR | Full pipeline | MongoDB + Redis |
| `production` | Worktree | PR required, no direct merge | Full + security scan | MongoDB + Redis |

Env: `AGENT_DEPLOYMENT_MODE=local|dev|staging|production`

---

## 16. Implementation Roadmap

### Phase 3 — UX & Transparency (4–6 weeks)
*Aligns with `docs/AI_STUDIO_TIMELINE.md` Phase 3*

- [ ] Per-file approve/discard
- [ ] Undo last apply (with backup)
- [ ] Stream cancellation + progress
- [ ] Session persistence across refresh (localStorage taskId)
- [ ] Validation report UI (manual trigger first)

### Phase 4 — Extract `@luxgen/agent` (3–4 weeks)
- [ ] Create `packages/agent` with orchestrator, changeset, tools
- [ ] Migrate `apps/web/lib/agent.ts` → package
- [ ] Thin API routes
- [ ] Unit tests for state machine, diff, conflict detection

### Phase 5 — Git Worktree Pipeline (4–6 weeks)
- [ ] `GitService` with worktree lifecycle
- [ ] Approve → commit flow (replace direct apply in non-local modes)
- [ ] PR creation via `gh` CLI
- [ ] Merge + cleanup
- [ ] Conflict detection against base branch

### Phase 6 — Validation & Production (4–6 weeks)
- [ ] `ValidationPipeline` with scoped checks
- [ ] MongoDB task persistence + audit log
- [ ] Auth on agent endpoints
- [ ] Redis job queue for headless runs
- [ ] `apps/agent-worker` (optional separate process)

### Phase 7 — Automations Bridge ✅ (shipped)
- [x] GraphQL automation schema + MongoDB models (`packages/db`, `apps/api`)
- [x] `AutomationBridge` + `run_agent_task` action (`packages/agent/src/automation/`)
- [x] Agent lifecycle events → automations (staged, commit/merge/failed)
- [x] Automations UI wired to GraphQL (fallback to mock if API offline)
- [x] `read_automation_schema` agent tool
- [ ] GraphQL subscriptions for live run status (Phase 8)
- [ ] Automations UI: deep-link to agent task status

**Product docs:** `docs/BUSINESS_STRATEGY_2026.md`, `docs/GRAPHQL_PLATFORM.md`

---

## 17. Comparison with Industry Patterns

| Pattern | Source | LuxGen adoption |
|---|---|---|
| Git worktree isolation | Augment Code, Cursor, 2026 agent guides | Phase 5 — one worktree per `AgentTask` |
| Maker–Checker loop | DEV Community git-native orchestration | Phase 6 — optional verifier pass before human review |
| Squash merge to main | Standard PR hygiene | Default merge strategy |
| CI gates before merge | GitHub branch protection | `ValidationPipeline` + tenant policy |
| Staging before apply | Current Agent Studio | Retained — core invariant |
| Headless agent workers | Augment, Devin-style workspaces | Phase 6 — Redis queue + worker |

---

## 18. Migration Path (No Big Bang)

1. **Week 1–2:** Ship Phase 3 UX improvements on current JSON staging (no git changes).
2. **Week 3–6:** Extract `@luxgen/agent`; API routes delegate to package; behavior unchanged.
3. **Week 7+:** Introduce `AGENT_DEPLOYMENT_MODE=local` (default) vs `dev` (worktree). Users opt in.
4. **When automations backend lands:** Wire `AutomationBridge` without changing agent core.

Existing `/agent` page, sidebar link, and Ollama setup continue working throughout.

---

## 19. Open Decisions

| Decision | Options | Recommendation |
|---|---|---|
| PR host | GitHub CLI vs GitLab API vs manual | GitHub CLI first (`gh pr create`) |
| Verifier agent | Single model vs dedicated checker model | Phase 6 optional; same model with checker prompt |
| Auto-merge policy | Tenant flag vs role-based | Tenant flag + `admin` role only |
| Worker deployment | In Next.js process vs separate container | Separate container at staging+ scale |
| Diff engine | Custom LCS vs `diff` npm package | Keep custom for zero deps; swap if refactor cost is low |

---

## 20. Success Metrics

| Metric | Target |
|---|---|
| Time from prompt to staged changes | < 2 min (7B local), < 30s (cloud) |
| Validation pass rate before human review | > 70% |
| Rollback success (undo/branch abandon) | 100% |
| Automation-triggered tasks completing without human | > 50% (simple tasks only) |
| Zero unapproved writes to main branch | 100% (in git modes) |

---

## Appendix A — Current File Map → Target

| Current | Target |
|---|---|
| `apps/web/lib/agent.ts` | `packages/agent/src/changeset/` + `prompts/` + `tools/` |
| `apps/web/pages/api/agent/chat.ts` | `packages/agent/src/core/orchestrator.ts` + thin route |
| `apps/web/pages/api/agent/apply.ts` | `packages/agent/src/git/commit.ts` + route |
| `apps/web/pages/api/agent/stage.ts` | `packages/agent/src/changeset/stage.ts` + route |
| `apps/web/components/agent/AgentTransparency.tsx` | UI only; diff → `packages/agent/src/changeset/diff.ts` |
| `.agent-staging/` | Dev fallback; prod uses worktree + MongoDB |

---

## Appendix B — Environment Variables (Target)

| Variable | Default | Purpose |
|---|---|---|
| `AGENT_DEPLOYMENT_MODE` | `local` | local \| dev \| staging \| production |
| `AGENT_MODEL_PROVIDER` | `ollama` | ollama \| openai \| anthropic |
| `OLLAMA_HOST` | `http://localhost:11434` | Ollama URL |
| `OLLAMA_MODEL` | `qwen2.5-coder:7b` | Model name |
| `AGENT_GIT_ENABLED` | `false` | Enable worktree pipeline |
| `AGENT_GIT_BASE_BRANCH` | `main` | Branch to merge into |
| `AGENT_AUTO_MERGE` | `false` | Allow automation auto-merge |
| `AGENT_MONGODB_URI` | — | Task persistence (staging+) |
| `AGENT_REDIS_URL` | — | Job queue (staging+) |
