# luxgen-monorepo — AWS Free-Tier Deployment Architecture

**Prepared for:** internal SaaS deployment of `luxgen-monorepo` (Next.js web + Express/Apollo GraphQL API + MongoDB + Redis, multi-tenant)
**Target:** genuinely $0/month, <20 concurrent internal users, production only, domain already owned
**Date:** 2026-07-07

---

## 0. Free tier reality check (read this first)

AWS overhauled its Free Tier on **July 15, 2025**. This changes what "free" means depending on when your AWS account was created, so the whole plan below is built to be safe either way.

| Category | What's in it | Applies to |
|---|---|---|
| **12-month free tier** | EC2 750 hrs/mo (t2.micro/t3.micro), RDS 750 hrs/mo, EBS 30GB, ALB 750 hrs + 15 LCU | Only accounts created **before July 15, 2025** |
| **New account credits** | Up to $200 credit, valid 6 months | Accounts created **on/after July 15, 2025** — expires, not a perpetual free tier |
| **Always Free (permanent, any account)** | Lambda 1M invocations, DynamoDB 25GB + 25 WCU/25 RCU, S3 5GB/20k GET/2k PUT, SNS 1M publishes, SQS 1M requests, CloudFront 1TB egress + 10M requests, CloudWatch basic metrics/alarms, SSM Parameter Store (standard params) | **Everyone, forever** |

