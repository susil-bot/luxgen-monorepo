# Skill: AI Studio / Agent Platform

**Domain:** Agent chat, git worktree pipeline, validation, headless worker, `runAgentTask`.  
**Docs:** [AGENT_STUDIO.md](../../AGENT_STUDIO.md), [AGENT_STUDIO_ARCHITECTURE.md](../../docs/AGENT_STUDIO_ARCHITECTURE.md)

---

## Key paths

| Layer | Path |
|-------|------|
| Package | `packages/agent/` |
| Web SSE | `apps/web/pages/api/agent/*` |
| UI | `apps/web/pages/agent.tsx`, `components/agent/` |
| Worker | `apps/agent-worker/` |
| GraphQL | `runAgentTask` in `schema/automation/` |
| Audit | `packages/db/src/agent-task.ts`, `agent-audit.ts` |

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

| Task | Where |
|------|-------|
| New tool for LLM | `packages/agent/src/tools/` or web `lib/agent.ts` (legacy) |
| Stricter validation | Agent validation pipeline in `@luxgen/agent` |
| Queue long jobs | Redis + `apps/agent-worker` |
| Post-merge automation | Emit `CODE_CHANGE_MERGED` in merge handler |

---

## Env

```
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=mistral:latest
# Git worktree vars — see AGENT_STUDIO.md
```

---

## Do not

- Skip audit logging for agent actions
- Expose agent API without Enterprise gate in production
