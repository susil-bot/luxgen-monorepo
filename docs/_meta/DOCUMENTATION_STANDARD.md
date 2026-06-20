# Documentation & Config Standards

> Conventions for markdown docs and YAML infrastructure files in the LuxGen monorepo.

---

## Repository roles

| Location                                         | Role                                                                     |
| ------------------------------------------------ | ------------------------------------------------------------------------ |
| `README.md` (root)                               | Company overview — product, links, contributing. **No technical depth.** |
| `AGENTS.md` (root)                               | AI agent entrypoint only                                                 |
| `docs/INDEX.md`                                  | Audience router (developer, product, agent, deploy)                      |
| `docs/technical/README.md`                       | Hierarchical technical index                                             |
| `docs/technical/development/CODEBASE.md`         | Repo map for developers/agents                                           |
| `docs/technical/development/CODING_STANDARDS.md` | Non-negotiable coding rules                                              |
| `docs/**/*.md`                                   | All detailed documentation                                               |
| `skills/**/SKILL.md`                             | Domain task guides for agents                                            |

## Markdown structure

Every doc under `docs/` should follow this pattern:

```markdown
# Title

> **Parent:** [link to parent index] · **Related:** [optional links]

---

## Section

Content…
```

Rules:

- One `#` title per file; use `##` / `###` for sections
- Link to parent hub (`docs/technical/README.md` or `docs/INDEX.md`)
- Prefer tables for indexes and reference material
- End index files with `_Last updated: YYYY-MM-DD_`
- Do not duplicate README content — link instead

## Moving or renaming docs

1. `git mv` to new path under `docs/technical/` when appropriate
2. Leave a one-line redirect stub at the old path if it was at repo root
3. Update `docs/INDEX.md`, `docs/technical/README.md`, and `docs/technical/development/CODEBASE.md` links
4. Search for old path references before opening PR

## YAML header block

All infrastructure YAML files use a consistent comment header:

```yaml
# LuxGen — <short purpose>
# Docs: <path/to/doc.md>
# Usage: <one-line how to run or deploy>
```

Examples:

- `docker-compose*.yml` → `docs/deployment/DOCKER.md` or `docs/technical/development/QUICK_START.md`
- `.github/workflows/*.yml` → `docs/deployment/MONOREPO_BUILD.md`
- `deploy/platforms/render.yaml` → `docs/deployment/FREE_TIER_CLOUD.md`
- `k8s/*.yaml` → `k8s/README.md`

Keep service-level section comments inside compose files (e.g. `# ── API ──`).

## Pull requests

- Documentation changes: branch `chore/docs-*`, PR to `main`
- **Never push directly to `main`** — PR only