**Implication for you:** you didn't confirm your account's creation date. So this plan is built on the **Always Free** column wherever it changes the architecture materially, and calls out explicitly where it leans on the 12-month EC2 allowance (which is the one piece that is *not* guaranteed $0 forever — check **Billing → Free Tier** in the console to see which bucket you're in before building).

Two things that are **never free** and are easy to add by accident: **Route 53 hosted zones** ($0.50/mo each) and **NAT Gateways** (~$0.045/hr + data). Both are avoided in this design.

Sources: [AWS Free Tier](https://aws.amazon.com/free/), [AWS Free Tier 2026 changes — InfraTally](https://infratally.com/articles/aws-free-tier-2026.html), [EC2 Free Tier usage tracking](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-free-tier-usage.html), [SES pricing 2026](https://aws.amazon.com/ses/pricing/)

---

## 1. Requirements

**Functional:** host Next.js web app, Express/Apollo GraphQL API, MongoDB, Redis, nginx reverse proxy — the exact stack already defined in `docker-compose.prod.yml`. Multi-tenant, custom domain, TLS.

**Non-functional:** $0/month hard budget, <20 concurrent users, single production environment, self-healing over horizontal scale, internal tool (not public-internet-critical, some downtime during instance replacement is acceptable).

**Constraint that shapes everything:** the EC2 "750 free hours/month" allowance is *combined across all running instances in the account/region* — it covers exactly **one instance running 24/7**, not two. That single fact rules out real horizontal auto-scaling and any load-balancer-with-2-targets pattern while staying at $0. The design below treats this as a hard constraint, not an oversight.

---

## 2. High-level architecture

```
                                    Your domain (existing registrar DNS)
                                              |
                                    A record -> CloudFront distribution
                                              |
                        ┌─────────────────────────────────────────┐
                        │   CloudFront (Always Free: 1TB egress,   │
                        │   10M req/mo) + ACM cert (free)          │
                        └─────────────────────┬─────────────────────┘
                                              |  origin (HTTPS)
                        ┌─────────────────────▼─────────────────────┐
                        │              VPC (default, free)          │
                        │   Public subnet, no NAT Gateway            │
                        │  ┌───────────────────────────────────┐    │
                        │  │  EC2 t3.micro (Auto Scaling Group  │    │
                        │  │  min=max=desired=1 — self-healing) │    │
                        │  │                                     │    │
                        │  │  nginx  ─┬─> web (Next.js :3000)   │    │
                        │  │          └─> api (Express/Apollo   │    │
                        │  │               GraphQL :4000)        │    │
                        │  │  redis (cache, in-container)        │    │
                        │  │  mongodb (in-container, data on     │    │
                        │  │  EBS gp3 volume, persists across    │    │
                        │  │  instance replacement)              │    │
                        │  │  worker (SQS consumer, background   │    │
                        │  │  jobs: email, tenant provisioning)  │    │
                        │  └───────────────────────────────────┘    │
                        │   Security Group: 443 (from CloudFront    │
                        │   IP ranges only) + SSM (no open :22)     │
                        └─────────────────────┬─────────────────────┘
                                              |
                ┌───────────────┬─────────────┼─────────────┬───────────────┐
                │               │             │             │               │
           S3 (assets,     SQS (async     SNS (ops       CloudWatch    SSM Parameter
           backups, logs   jobs: email,   alerts +       Alarms        Store (config,
           — 5GB free)     provisioning)  tenant events) (CPU, status, DB creds —
                           1M req free    1M pub free    billing)      free)
```

IAM roles gate every arrow above — see §6.

---

## 3. Compute — EC2 + Auto Scaling Group

**Instance:** `t3.micro` (1 vCPU burstable, 1GB RAM), Amazon Linux 2023, single AZ.

Running MongoDB + Redis + Node API + Next.js on 1GB RAM is tight but workable at <20 concurrent internal users. Two mitigations:

- Add a **2GB swap file** on first boot (belt-and-braces against OOM kills — swap is free, it's just disk).
- Set the t3 **CPU credit mode to "standard"**, not "unlimited." Unlimited mode lets the instance burst past its credit balance and bills you for the overage — standard mode just throttles CPU instead, which is what you want on a $0 budget.

**Auto Scaling Group, not a bare instance.** Set `min=1, max=1, desired=1` across the single AZ, with an EC2 health check. This is not "autoscaling" in the horizontal-scale sense — it's **self-healing**: if the instance fails a health check or the AZ has an issue, the ASG terminates and replaces it automatically from a Launch Template, and your MongoDB data survives because it lives on a separate EBS volume (see §5) that reattaches to the new instance via a small boot script (or a lifecycle hook that mounts the known volume ID). This is the honest, free-tier-compatible answer to "auto-scaling" — true multi-instance scale-out would double your EC2 hours and break the $0 budget (see §9 for the paid upgrade path).

**Launch Template contents:**
- AMI: Amazon Linux 2023 (free)
- User data: install Docker + Docker Compose, mount EBS volume, `docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d`
- IAM instance profile: see §6
- No key pair required — use SSM Session Manager for shell access (§4)

---

## 4. Networking, load balancing, and edge

**No ALB, no NAT Gateway.** Given the "strict $0" constraint and the ambiguity around whether ALB's 750-hr allowance still applies to your account, this design uses:

- **Default VPC** (free), one public subnet, EC2 gets a **public IP** directly.
- **Security Group:** inbound 443 only, ideally restricted to [CloudFront's published IP ranges](https://ip-ranges.amazonaws.com/ip-ranges.json) so the origin can't be hit directly; inbound 80 open only for Let's Encrypt/ACM validation if needed. **No inbound 22** — use AWS Systems Manager Session Manager for shell access (requires only the `AmazonSSMManagedInstanceCore` policy on the instance role, itself free) instead of opening SSH.
- **CloudFront** sits in front as the "load balancer" layer:
  - TLS termination via a **free ACM certificate** for your domain
  - Always Free tier: 1TB egress + 10M requests/month, forever, on any account
  - Caches Next.js static assets, taking load off the 1GB instance
  - Gives you edge presence and basic DDoS absorption that a lone EC2 instance wouldn't have
- **DNS:** point an `A`/`ALIAS` record at CloudFront **from your existing domain registrar's DNS**, not Route 53. A Route 53 hosted zone costs $0.50/month — skip it entirely unless you want the convenience later.
- **nginx** (already in your stack, `nginx.conf`) keeps doing what it does today: routes `/` to the `web` container and `/graphql` (or your API path) to `api`, plus the rate-limiting zones already configured.

If you later get budget for a real ALB + multi-AZ setup, that's a drop-in replacement for this layer — nothing else in the design changes.

---

## 5. Data layer — MongoDB, Redis, and the DynamoDB question

You said you're open to AWS-native alternatives. Here's the honest trade-off, presented as two phases rather than a single forced choice:

**Phase 1 (recommended starting point — zero app code changes):**
Keep MongoDB and Redis exactly as they are today, containerized alongside the API on the single EC2 instance. Mount a **30GB EBS gp3 volume** for MongoDB's data directory (`/data/db`), separate from the root volume, so:
- Instance replacement (ASG self-healing) doesn't lose data — the volume reattaches.
- You can snapshot the volume to S3-backed EBS snapshots for backup (small, infrequent, effectively free at this data size).
- Redis stays ephemeral/in-memory (cache semantics), which is fine — it rebuilds from MongoDB on restart.

This is the lowest-effort path and matches your existing `docker-compose.prod.yml` almost exactly.

**Phase 2 (optional, if/when you want to be independent of EC2 entirely):**
Migrate to **DynamoDB** (Always Free: 25GB storage + 25 WCU/25 RCU provisioned capacity, permanent, any account) for primary data, and drop Redis in favor of DynamoDB Accelerator or just rely on DynamoDB's own low latency for a workload this small. This requires rewriting the `@luxgen/db` package's Mongoose models into a DynamoDB single-table design — a real engineering effort, not a config change — but it means your data layer survives independently of whatever happens to EC2 free-tier eligibility, and removes ~300-500MB of memory pressure from the 1GB instance. **Do not treat this as a Phase 1 requirement** — it's a deliberate re-architecture, not a hosting swap.

**ElastiCache is not part of any free tier** — there is no free managed Redis. Containerized Redis-on-EC2 (Phase 1) or dropping Redis for DynamoDB (Phase 2) are the only $0 options.

---

## 6. IAM — roles and policies

Two roles, both least-privilege, no long-lived access keys anywhere:

**`luxgen-ec2-instance-role`** (attached via instance profile to the ASG Launch Template):
- `AmazonSSMManagedInstanceCore` (managed policy — enables Session Manager, no open SSH)
- Custom inline policy scoped to:
  - `s3:GetObject`, `s3:PutObject` on `arn:aws:s3:::luxgen-app-assets/*` and `luxgen-app-backups/*` only
  - `sqs:SendMessage`, `sqs:ReceiveMessage`, `sqs:DeleteMessage` on the specific queue ARNs (§7)
  - `sns:Publish` on the specific topic ARN (§7)
  - `ssm:GetParameter`, `ssm:GetParameters` on `arn:aws:ssm:*:*:parameter/luxgen/*` only (config/secrets, §8)
  - `cloudwatch:PutMetricData` and `logs:CreateLogStream`/`logs:PutLogEvents` scoped to a `luxgen/*` log group

**`luxgen-ci-deploy-role`** (assumed by GitHub Actions via **OIDC federation** — no stored AWS keys in GitHub secrets):
- `ssm:SendCommand` scoped to the specific instance tag, to trigger `git pull && docker compose up -d --build` remotely
- Optionally `ecr:GetAuthorizationToken` + push/pull on one named repo, if you adopt ECR (§10)

**General rules applied throughout:**
- No `*` resource ARNs anywhere in a custom policy.
- No use of the AWS root account for anything after initial setup — create an IAM Identity Center (or IAM user, if Identity Center is overkill for one admin) with MFA for console access.
- Every policy is named `luxgen-<purpose>` so a `iam:ListPolicies` audit is self-explanatory.

---

## 7. Messaging — SQS and SNS

Both are Always Free (1M requests/month each, permanent), and map cleanly onto workflows already implied by your repo (`scripts/init-tenant-workflow.js`, `scripts/init-tenants.js`):

- **`luxgen-jobs` (SQS standard queue):** decouples slow/bursty work from the API's request path — transactional email, tenant provisioning steps, report generation. The API enqueues; a small worker process (same EC2 instance, separate container, long-polling) consumes. This keeps GraphQL mutations fast and gives you retry semantics (visibility timeout + a dead-letter queue, `luxgen-jobs-dlq`, for anything that fails 3x) for free.
- **`luxgen-alerts` (SNS topic):** fan-out for anything that should notify a human — CloudWatch Alarms publish here, and an email subscription (free) delivers it to your inbox. You can later add a Slack webhook subscription to the same topic without touching the alarm config.

Both are configured with **access policies scoped to the specific IAM role ARN** in §6, not `"Principal": "*"`.

---

## 8. Configuration and secrets

Use **SSM Parameter Store, Standard tier** (free, no limit relevant at this scale) for everything currently in your `.env` — `JWT_SECRET`, `MONGODB_URI`, `CORS_ORIGIN`, etc. Store sensitive values as `SecureString` (encrypted with the AWS-managed `aws/ssm` key — no KMS key management fee, and API calls fall well inside the 20,000/month KMS free-tier allowance for this scale).

**Do not use AWS Secrets Manager** — it's $0.40/secret/month with no free tier, and Parameter Store does the same job at $0 for a single-environment setup like this.

The EC2 boot script pulls parameters at container start (`aws ssm get-parameters --with-decryption`) and writes them into the container environment — no secrets baked into the image or committed to the repo.

---

## 9. Autoscaling and resilience — the honest version

You asked for autoscaling explicitly, so it's worth being direct: **real horizontal autoscaling is not compatible with a strict $0 budget**, because the EC2 free allowance is 750 combined hours/month — enough for exactly one instance running continuously, not two. What this plan gives you instead:

- **Self-healing, not scale-out**: ASG with `min=max=desired=1` replaces a failed instance automatically (§3).
- **Vertical headroom**: `t3.micro` can be resized to `t3.small`/`t3.medium` in the Launch Template with a one-line change if 20 concurrent users turns out to be too tight — this costs money (no longer free) but requires no architecture change.
- **When to graduate to real autoscaling** (documented, not built): once budget allows, add a second AZ, a target-tracking scaling policy (CPU > 60%), and put the ALB from §4 back in as a true multi-target load balancer. Because MongoDB would need to move off the instance for this to work safely (two instances can't share one container's local Mongo), this is also the point where the Phase 2 DynamoDB migration (§5) stops being optional.

---

## 10. Containers and images

Your existing multi-stage `Dockerfile` (deps → builder → runner) is reused as-is. Two options for getting images onto the instance:

- **Simplest, $0, no registry (recommended for a single instance):** build directly on the EC2 host — `docker compose -f docker-compose.yml -f docker-compose.prod.yml build && up -d` as part of the deploy step. No registry to manage, no image-pull auth, and build time on a `t3.micro` for this monorepo is the main cost (a few minutes, not money).
- **If you want CI-built images (faster deploys, build happens in GitHub Actions instead of on the box):** push to **Amazon ECR**. ECR's free allowance (500MB-month private storage) has historically sat in the 12-month bucket, not confirmed Always Free — for images this small (a Next.js + Node runner image, typically 150–300MB per service) even paying standard ECR storage rates after 12 months is a few cents a month, not a budget-breaker, but it's not guaranteed $0. Flag it as a deliberate trade rather than assuming it's free.

Either way: tag images with the git SHA, not `:latest`, so a bad deploy is a one-line rollback (`docker compose up -d` with the previous tag) rather than a rebuild.

---

## 11. Observability and — critically — a billing alarm

- **CloudWatch Alarms** (Always Free basic tier) on: EC2 status check failures (triggers ASG replacement), CPU > 80% sustained (early warning before the t3 credit balance runs out), and SQS `ApproximateAgeOfOldestMessage` (worker falling behind).
- All alarms publish to `luxgen-alerts` (SNS, §7) → your email.
- **Set up an AWS Budget with a $1 threshold, alerting to the same SNS topic.** This is the single most important line item in this entire plan for a "strict $0" requirement — Budgets are free to create, and a $1 alarm means you find out about any free-tier overage the same day, not at the end of the billing cycle. Do this before you launch anything else.
- CloudWatch Logs: ship container stdout/stderr to a `luxgen/*` log group, 5GB/month ingestion is Always Free, well above what an internal tool at this scale will produce.

---

## 12. Cost breakdown — what's genuinely $0 vs. what to watch

| Component | Service | Cost | Notes |
|---|---|---|---|
| Compute | EC2 t3.micro, 1 instance, ASG min=max=1 | **$0** if account has 12-mo allowance; **not guaranteed $0** on post-July-2025 accounts once credits expire | Confirm your account's Free Tier bucket first |
| Storage (root) | EBS gp3, 8-10GB | $0 within 30GB 12-month allowance; ~$0.08/GB-mo after | |
| Storage (Mongo data) | EBS gp3, extra volume | Same as above | |
| Static/backups | S3, <5GB | **$0, Always Free** | |
| CDN/TLS | CloudFront + ACM | **$0, Always Free** (1TB/10M req) | |
| DNS | Existing registrar A record | **$0** | Avoided Route 53 hosted zone ($0.50/mo) |
| Async jobs | SQS | **$0, Always Free** (1M req) | |
| Alerts | SNS | **$0, Always Free** (1M publish) | |
| Config/secrets | SSM Parameter Store | **$0** | Avoided Secrets Manager ($0.40/secret/mo) |
| Monitoring | CloudWatch basic + Budgets | **$0, Always Free** | |
| Cache | Redis (containerized) | **$0** | No managed ElastiCache free tier exists |
| Email (if added) | SES | $0 for 3,000 messages, **one-time 12 months** | Not the old "62k free from EC2" perk — that's gone |
| Container registry (optional) | ECR | Likely $0, small risk of pennies/mo after 12 months | Optional — skip by building on-host |

**Net: $0/month is achievable**, with the one real dependency being your account's EC2 free-tier eligibility. If you're on a post-July-2025 account with no 12-month EC2 allowance, the entire compute layer needs re-costing (a `t3.micro` on-demand runs roughly $7-8/month) — worth checking **before** building any of this.

---

## 13. Step-by-step console build guide

The full click-by-click runbook — exact resource names, exact console fields, exact IAM policy JSON, security group rules, launch template user-data script, and SSM parameter list, in dependency order — now lives in its own file: [`AWS_FREE_TIER_RUNBOOK.md`](./AWS_FREE_TIER_RUNBOOK.md). This document (the architecture) is the *why*; that one is the *how*.

Quick summary of what it walks through, in order: root/IAM hardening → $1 billing budget → S3 buckets → SQS queue+DLQ → SNS topic → SSM parameters → IAM roles/policies → security group → launch template → Auto Scaling Group → ACM certificate → CloudFront → DNS → first deploy → CloudWatch alarms → GitHub Actions OIDC.

---

## 14. What I'd revisit as this grows

- **>20 concurrent users or CPU credits routinely exhausted:** resize to `t3.small`, still single instance — cheap, no redesign.
- **Need true zero-downtime deploys or multi-AZ:** this is the trigger for the Phase 2 DynamoDB migration (§5) and reintroducing a real ALB (§4/§9) — at that point you're intentionally leaving the $0 tier.
- **Compliance/audit requirements appear:** add AWS Config + CloudTrail (both have free allowances but are easy to blow past with verbose logging — budget-alarm them specifically).
- **Team grows past one deployer:** move from IAM users to IAM Identity Center / SSO, and split the single `luxgen-ci-deploy-role` into per-environment roles once a staging environment exists.
