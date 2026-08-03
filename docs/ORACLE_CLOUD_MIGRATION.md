# Migrating the API host: AWS EC2 → Oracle Cloud Always Free

## Why this migration exists

The AWS account currently running the API is on AWS's post-July-2025 free-tier model: a $200 credit balance and a hard 6-month account closure, whichever comes first — confirmed in-account as **closing Aug 18, 2026, with $174.49 credit remaining**. This is not a resource or configuration problem; no amount of Dockerfile or instance tuning extends that date. The account either converts to paid billing or stops working entirely on that date.

Oracle Cloud Infrastructure's "Always Free" tier is the replacement target: up to 4 ARM (Ampere A1) OCPUs and 24GB RAM total across instances, with no 6-month clock and no credit balance to deplete — it stays free indefinitely as long as an instance isn't sitting completely idle (Oracle reserves the right to reclaim instances with near-zero CPU utilization over an extended period; a live API server with real traffic is not what that policy targets). This is a substantially larger free allowance than the EC2 t3.micro this project has been running on (1GB RAM), which should remove the swap/heap-ceiling pressure that caused several build issues earlier in this project.

**Known friction, stated honestly:** Oracle's signup requires card verification for identity purposes (no charge on the free tier) and a nontrivial fraction of signups fail verification on the first attempt. Free ARM (A1.Flex) capacity is also sometimes unavailable in a given region ("out of host capacity") and may need a few retries across regions. Budget real time for this step and don't wait until close to Aug 18 to start it.

## What only you can do (manual, requires identity verification / console access)

1. Create an Oracle Cloud account at oracle.com/cloud/free — requires a phone number and a card for verification (not charged on Always Free resources). If verification fails, Oracle's support chat can usually push it through; this is a known, common issue, not a sign anything is wrong.
2. Provision a compute instance: shape `VM.Standard.A1.Flex`, 2–4 OCPUs / 12–24GB RAM (stay within the Always Free allowance — the console shows the exact free limits live), Ubuntu 22.04 LTS image, in whichever home region the account was created in (A1 capacity is region-locked to wherever you signed up).
3. Open the equivalent of a security group — Oracle calls it a **Security List** (or Network Security Group) — allowing inbound TCP 22 (SSH), 80/443 (HTTP/HTTPS via Caddy, per the existing architecture doc), and optionally 4000 for direct API testing before DNS cutover.
4. Add your SSH public key during instance creation (Oracle's console has a field for this, same idea as an EC2 key pair).
5. Note the instance's public IP — you'll give it to me (or set it yourself) for the DNS cutover step below.

## What I can prepare/do once you have SSH access

Everything else carries over directly — this project's Docker setup was already built to be host-agnostic:

- The Dockerfile's `builder-api`/`runner-api` split (Part 1 of `DEPLOYMENT_ISSUES_AND_STANDARD_WORKFLOW.md`) and `docker-compose.prod.yml` need no changes. Docker images build natively for ARM64 on an ARM host — no `--platform` flag or emulation needed, and this codebase has **no native/binary npm dependencies** (checked: no `bcrypt`, `sharp`, `canvas`, `sqlite3`, `grpc`, or similar packages that would need arch-specific prebuilt binaries), so there's no known reason the build would behave differently on ARM than it did on x86.
- `scripts/deploy-api.sh`'s build-then-swap-then-health-check-then-rollback logic is unchanged.
- MongoDB Atlas and the CORS/cookie fixes from this session are host-independent — nothing there references AWS at all.
- Redis: still runs as a container alongside the API via the existing compose file, same as on EC2.
- The one AWS-specific piece that doesn't carry over: **SSM Session Manager and the GitHub Actions OIDC role** (`.github/workflows/deploy-api.yml`) are AWS IAM constructs with no Oracle equivalent. Deploys become plain SSH (`ssh ubuntu@<oracle-ip> "cd /opt/luxgen && ./scripts/deploy-api.sh"`) instead of `aws ssm send-command`. I'll update the GitHub Actions workflow to SSH in with a deploy key (stored as a GitHub secret) instead of assuming an AWS role — same automated-deploy-on-push behavior, different transport.

## Cutover plan (no downtime)

1. Provision the Oracle instance and get the API running there fully (Docker, MongoDB Atlas connection, Redis, health check passing) while the AWS instance keeps serving production traffic untouched.
2. Point a temporary subdomain (e.g. `api-oracle.luxgen.in`) at the Oracle instance and verify the full login → GraphQL → refresh-token flow works end-to-end against it from the actual `luxgen.shop` frontend (Vercel env var can be flipped to this temporary URL for a quick manual test without touching production DNS).
3. Once verified, update `api.luxgen.in`'s DNS record to the Oracle instance's IP. DNS propagation is typically minutes given this project's existing low TTLs (already confirmed working via `dig` earlier in this project).
4. Keep the AWS EC2 instance running, untouched, for a few days as a rollback option (just flip DNS back) — it's already paid for out of the remaining credit balance regardless.
5. Once confirmed stable, decommission the EC2 instance and let the AWS account lapse on its own after Aug 18 (or convert to paid if you want to keep AWS around for something else — no obligation either way).

## Status

Not started — waiting on you to create the Oracle account and provision the instance (the identity-verification step neither I nor any automation can do on your behalf). Tell me the instance's public IP and SSH access once it's up, and I'll take it from there: Docker install, deploying the existing images, Caddy/TLS setup, and the DNS cutover.
