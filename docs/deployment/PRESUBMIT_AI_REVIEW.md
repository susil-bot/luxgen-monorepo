# Presubmit AI Code Review

> **Parent:** [deployment/INDEX.md](./INDEX.md) · **Action:** [Presubmit on GitHub Marketplace](https://github.com/marketplace/actions/presubmit-ai-code-review-fixes)

Automated PR reviews via [presubmit/ai-reviewer](https://github.com/presubmit/ai-reviewer): summary, line comments, security hints, and replies when mentioned.

Workflow file: `.github/workflows/presubmit.yml`

---

## 1. Add your Gemini API key (required)

The key is **not** stored in the repo. Add it as a GitHub **repository secret**:

1. Open [Google AI Studio → API keys](https://aistudio.google.com/app/apikeys)
2. Create an API key (Gemini)
3. In GitHub: **Repository → Settings → Secrets and variables → Actions**
4. Click **New repository secret**
5. Set:
   | Field | Value |
   |-------|--------|
   | **Name** | `LLM_API_KEY` |
   | **Secret** | Your Gemini API key from AI Studio |

Direct link (replace `OWNER/REPO`):

`https://github.com/susil-bot/luxgen-monorepo/settings/secrets/actions`

> **Do not** commit the key to `.env`, workflow files, or `render.yaml`. Only the secret name `LLM_API_KEY` appears in YAML; the value lives in GitHub Settings.

---

## 2. What runs in CI

| Item     | Value                                             |
| -------- | ------------------------------------------------- |
| Workflow | `.github/workflows/presubmit.yml`                 |
| Trigger  | PR opened, updated, reopened; new review comments |
| Model    | `gemini-2.5-flash` (Google AI Studio)             |
| Provider | `ai-sdk` (default Presubmit provider)             |

`GITHUB_TOKEN` is provided automatically by GitHub Actions — no extra secret needed.

---

## 3. Optional: change model

Edit `LLM_MODEL` in `.github/workflows/presubmit.yml`. Supported Gemini names include:

- `gemini-2.5-flash` (default — fast, good for reviews)
- `gemini-2.5-pro` (deeper, slower)
- `gemini-2.0-flash-001` (stable flash)

Full list: [presubmit/ai-reviewer `src/ai.ts`](https://github.com/presubmit/ai-reviewer/blob/main/src/ai.ts)

The model **must** match the provider of `LLM_API_KEY` (Gemini key → Gemini model name).

---

## 4. PR controls

| Command / pattern           | Effect                                               |
| --------------------------- | ---------------------------------------------------- |
| `@presubmit` in PR title    | Auto-generate title/description (per Presubmit docs) |
| Comment `@presubmit ignore` | Skip review on that PR                               |
| Reply in review threads     | Presubmit can answer follow-up questions             |

---

## 5. Local dry-run (optional)

For maintainers testing reviews locally:

```bash
# Clone presubmit/ai-reviewer, then:
pnpm install && pnpm build
# .env at repo root:
# LLM_API_KEY=<your-gemini-key>
# LLM_MODEL=gemini-2.5-flash
pnpm review -- --pr 123 --dry-run
```

Requires [GitHub CLI](https://cli.github.com/) authenticated (`gh auth login`).

---

## 6. Fork PRs

`pull_request_target` runs in the base repo context so secrets are available for PRs **into** `main`. External fork PRs still need the secret on the upstream repo (already configured above). If `LLM_API_KEY` is missing, the workflow fails with a link to this doc.

---

## Troubleshooting

| Symptom                             | Fix                                                    |
| ----------------------------------- | ------------------------------------------------------ |
| `LLM_API_KEY is not configured`     | Add secret in GitHub Settings (step 1)                 |
| `Unknown LLM model`                 | Use a model name from Presubmit's supported list       |
| `model not found` / 404 from Gemini | Switch to `gemini-2.0-flash-001` or `gemini-2.5-flash` |
| No review comment                   | Check Actions tab → **Presubmit.ai** job logs          |

_Last updated: 2026-06-20_
