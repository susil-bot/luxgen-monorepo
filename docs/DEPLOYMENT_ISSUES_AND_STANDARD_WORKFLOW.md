# LuxGen Deployment — Issues Log, Optimizations, and Standard Workflow

This document consolidates every deployment-blocking issue found during the AWS free-tier + Vercel rollout, what was fixed, what's still open, and the standardized process to follow for future deploys on either side (API on EC2, web on Vercel). Read this before touching the deploy pipeline — it exists so the same bugs don't get rediscovered from scratch.

## Part 1 — Issues found and fixed

**Unrelated packages blocking both images.** The Dockerfile originally ran one `npx turbo run build` covering the entire monorepo, so a real TypeScript error in `packages/mcp-core` (against the MCP SDK's newer request-handler types — unrelated to this deploy work) failed the whole pipeline, blocking both `api` and `web`. Fixed by giving `api` and `web` independent Dockerfile build targets (`builder-api`/`runner-api`, `builder-web`/`runner-web`) that each scope their `turbo run build` to only their own real dependency graph via `--filter`. Neither app actually depends on `mcp-core`, `mcp-server`, `agent-worker`, `mobile`, or `native-ui`, so none of those need to compile to ship either image.

**EC2 disk too small.** The instance's root EBS volume was provisioned at only 8GB, and Docker's build cache alone was consuming 2.36GB, leaving it dangerously close to full. Free tier includes up to 30GB of EBS at no cost — the volume was resized to 30GB (`growpart` + `xfs_growfs`, no reboot needed). This should be the default size for any future free-tier instance in this project, not an afterthought.

**No swap, or swap lost after instance changes.** A 1GB swapfile was created but EC2 doesn't persist `swapon` across reboots unless added to `/etc/fstab` — it silently went back to 0B active at least once. Fixed by adding the swapfile entry to `/etc/fstab` so it survives reboots. Standard first step for any t3.micro-class instance running Node builds: 1GB+ swap, persisted.

**Node/V8 heap ceiling crash, not a real OOM.** Compiling `apps/api` (the heaviest package — Express, Apollo, Mongoose, Stripe types, GraphQL tooling all type-checked together) crashed with "JavaScript heap out of memory" after 8+ minutes, even though the OS still had RAM and swap available. V8 self-limits its heap based on detected system memory and gives up before actually exhausting what's available. Fixed with `ENV NODE_OPTIONS="--max-old-space-size=768"` in the `builder-api` Dockerfile stage, explicitly raising V8's own ceiling to match what the instance can actually provide.

**Internal packages `require()`-crashing at runtime.** All of `agent`, `auth`, `automation-flow`, `billing`, `config`, `core`, `db`, `storefront`, `utils` had `"main": "src/index.ts"` in their `package.json` — pointing Node's module resolution at raw TypeScript source. This compiles fine (tsc type-checks the source directly) but crashes at actual runtime with `SyntaxError: Unexpected token 'export'`, since plain `node` can't parse TS/ESM syntax. Fixed by pointing `"main"` at each package's real compiled output (`dist/index.js`, confirmed via each package's own `tsconfig.json` `outDir`).

**Regression from the fix above.** The first pass also changed each package's `"types"` field to `"dist/index.d.ts"` — but `tsconfig.base.json` never sets `"declaration": true`, so no `.d.ts` files are ever generated in this repo. That broke `@luxgen/agent`'s build with `TS2307: Cannot find module '@luxgen/config'`, since tsc resolves cross-package *type* information through the `"types"` field. Corrected by reverting `"types"` back to `"src/index.ts"` (real source, always available) while keeping `"main"` on the compiled `dist/index.js` — these two fields serve different consumers (tsc vs. Node) and can legitimately point at different files.

