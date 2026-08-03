# Skill: AI Studio / Agent Platform

**Domain:** Agent chat, git worktree pipeline, validation, headless worker, `runAgentTask`, the Developer/Reviewer/PM Tester orchestrator.  
**Docs:** [docs/technical/agent/AGENT_STUDIO.md](../../docs/technical/agent/AGENT_STUDIO.md), [AGENT_STUDIO_ARCHITECTURE.md](../../docs/AGENT_STUDIO_ARCHITECTURE.md), [AGENT_ORCHESTRATOR.md](../../docs/AGENT_ORCHESTRATOR.md), role docs in [`.agents/`](../../.agents/AGENTS.md)

---

## Key paths

| Layer   | Path                                              |
| ------- | ------------------------------------------------- |
| Package | `packages/agent/`                                 |
| Web SSE | `apps/web/pages/api/agent/*`                      |
| UI      | `apps/web/pages/agent.tsx`, `components/agent/`   |
| Worker  | `apps/agent-worker/`                              |
| GraphQL | `runAgentTask` in `schema/automation/`            |
| Audit   | `packages/db/src/agent-task.ts`, `agent-audit.ts` |

---

## Business goal

**Enterprise differentiation** — AI-assisted customization with human approval. Gated by `agentStudio` feature flag.

---

## Architecture (short)

```
User chat → /api/agent/chat (SSE) → @luxgen/agent orchestrator → Ollama
                ↓
         Staging / git worktree → validate → commit/merge APIs
                ↓
         AutomationBridge (CODE_CHANGE_MERGED trigger)
```

**Headless tasks** (`apps/agent-worker`, queued via `enqueueHeadlessTask`) run the full
Developer -> Reviewer -> PM Tester loop instead of a single Developer pass — see
`docs/AGENT_ORCHESTRATOR.md`. Interactive chat is unchanged; a human in the chat already plays
the reviewer/tester role there.

---

## Plan gate

- **Enterprise** for `/api/agent/chat` and `runAgentTask`
- Check `assertFeature(plan, 'agentStudio')` on API routes

---

## Agent tools (LLM)

- `read_file`, `list_files`, `write_file` (staging only), `search_code`
- Never write directly to production paths — staging → apply → commit flow

---

## Common tasks

| Task                  | Where                                                      |
| --------------------- | ---------------------------------------------------------- |
| New tool for LLM      | `packages/agent/src/tools/` or web `lib/agent.ts` (legacy) |
| Stricter validation   | Agent validation pipeline in `@luxgen/agent`               |
| Queue long jobs       | Redis + `apps/agent-worker`                                |
| Post-merge automation | Emit `CODE_CHANGE_MERGED` in merge handler                 |
| New orchestration role | `prompts/roles.ts` + `core/roles.ts` + a stage in `core/orchestrated-task.ts` — see `docs/AGENT_ORCHESTRATOR.md` "Extending this" |

---

## Env

```
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=mistral:latest
# Git worktree vars — see docs/technical/agent/AGENT_STUDIO.md
```

---

## Do not

- Skip audit logging for agent actions
- Expose agent API without Enterprise gate in production
- Give Reviewer/PM Tester the `write_file` tool — they report, the Developer fixes (see `.agents/AGENTS.md`)
- Auto-merge on the orchestrator converging — `pending_review` is a human checkpoint, same as before this feature
