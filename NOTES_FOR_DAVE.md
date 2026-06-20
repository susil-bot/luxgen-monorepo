# Notes for Dave

## Git Account Setup — luxgen-monorepo

**Issue found (2026-06-20):** Commits in this repo were being authored from two different accounts because the global git config points to the Condé Nast work account.

| Config level         | Name        | Email                                                             |
| -------------------- | ----------- | ----------------------------------------------------------------- |
| Global (system-wide) | `susil`     | `sobhanasusil_suresh@condenast.com` — **Condé Nast work account** |
| Local (this repo)    | `susil-bot` | `susilfreelancer@gmail.com` — **Personal/project account**        |

**Fix applied:** Set a repo-level git config override so all future commits in this repo use the personal account:

```bash
git config --local user.name "susil-bot"
git config --local user.email "susilfreelancer@gmail.com"
```

This is stored in `.git/config` and does not affect any other repos.

**GitHub CLI** is already authenticated as `susil-bot` — no change needed there.

**Action needed on any new machine / fresh clone:** Run the two `git config --local` commands above after cloning, since `.git/config` is not committed to the repo.

---

## Earlier commits with wrong author

Some commits in the repo history were pushed under `sobhanasusil_suresh@condenast.com`. These are already merged and rewriting history is not worth the disruption. All new commits going forward will be from `susilfreelancer@gmail.com`.