**`apps/web` has the identical latent bug, not yet triggered.** `apps/web` also depends on `@luxgen/config`, `@luxgen/db`, `@luxgen/billing`, `@luxgen/utils`, but none of them are in `next.config.js`'s `transpilePackages` list — meaning Next.js expects them pre-compiled, exactly like `apps/api` did. The root `package.json`'s `"build:web"` script was `turbo run build --filter=@luxgen/web` (no dependency-inclusion suffix), so it never actually built those dependencies first. Fixed the filter to `--filter=@luxgen/web...` (the trailing `...` is Turborepo's syntax for "this package plus everything it depends on"). Without this fix, the first real Vercel deploy would have hit the same "Cannot find module" crash currently affecting `api`.

**Git shell-session pitfalls (process, not code, but cost real time).** Multi-line command pastes starting with `sudo su - ec2-user` unreliably execute the following lines in the wrong shell; inline `#` comments break on zsh, which doesn't strip them in interactive mode by default; `git config --global --add safe.directory` is needed whenever a directory's owning user doesn't match the shell's current user. Standing rule going forward: run directory/user-switching commands alone, wait for the prompt, then paste the next block separately.

## Part 2 — Still open (tracked, not blocking)

`packages/ui`'s build script is `echo 'Skipping UI build due to TypeScript errors'` — a placeholder, not a real build. If `ui`'s `"main"` is ever changed to point at `dist/`, this will break immediately since no `dist/` is ever produced. Leave `ui`'s `main`/`types` on `src/index.ts` until this is actually fixed.

`packages/test-harness` has no `"build"` script and no `dist/` output at all. It's listed as a real (not dev) dependency of `apps/api`, which is likely a workspace-declaration mistake rather than intentional — check whether any production code path actually imports it; if not, move it to `devDependencies`.

`apps/api`'s `build-tolerant.js` wrapper still tolerates 43 pre-existing TypeScript errors (mostly Mongoose 7.x type-definition gaps in `packages/db`). This is a deliberate, documented, regression-guarded unblock — not a new issue — see `docs/CODEBASE_ARCHITECTURE_REVIEW.md` for the retirement plan.

`native-ui`, `design-tokens`, `types`, `mobile` were not audited for the same `main`/`types` runtime bug, since nothing currently depends on them at runtime the way `api`/`web` depend on the 9 already-fixed packages. Audit any of these the moment something starts actually importing them in a server context.

## Part 3 — Performance and reliability optimizations applied

Docker build scoped per-app via `turbo --filter` instead of building all 21 workspace packages for every image. `--concurrency=1` on the API's build so a 1-vCPU instance compiles one package at a time instead of several fighting over the same tiny RAM budget. `NODE_OPTIONS=--max-old-space-size=768` so V8 uses the RAM+swap that's actually available. 30GB disk instead of 8GB. Persisted 1GB swap. A safe build-then-swap deploy script (`scripts/deploy-api.sh`) that builds the new image before touching the running container, health-checks it, and automatically rolls back to the previous image on failure — replacing the old pattern of `docker compose up -d --build`, which could leave zero containers running if a build failed partway. A CI/CD pipeline (`.github/workflows/deploy-api.yml`) that compiles the image on GitHub's runners instead of the free-tier instance at all, using OIDC federation so no long-lived AWS credentials are stored anywhere.

## Part 4 — Deploying the frontend to Vercel

Code changes already made for this: `next.config.js`'s `output: 'standalone'` is now conditional on `process.env.VERCEL` (Vercel sets this automatically) — standalone output is a self-hosting/Docker concern and Vercel doesn't need it. Added `experimental.outputFileTracingRoot` pointing at the monorepo root, so Vercel's serverless-function file tracer correctly includes sibling `packages/*` files instead of stopping at `apps/web`'s own directory (a common, easy-to-miss monorepo+Vercel failure mode — it builds fine and then 404s/500s in production). Fixed `build:web`'s turbo filter per Part 1.

Steps to actually deploy:

Connect the GitHub repo in Vercel and set the project's **Root Directory** to `apps/web`. Override the **Build Command** to run from the monorepo root instead of just `apps/web`, so workspace dependencies get built first: `cd ../.. && npm run build:web`. Leave **Install Command** as the default (Vercel detects the root `package.json`'s `workspaces` field and runs `npm install` at the true repo root automatically once Root Directory is set).

Set these environment variables in the Vercel project's dashboard (Vercel doesn't read `.env` files from git or pull from AWS SSM — everything must be entered there directly): `NEXT_PUBLIC_GRAPHQL_URL` (pointing at the API — `https://api.luxgen.in/graphql` once DNS/TLS are live there, or a temporary `http://<ec2-ip>:4000/graphql` for early testing), `NEXT_PUBLIC_BASE_URL` (`https://luxgen.in`), `TENANT` (`demo`).

Add `luxgen.in` and `www.luxgen.in` as custom domains in the Vercel project's domain settings; Vercel will display the exact DNS records to create. Update those records wherever the domain's DNS is actually managed, verify with `dig luxgen.in +short` / `dig www.luxgen.in +short` that they resolve to Vercel's values, then disable (don't delete yet) the existing CloudFront distribution that currently serves the apex domain.

Update the API's `CORS_ORIGIN` (SSM parameter `/luxgen/prod/CORS_ORIGIN`) to match Vercel's deployed origin(s) — the browser will block cross-origin GraphQL requests otherwise.

## Part 5 — Standard workflow going forward

**Deploying an API change:** push to `main` touching `apps/api/**` or `packages/**`. If the GitHub Actions OIDC role is set up, this builds and deploys automatically. Until then, manually: SSM into the instance, `git pull origin main`, `./scripts/deploy-api.sh` — never raw `docker compose up -d --build`.

**Deploying a web change:** push to `main`. Vercel auto-builds and deploys on every push, with a preview URL on every pull request — no manual steps once the project is connected.

**Adding a new internal package that other packages/apps will `require()` at runtime:** give it a real `"build": "tsc"` script and a `tsconfig.json` with `"outDir": "./dist"`. Set `"main"` to `"dist/index.js"`. Leave `"types"` on `"src/index.ts"` unless `"declaration": true` is added to `tsconfig.base.json` repo-wide. If the consuming app is `apps/web`, either add the new package to `next.config.js`'s `transpilePackages` (lets Next.js compile it from source directly) or make sure whatever builds `apps/web` builds this package first via Turborepo's dependency graph (the `...` filter suffix).

**Before trusting any build "success":** a compile succeeding is not the same as the compiled output actually running. This session's core lesson — `tsc` reported success while `build-tolerant.js` correctly emitted output, and the resulting container still crashed on `node index.js` for an entirely separate reason. Always follow a successful build with an actual container start and a real health-check/GraphQL request, not just a green build log.
