# luxgen-monorepo — AWS Free-Tier Build Runbook

Step-by-step console build guide: exact resource names, exact fields, exact contents. This is the execution companion to [`AWS_FREE_TIER_DEPLOYMENT.md`](./AWS_FREE_TIER_DEPLOYMENT.md) — read that first for the *why* behind each decision (why no ALB, why MongoDB stays on EC2, why SSM Parameter Store over Secrets Manager, etc.). This doc is just the *how*, in order.

**Prepared for:** `luxgen-monorepo` production deployment, $0/month AWS free tier, <20 concurrent internal users
**Date:** 2026-07-07

Do these in order — each step depends on ARNs/names created in the one before it. Naming convention used throughout: `luxgen-prod-<thing>`. **Region: `us-east-1`** for everything — this is required (not just convenient) because the ACM certificate used with CloudFront in step 11 *must* be requested in `us-east-1` regardless of where your other resources live, so there's no reason to split regions.

Replace `<ACCOUNT_ID>` with your 12-digit AWS account ID (top-right of the console) and `<YOURDOMAIN>` with your actual domain wherever they appear below.

---

## Step 1 — Root account hardening (do this first, before creating anything else)
- **IAM → Users → Add user**
  - Name: `pugal-admin`
  - Access: AWS Management Console access only (no access key yet)
  - Permissions: attach `AdministratorAccess` (managed policy) directly for now — you'll stop using this once step 9's deploy role exists
  - Enable **MFA** on this user immediately: IAM → Users → `pugal-admin` → Security credentials → Assign MFA device
- Enable MFA on the **root** user too (IAM → root user → Security credentials), then stop using root for anything from here on.

---

## Step 2 — Billing guardrail (before any resource exists to bill)
- **Billing and Cost Management → Budgets → Create budget**
  - Budget type: Cost budget
  - Name: `luxgen-prod-zero-dollar-budget`
  - Period: Monthly
  - Budgeted amount: `$1.00`
  - Alert threshold: `80%` of budgeted amount ($0.80), actual cost
  - Alert recipient: your email (the SNS topic from step 5 can be wired in later, but email works immediately with zero dependencies)
- **Billing → Free Tier** page: note whether EC2/EBS show a 12-month allowance or not — this determines whether the compute layer is genuinely $0 for your account.

---

## Step 3 — S3 buckets
Bucket names are globally unique across *all* AWS accounts, so the account ID is appended to guarantee uniqueness.

**S3 → Create bucket**, twice:

| Field | Bucket 1 | Bucket 2 |
|---|---|---|
| Bucket name | `luxgen-prod-assets-<ACCOUNT_ID>` | `luxgen-prod-backups-<ACCOUNT_ID>` |
| Region | `us-east-1` | `us-east-1` |
| Block Public Access | Keep all 4 boxes checked (block everything) | Keep all 4 boxes checked |
| Bucket Versioning | Disable (assets), or Enable if you want asset history | Enable (protects backups from accidental overwrite) |
| Default encryption | SSE-S3 (default, free) | SSE-S3 (default, free) |

---

## Step 4 — SQS queue + dead-letter queue
**SQS → Create queue**, twice, in this order (DLQ first, so it exists to reference):

**Queue 1 — the DLQ:**
| Field | Value |
|---|---|
| Name | `luxgen-prod-jobs-dlq` |
| Type | Standard |
| Visibility timeout | 30 seconds (default) |
| Message retention | 14 days (max — gives you the longest window to inspect failed jobs) |

**Queue 2 — the main queue:**
| Field | Value |
|---|---|
| Name | `luxgen-prod-jobs` |
| Type | Standard |
| Visibility timeout | 60 seconds (should exceed your worker's longest job processing time) |
| Message retention | 4 days |
| Dead-letter queue | Enable → select `luxgen-prod-jobs-dlq` → Maximum receives: `3` |

Note the **ARN** shown at the top of each queue's detail page — you'll paste both into the IAM policy in step 7.

---

## Step 5 — SNS topic + email subscription
**SNS → Topics → Create topic**
| Field | Value |
|---|---|
| Type | Standard |
| Name | `luxgen-prod-alerts` |

Then **Create subscription** on that topic:
| Field | Value |
|---|---|
| Protocol | Email |
| Endpoint | your email address |

Confirm the subscription via the email AWS sends you — alarms are silent until you do this. Note the topic's **ARN** for step 7.

---

## Step 6 — SSM Parameter Store (your `.env` values, moved out of the repo)
**Systems Manager → Parameter Store → Create parameter**, once per row. Use **SecureString** for anything secret, **String** for plain config.

| Name | Type | Value |
|---|---|---|
| `/luxgen/prod/MONGO_ROOT_USERNAME` | SecureString | pick a value |
| `/luxgen/prod/MONGO_ROOT_PASSWORD` | SecureString | generate a strong password |
| `/luxgen/prod/MONGO_DATABASE` | String | `luxgen` |
| `/luxgen/prod/MONGODB_URI` | SecureString | `mongodb://<user>:<password>@localhost:27017/luxgen?authSource=admin` |
| `/luxgen/prod/JWT_SECRET` | SecureString | generate a long random string |
| `/luxgen/prod/JWT_EXPIRES_IN` | String | `7d` |
| `/luxgen/prod/CORS_ORIGIN` | String | `https://<YOURDOMAIN>` |
| `/luxgen/prod/API_PORT` | String | `4000` |
| `/luxgen/prod/NEXT_PUBLIC_GRAPHQL_URL` | String | `https://<YOURDOMAIN>/api/graphql` |
| `/luxgen/prod/NEXT_PUBLIC_BASE_URL` | String | `https://<YOURDOMAIN>` |
| `/luxgen/prod/APOLLO_INTROSPECTION` | String | `false` |

Leave the KMS key as the default `aws/ssm` (no separate key to create — it's the free managed key).

**`NEXT_PUBLIC_GRAPHQL_URL` and `NEXT_PUBLIC_BASE_URL` are build-time, not runtime.** Next.js inlines every `NEXT_PUBLIC_*` variable into the browser bundle at **build time** — having them in Parameter Store only helps if step 14's deploy also passes them to `docker compose build` as build args (it does — see the updated step 14 below); pulling them into the container's runtime environment alone, like every other row in this table, has no effect on an already-built page. `NEXT_PUBLIC_GRAPHQL_URL` is read by `apps/web/graphql/client.ts`; `NEXT_PUBLIC_BASE_URL` by `apps/web/lib/tenant.ts` (builds tenant-subdomain links for the tenant switcher).

Every other row in this table is a normal runtime container env var, read fresh on each container start — rotating one just needs a container restart, not a rebuild.

---

## Step 7 — IAM policies and roles
Now that steps 3–6 exist, their ARNs can be referenced exactly (no more placeholders).

**IAM → Policies → Create policy → JSON tab.** Name it `luxgen-prod-ec2-app-policy`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3AppData",
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject"],
      "Resource": [
        "arn:aws:s3:::luxgen-prod-assets-<ACCOUNT_ID>/*",
        "arn:aws:s3:::luxgen-prod-backups-<ACCOUNT_ID>/*"
      ]
    },
    {
      "Sid": "SQSJobs",
      "Effect": "Allow",
      "Action": ["sqs:SendMessage", "sqs:ReceiveMessage", "sqs:DeleteMessage", "sqs:GetQueueAttributes"],
      "Resource": "arn:aws:sqs:us-east-1:<ACCOUNT_ID>:luxgen-prod-jobs"
    },
    {
      "Sid": "SNSAlerts",
      "Effect": "Allow",
      "Action": "sns:Publish",
      "Resource": "arn:aws:sns:us-east-1:<ACCOUNT_ID>:luxgen-prod-alerts"
    },
    {
      "Sid": "SSMConfig",
      "Effect": "Allow",
      "Action": ["ssm:GetParameter", "ssm:GetParameters", "ssm:GetParametersByPath"],
      "Resource": "arn:aws:ssm:us-east-1:<ACCOUNT_ID>:parameter/luxgen/prod/*"
    },
    {
      "Sid": "Logs",
      "Effect": "Allow",
      "Action": ["logs:CreateLogStream", "logs:PutLogEvents", "logs:CreateLogGroup"],
      "Resource": "arn:aws:logs:us-east-1:<ACCOUNT_ID>:log-group:/luxgen/prod/*"
    }
  ]
}
```

**IAM → Roles → Create role**
| Field | Value |
|---|---|
| Trusted entity | AWS service → EC2 |
| Name | `luxgen-prod-ec2-role` |
| Attach policies | `luxgen-prod-ec2-app-policy` (created above) + AWS managed `AmazonSSMManagedInstanceCore` |

Console creates a matching instance profile automatically (`luxgen-prod-ec2-role`, same name) — you'll select it by role name in step 9.

**Second role, for CI (create after step 16's GitHub OIDC provider exists — skip and come back):**
| Field | Value |
|---|---|
| Trusted entity | Web identity → `token.actions.githubusercontent.com` |
| GitHub org/repo condition | your `org/luxgen-monorepo`, branch `main` |
| Name | `luxgen-prod-ci-deploy-role` |
| Policy | `luxgen-prod-ci-deploy-policy` — one statement: `ssm:SendCommand` restricted to `Resource: arn:aws:ec2:us-east-1:<ACCOUNT_ID>:instance/*` with condition `aws:ResourceTag/Name = luxgen-prod-app` |

---

## Step 8 — Security group
**EC2 → Security Groups → Create security group**
| Field | Value |
|---|---|
| Name | `luxgen-prod-ec2-sg` |
| Description | `luxgen prod app instance - HTTPS from CloudFront only, no open SSH` |
| VPC | default VPC |

Inbound rules:

| Type | Port | Source | Why |
|---|---|---|---|
| HTTPS | 443 | Custom — paste [CloudFront's managed prefix list](https://ip-ranges.amazonaws.com/ip-ranges.json) `com.amazonaws.global.cloudfront.origin-facing`, or start with `0.0.0.0/0` and tighten after step 12 | origin traffic only from the CDN |
| HTTP | 80 | `0.0.0.0/0` | only needed transiently for ACM HTTP validation, if you don't use DNS validation |

No inbound rule for port 22 — SSM Session Manager needs none. Outbound: leave the default "allow all" — the instance needs it to reach S3/SQS/SNS/SSM/ECR/Docker Hub.

---

## Step 9 — Launch Template
**EC2 → Launch Templates → Create launch template**
| Field | Value |
|---|---|
| Name | `luxgen-prod-lt` |
| AMI | Amazon Linux 2023 (free tier eligible, marked in the console) |
| Instance type | `t3.micro` |
| Key pair | none — "Don't include in launch template" (SSM only) |
| Security group | `luxgen-prod-ec2-sg` |
| IAM instance profile | `luxgen-prod-ec2-role` |
| Storage | 10 GiB gp3 (root) + add a second volume: 30 GiB gp3, device `/dev/xvdb` (MongoDB data) |

**Advanced details → User data:**

```bash
#!/bin/bash
dnf update -y
dnf install -y docker git
systemctl enable --now docker
curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 \
  -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# 2GB swap - 1GB RAM is tight with mongo+redis+api+web
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# format + mount the mongo data volume on first boot only
if ! blkid /dev/xvdb; then
  mkfs -t xfs /dev/xvdb
fi
mkdir -p /data/mongo
mount /dev/xvdb /data/mongo
echo '/dev/xvdb /data/mongo xfs defaults,nofail 0 2' >> /etc/fstab

mkdir -p /opt/luxgen
cd /opt/luxgen
git clone https://github.com/<your-org>/luxgen-monorepo.git .
# app deploy (build + up) runs in step 14, once, manually the first time
```

---

## Step 10 — Auto Scaling Group
**EC2 → Auto Scaling Groups → Create Auto Scaling group**
| Field | Value |
|---|---|
| Name | `luxgen-prod-asg` |
| Launch template | `luxgen-prod-lt` |
| VPC/subnet | default VPC, one public subnet |
| Desired / Min / Max capacity | `1` / `1` / `1` |
| Health check type | EC2 |
| Health check grace period | 300 seconds |
| Tags (propagate to instance) | `Name = luxgen-prod-app` |

---

## Step 11 — ACM certificate
**Certificate Manager → Request certificate** — **must be region `us-east-1`**, even if you picked a different region elsewhere.
| Field | Value |
|---|---|
| Domain name | `<YOURDOMAIN>` (add `www.<YOURDOMAIN>` too if needed) |
| Validation method | DNS validation |

ACM gives you a CNAME record to create. Add it at **your domain registrar's DNS** (not Route 53) — validation completes within a few minutes to an hour.

---

## Step 12 — CloudFront distribution
**CloudFront → Create distribution**
| Field | Value |
|---|---|
| Origin domain | your EC2 instance's public DNS (from the ASG's running instance, EC2 console) |
| Origin protocol | HTTPS only |
| Viewer protocol policy | Redirect HTTP to HTTPS |
| Alternate domain name (CNAME) | `<YOURDOMAIN>` |
| Custom SSL certificate | select the ACM cert from step 11 |
| Cache policy | `CachingOptimized` for static paths; consider `CachingDisabled` for `/graphql` if you add path-based behaviors later |
| Distribution name/comment | `luxgen-prod-cdn` |

Now go back to step 8 and tighten the security group's inbound 443 rule to the CloudFront prefix list if you left it open.

---

## Step 13 — DNS at your registrar
Add a record at your domain's existing DNS provider (not Route 53):
| Type | Name | Value |
|---|---|---|
| CNAME (or ALIAS/ANAME if apex + your registrar supports it) | `<YOURDOMAIN>` or `www` | the CloudFront distribution's domain name, e.g. `d123abcxyz.cloudfront.net` |

---

## Step 14 — First deploy
**Systems Manager → Session Manager → Start session** → select the `luxgen-prod-app` instance:

```bash
cd /opt/luxgen
# pull config from Parameter Store into a .env file. Compose auto-loads a
# file literally named .env in this directory for ${VAR} substitution -
# that's what feeds both the runtime `environment:` blocks AND the
# `build.args:` blocks (TENANT, NEXT_PUBLIC_GRAPHQL_URL, NEXT_PUBLIC_BASE_URL)
# in docker-compose.prod.yml, so NEXT_PUBLIC_GRAPHQL_URL / NEXT_PUBLIC_BASE_URL
# get baked into the Next.js build correctly in this one step - no separate
# build-arg command needed.
aws ssm get-parameters-by-path --path /luxgen/prod --with-decryption --recursive \
  --query "Parameters[*].[Name,Value]" --output text \
  | sed 's|/luxgen/prod/||' | awk '{print $1"="$2}' > .env

# drop prometheus/grafana from the prod compose file for this box -
# 1GB RAM doesn't have room for them; monitoring is CloudWatch instead
docker-compose -f docker-compose.yml -f docker-compose.prod.yml \
  up -d --build mongodb redis api web nginx
```

Sanity-check after it's up:
```bash
# API is actually the API, not a second web server - should return JSON,
# not an HTML page (if HTML, api is still running the wrong process)
curl -f http://localhost:4000/health
# web app responds
curl -f http://localhost:3000
# GraphQL endpoint exists (expect a GraphQL error about a missing query, not a 404)
curl -s http://localhost:4000/graphql -H 'Content-Type: application/json' -d '{"query":"{__typename}"}'
# all containers healthy, not just running
docker-compose -f docker-compose.yml -f docker-compose.prod.yml ps
```

---

## Step 14a — Updating an env var after the first deploy
Same SSM path as step 6, whether you're changing a value or adding a new one.

```bash
# 1. Update (or create) the parameter
aws ssm put-parameter --name /luxgen/prod/CORS_ORIGIN \
  --value "https://app.<YOURDOMAIN>" --type String --overwrite

# 2. On the instance (Session Manager), regenerate .env the same way as step 14
cd /opt/luxgen
aws ssm get-parameters-by-path --path /luxgen/prod --with-decryption --recursive \
  --query "Parameters[*].[Name,Value]" --output text \
  | sed 's|/luxgen/prod/||' | awk '{print $1"="$2}' > .env
```

Then apply it — which command depends on **what kind of variable it was**, and getting this wrong is the most common way a config change silently doesn't take effect:

| Variable changed | Command | Why |
|---|---|---|
| Anything **except** `NEXT_PUBLIC_GRAPHQL_URL` / `NEXT_PUBLIC_BASE_URL` / `TENANT` (e.g. `JWT_SECRET`, `CORS_ORIGIN`, `MONGO_ROOT_PASSWORD`) | `docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --no-build api` (swap `api` for `web`, `mongodb`, etc. as needed) | Plain runtime env var, read fresh from the container's environment on start — a restart is enough. |
| `NEXT_PUBLIC_GRAPHQL_URL`, `NEXT_PUBLIC_BASE_URL`, or `TENANT` | `docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build api web` | Baked into the compiled JS at **build time** (see step 6's note) — a restart alone reuses the old image and changes nothing. Both `api` and `web` share one image, so rebuild both even though only `web`'s bundle actually uses these values. |

After either kind of change, re-run the sanity checks from step 14 to confirm.

---

## Step 15 — CloudWatch alarms
**CloudWatch → Alarms → Create alarm**, three times, each with SNS action → `luxgen-prod-alerts`:

| Name | Metric | Condition |
|---|---|---|
| `luxgen-prod-ec2-status-check` | EC2 `StatusCheckFailed` | ≥ 1 for 2 consecutive periods |
| `luxgen-prod-ec2-cpu-high` | EC2 `CPUUtilization` | ≥ 80% for 3 consecutive 5-min periods |
| `luxgen-prod-sqs-jobs-backlog` | SQS `ApproximateAgeOfOldestMessage` on `luxgen-prod-jobs` | ≥ 900 seconds |

---

## Step 16 — GitHub Actions OIDC (for CI deploys)
**IAM → Identity providers → Add provider**
| Field | Value |
|---|---|
| Provider type | OpenID Connect |
| Provider URL | `https://token.actions.githubusercontent.com` |
| Audience | `sts.amazonaws.com` |

Then go back and finish creating `luxgen-prod-ci-deploy-role` from step 7, trusting this provider. Your GitHub Actions workflow assumes that role (via `aws-actions/configure-aws-credentials` with `role-to-assume`) and calls `ssm:SendCommand` to re-run the deploy script from step 14 on push to `main` — no AWS access keys stored in GitHub at any point.
