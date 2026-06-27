# Infrastructure Validation & React Native Expo Feasibility

> **Parent:** [Technical docs](../README.md) · **Related:** [../../MOBILE_STORE_ROADMAP.md](../../MOBILE_STORE_ROADMAP.md)

> **Type:** Architecture Analysis Document
> **Date:** 2026-06-20
> **Scope:** (1) Full K8s + CI/CD infrastructure audit with fixes; (2) React Native Expo monorepo feasibility study
> **Verdict summary:** Infrastructure has 14 blocking/high issues before it can serve production traffic. Expo in the same monorepo is **fully feasible** — the backend is already mobile-compatible with zero API changes needed.

---

## Part 1 — Infrastructure Validation

### 1.1 Deployment Topology (What Exists)

```
namespace: luxgen
─────────────────────────────────────────────────────────────
 Ingress (nginx)  ← single host: luxgen.yourdomain.com
      │
      ├─ /api(/**)     → api-service:4000   (Deployment, replicas:2)
      ├─ /graphql(/**) → api-service:4000
      └─ /(**)         → web-service:3000   (Deployment, replicas:2)

 api-service:4000  → api pods (Express + Apollo)
 web-service:3000  → web pods (Next.js)

 agent-worker      (Deployment, replicas:1) — NO Service endpoint needed
 mongodb           (StatefulSet, replicas:1) → mongodb-service:27017
 redis             (StatefulSet, replicas:1) → redis-service:6379
 ollama            (StatefulSet, replicas:1) → ollama-service:11434

 PVCs (standalone): mongodb-pvc(10Gi), redis-pvc(5Gi), ollama-pvc(20Gi)  ← UNUSED
 PVCs (from StatefulSet volumeClaimTemplates):
   mongodb-storage-mongodb-0 (10Gi)
   redis-storage-redis-0 (5Gi)
   ollama-storage-ollama-0 (20Gi)
```

---

### 1.2 Blocking Issues (Fix Before Any Production Deploy)

#### BLK-01 — Ingress API URL mismatch

**Files:** `k8s/configmap.yaml:11` · `k8s/ingress.yaml:18`

`configmap.yaml` sets:

```yaml
NEXT_PUBLIC_API_URL: 'https://api.luxgen.yourdomain.com'
NEXT_PUBLIC_GRAPHQL_URL: 'https://api.luxgen.yourdomain.com/graphql'
```

But `ingress.yaml` defines **only one host** (`luxgen.yourdomain.com`). There is no Ingress rule for `api.luxgen.yourdomain.com`. The frontend will fail to reach the backend in production — every GraphQL call and REST call will 404 or time out.

**Fix — choose one of two approaches:**

Option A (recommended) — route API under the same host:

```yaml
# configmap.yaml
NEXT_PUBLIC_API_URL: 'https://luxgen.yourdomain.com'
NEXT_PUBLIC_GRAPHQL_URL: 'https://luxgen.yourdomain.com/graphql'
```

Option B — add a second Ingress host for `api.`:

```yaml
# ingress.yaml — add second rules entry
- host: api.luxgen.yourdomain.com
  http:
    paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api-service
            port:
              number: 4000
```

And add `api.luxgen.yourdomain.com` to the TLS `hosts` list and `CORS_ORIGIN`.

---

#### BLK-02 — TLS entirely disabled, all traffic over HTTP

**File:** `k8s/ingress.yaml:12-14, 42-46`

Both the cert-manager annotations and the `tls:` block are commented out. All auth tokens, billing data, and session cookies flow over plaintext HTTP.

**Fix:**

```yaml
# ingress.yaml
metadata:
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
spec:
  tls:
    - hosts:
        - luxgen.yourdomain.com
      secretName: luxgen-tls
  rules:
    - host: luxgen.yourdomain.com
      ...
```

Prerequisite: `cert-manager` must be installed in the cluster (`kubectl apply -f https://github.com/cert-manager/cert-manager/releases/latest/download/cert-manager.yaml`).

---

#### BLK-03 — `secret.yaml` committed with plaintext credentials

**File:** `k8s/secret.yaml:7-16`

The file uses `stringData` (plaintext, not base64) and contains values like `YOUR_SECURE_PASSWORD` and `YOUR_JWT_SECRET_MIN_32_CHARS_CHANGE_IN_PRODUCTION`. If someone runs `kubectl apply -f secret.yaml` on this file, placeholder credentials go live. Even as a template file, its presence trains developers to keep secrets in source control.

**Fix:**

1. Delete `k8s/secret.yaml` from the repo.
2. Add `k8s/secret.yaml` to `.gitignore`.
3. Create `k8s/secret.yaml.example` with documented placeholder keys only (no values).
4. In `deploy.sh`, the existing `.env.production` → `kubectl create secret` flow is correct — keep that path as the only way to create secrets.
5. Long-term: move to Sealed Secrets or External Secrets Operator.

```bash
# .gitignore
k8s/secret.yaml
.env.production
```

---

#### BLK-04 — Agent-worker probes target non-existent HTTP server

**File:** `k8s/agent-worker.yaml:46-65`

The liveness and readiness probes run:

```
node -e "require('http').get('http://localhost:4000/health', ...)"
```

The agent-worker process (`runWorkerLoop`) is a queue-polling loop. It binds no HTTP server on any port. Both probes will always exit with code 1 → Kubernetes will restart the pod in an infinite crash loop.

**Fix — replace with a process-alive exec probe:**

```yaml
livenessProbe:
  exec:
    command:
      - /bin/sh
      - -c
      - 'test -f /tmp/agent-worker.pid && kill -0 $(cat /tmp/agent-worker.pid)'
  initialDelaySeconds: 30
  periodSeconds: 30
  failureThreshold: 3
readinessProbe:
  exec:
    command:
      - /bin/sh
      - -c
      - 'node -e "const r=require(''@luxgen/db'');process.exit(0)"'
  initialDelaySeconds: 15
  periodSeconds: 20
  failureThreshold: 3
```

Better long-term fix: add a minimal health HTTP server to the worker process:

```typescript
// apps/agent-worker/src/health.ts
import http from 'http';
export function startHealthServer(port = 9090) {
  http.createServer((_, res) => res.writeHead(200).end('OK')).listen(port);
}
```

Then use `httpGet: { path: /, port: 9090 }` in the probe. Update the liveness probe port and remove the dead `agent-worker-service` (see BLK-07).

---

#### BLK-05 — Orphaned PVCs wasting 35Gi of storage

**Files:** `k8s/pvc.yaml` · `k8s/mongodb.yaml:59-73` · `k8s/redis.yaml:59-66`

`pvc.yaml` defines:

- `mongodb-pvc` (10Gi)
- `redis-pvc` (5Gi)
- `ollama-pvc` (20Gi)

But `mongodb.yaml` and `redis.yaml` use `volumeClaimTemplates` inside their StatefulSets, which auto-create their own PVCs named `mongodb-storage-mongodb-0` and `redis-storage-redis-0`. The standalone PVCs in `pvc.yaml` are **never referenced by any pod** — they exist in the cluster consuming 35Gi of storage with nothing attached to them.

`ollama.yaml` also uses `volumeClaimTemplates`, so `ollama-pvc` is equally unused.

**Fix:** Delete `k8s/pvc.yaml` entirely. The StatefulSets manage their own storage.

```bash
# After verifying the StatefulSet PVCs exist:
kubectl delete pvc mongodb-pvc redis-pvc ollama-pvc -n luxgen
```

---

#### BLK-06 — deploy.sh blocks indefinitely on Ollama model pull

**File:** `k8s/deploy.sh:95`

```bash
kubectl wait --for=condition=ready pod -l app=ollama -n luxgen --timeout=300s
```

The Ollama StatefulSet's readiness probe runs `ollama list`. On first boot, Ollama must download the model files referenced at startup. The `ollama-pvc` is 20Gi — model downloads can take 10-30 minutes on a cold cluster. The 5-minute timeout will expire and kill the deploy script before other services (Ingress, config verification) are applied.

**Fix:**

```bash
# deploy.sh — deploy Ollama separately, don't block on it
echo "🧠 Deploying Ollama (async — will be ready when model download completes)..."
kubectl apply -f ollama.yaml
# Do NOT wait for ollama — it takes up to 30 min on first pull

# Deploy ingress immediately after apps are ready
kubectl apply -f ingress.yaml

echo "⚠️  Ollama may still be downloading. Check: kubectl logs statefulset/ollama -n luxgen"
```

---

#### BLK-07 — Agent-worker Service is dead (no backend)

**File:** `k8s/agent-worker.yaml:66-83`

A `ClusterIP Service` is defined routing port 4000 to `agent-worker` pods. The agent-worker has no HTTP server and binds no ports. The Service has no reachable backend and will return connection refused on every call. It also misleads future developers into thinking the worker exposes an HTTP API.

**Fix:** Delete the Service definition from `agent-worker.yaml`. If a health endpoint is added (BLK-04 fix), expose port 9090 instead of 4000.

---

### 1.3 High-Severity Issues

#### H-01 — MONGODB_URI double-mounted in api.yaml

**File:** `k8s/api.yaml:26-36`

`MONGODB_URI` is injected twice:

1. Via `envFrom.secretRef` (line 26-29) — all keys from `luxgen-secrets` including `MONGODB_URI`
2. Via individual `env.secretKeyRef` (lines 31-36)

The individual `env` entry overrides `envFrom`. The duplication is confusing and causes future debuggers to check the wrong place.

**Fix:** Remove the individual `MONGODB_URI` env block (lines 31-36). The `envFrom.secretRef` already provides it.

---

#### H-02 — No NetworkPolicy (all pods can reach MongoDB and Redis)

**Missing file:** `k8s/networkpolicy.yaml`

Every pod in the `luxgen` namespace can connect to `mongodb-service:27017` and `redis-service:6379`. If any pod is compromised (e.g., via a supply chain attack on `ollama/ollama:latest`), the attacker has direct database access.

**Fix — create `k8s/networkpolicy.yaml`:**

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: mongodb-access
  namespace: luxgen
spec:
  podSelector:
    matchLabels:
      app: mongodb
  ingress:
    - from:
        - podSelector:
            matchLabels:
              component: backend # api pods
        - podSelector:
            matchLabels:
              component: worker # agent-worker pods
  policyTypes:
    - Ingress
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: redis-access
  namespace: luxgen
spec:
  podSelector:
    matchLabels:
      app: redis
  ingress:
    - from:
        - podSelector:
            matchLabels:
              component: backend
        - podSelector:
            matchLabels:
              component: worker
  policyTypes:
    - Ingress
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: ollama-access
  namespace: luxgen
spec:
  podSelector:
    matchLabels:
      app: ollama
  ingress:
    - from:
        - podSelector:
            matchLabels:
              component: backend
        - podSelector:
            matchLabels:
              component: worker
  policyTypes:
    - Ingress
```

---

#### H-03 — GraphQL WebSocket subscriptions will fail at the Ingress

**File:** `k8s/ingress.yaml:28-34`

The `/graphql` Ingress path has no WebSocket upgrade annotations. The server uses `graphql-ws` (WebSocket protocol) for subscriptions. Nginx will not upgrade the HTTP connection to WebSocket without explicit annotations.

**Fix — add to ingress.yaml annotations:**

```yaml
nginx.ingress.kubernetes.io/proxy-read-timeout: '3600'
nginx.ingress.kubernetes.io/proxy-send-timeout: '3600'
nginx.ingress.kubernetes.io/configuration-snippet: |
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
```

---

#### H-04 — Images use `:latest` tag (not pinned to commit)

**Files:** `k8s/api.yaml:22` · `k8s/web.yaml:22` · `k8s/agent-worker.yaml:21`

```yaml
image: luxgen/api:latest
image: luxgen/web:latest
image: luxgen/agent-worker:latest
```

`:latest` is non-deterministic. A rollback becomes impossible because `imagePullPolicy: IfNotPresent` (the Kubernetes default) may keep a cached stale image, while another node pulls the new `:latest`. Both nodes run different code.

**Fix — use git SHA tags:**

```yaml
image: ghcr.io/your-org/luxgen-api:${GIT_SHA}
```

In CI/CD:

```bash
GIT_SHA=$(git rev-parse --short HEAD)
docker build -t ghcr.io/your-org/luxgen-api:${GIT_SHA} ...
kubectl set image deployment/api api=ghcr.io/your-org/luxgen-api:${GIT_SHA} -n luxgen
```

---

#### H-05 — No HPA (Horizontal Pod Autoscaler)

**Missing files:** `k8s/hpa.yaml`

API and web are hard-coded at `replicas: 2`. Under a traffic spike, pods will OOM/CPU-throttle with no automatic scale-out. Under low traffic, 2 replicas per service waste ~$150/month on most cloud providers.

**Fix — create `k8s/hpa.yaml`:**

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-hpa
  namespace: luxgen
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: web-hpa
  namespace: luxgen
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web
  minReplicas: 2
  maxReplicas: 8
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
```

---

#### H-06 — No PodDisruptionBudget for databases

**Missing files:** `k8s/pdb.yaml`

Without a PDB, a cluster drain (node upgrade, spot instance eviction) can evict the MongoDB pod while it is processing a write, causing data corruption or loss.

**Fix — create `k8s/pdb.yaml`:**

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: mongodb-pdb
  namespace: luxgen
spec:
  maxUnavailable: 0 # zero disruption allowed — only 1 replica
  selector:
    matchLabels:
      app: mongodb
---
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: redis-pdb
  namespace: luxgen
spec:
  maxUnavailable: 0
  selector:
    matchLabels:
      app: redis
```

---

#### H-07 — Ollama has no GPU node affinity or tolerations

**File:** `k8s/ollama.yaml`

Ollama with `qwen2.5-coder:7b` requires either GPU acceleration (preferred) or substantial CPU (4 cores, 8GB RAM as defined in resources). Without node affinity, Ollama will be scheduled on any node — including nodes shared with the API and web containers — causing CPU starvation for production traffic.

**Fix — add nodeSelector and taint toleration:**

```yaml
# k8s/ollama.yaml — add to spec.template.spec:
nodeSelector:
  workload-type: 'cpu-intensive' # or "gpu" if GPU nodes exist
tolerations:
  - key: 'dedicated'
    operator: 'Equal'
    value: 'ollama'
    effect: 'NoSchedule'
```

Alternatively, if GPU nodes exist:

```yaml
nodeSelector:
  accelerator: nvidia-tesla-t4
tolerations:
  - key: nvidia.com/gpu
    operator: Exists
    effect: NoSchedule
resources:
  limits:
    nvidia.com/gpu: 1
```

---

#### H-08 — deploy.sh is incompatible with CI/CD (interactive prompts)

**File:** `k8s/deploy.sh:49`

`read -p "Have you already created the secret? (y/n)"` blocks indefinitely in any non-interactive environment (GitHub Actions, Jenkins, ArgoCD hook).

**Fix:**

```bash
#!/bin/bash
set -euo pipefail    # ← add -u (unset var = error) and pipefail

# Replace interactive prompt with CI-compatible check
if [ -f .env.production ]; then
  kubectl create secret generic luxgen-secrets \
    --namespace=luxgen \
    --from-env-file=.env.production \
    --dry-run=client -o yaml | kubectl apply -f -
elif [ -n "${LUXGEN_SECRETS_ALREADY_EXIST:-}" ]; then
  echo "✅ Using pre-existing secret (LUXGEN_SECRETS_ALREADY_EXIST=true)"
else
  echo "❌ Neither .env.production nor LUXGEN_SECRETS_ALREADY_EXIST is set."
  echo "   In CI: set LUXGEN_SECRETS_ALREADY_EXIST=true"
  echo "   Locally: create .env.production from deploy/env/production.env.example"
  exit 1
fi
```

---

### 1.4 Medium-Severity Issues

#### M-01 — CI test job has `continue-on-error: true`

**File:** `.github/workflows/ci.yml:92`

```yaml
test:
  ...
  continue-on-error: true
```

CI passes even when all tests fail. This makes the test job decorative — it has no enforcement value.

**Fix:** Remove `continue-on-error: true`. If tests are currently too flaky to enforce, fix the flaky tests first (they're the entire auth layer as found in the codebase audit).

---

#### M-02 — No CD pipeline — CI never builds or pushes images

**Files:** `.github/workflows/ci.yml` · `.github/workflows/web-build.yml`

CI lints, formats, builds TypeScript, and runs tests. It never:

- Builds Docker images
- Pushes to a container registry
- Triggers a K8s rolling update

There is no connection between a merged PR and a running pod update.

**Fix — add a CD job to `ci.yml`:**

```yaml
deploy:
  name: Deploy to production
  runs-on: ubuntu-latest
  needs: [test]
  if: github.ref == 'refs/heads/main' && github.event_name == 'push'
  steps:
    - uses: actions/checkout@v4

    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3

    - name: Login to GHCR
      uses: docker/login-action@v3
      with:
        registry: ghcr.io
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}

    - name: Build and push API
      uses: docker/build-push-action@v5
      with:
        context: .
        file: apps/api/Dockerfile
        push: true
        tags: ghcr.io/${{ github.repository }}/api:${{ github.sha }}
        cache-from: type=gha
        cache-to: type=gha,mode=max

    - name: Build and push web
      uses: docker/build-push-action@v5
      with:
        context: .
        file: apps/web/Dockerfile
        push: true
        tags: ghcr.io/${{ github.repository }}/web:${{ github.sha }}

    - name: Deploy to K8s
      uses: azure/k8s-set-context@v3
      with:
        kubeconfig: ${{ secrets.KUBECONFIG }}

    - name: Roll out new images
      run: |
        kubectl set image deployment/api api=ghcr.io/${{ github.repository }}/api:${{ github.sha }} -n luxgen
        kubectl set image deployment/web web=ghcr.io/${{ github.repository }}/web:${{ github.sha }} -n luxgen
        kubectl rollout status deployment/api -n luxgen
        kubectl rollout status deployment/web -n luxgen
```

---

#### M-03 — MongoDB runs without replica set (no replication, no transactions)

**File:** `k8s/mongodb.yaml`

Single-instance MongoDB with no `--replSet` flag. Two consequences:

1. MongoDB multi-document transactions (used in `groupService.ts` `deleteGroup`) require replica set mode — they will throw `MongoServerError: Transaction numbers are only allowed on a replica set member or mongos` in production.
2. No automatic failover or oplog for backup tools.

**Fix — add replica set init to mongodb.yaml:**

```yaml
command:
  - mongod
  - --replSet
  - rs0
  - --bind_ip_all
```

Add an init container or initScript to run `rs.initiate()` on first boot:

```yaml
initContainers:
  - name: mongo-init
    image: mongo:7.0
    command:
      - bash
      - -c
      - |
        until mongosh --eval "db.adminCommand('ping')" --quiet; do sleep 2; done
        mongosh --eval "try { rs.status() } catch(e) { rs.initiate({_id:'rs0',members:[{_id:0,host:'mongodb:27017'}]}) }"
```

---

#### M-04 — Fly.io config will lose Stripe webhooks on cold start

**File:** `deploy/platforms/fly.api.toml:15-16`

```toml
auto_stop_machines = "stop"
min_machines_running = 0
```

With zero minimum machines, the API process stops when idle. Stripe webhooks arrive asynchronously — if they hit the API during cold start (~3-5 seconds), Stripe may receive a timeout and retry with exponential back-off, or mark the webhook as failed.

**Fix:**

```toml
auto_stop_machines = "suspend"   # suspend (fast resume) instead of stop
min_machines_running = 1         # always at least 1 machine alive for webhooks
```

---

#### M-05 — Render.yaml uses `plan: free` (service sleeps after 15 min)

**File:** `deploy/platforms/render.yaml:9`

Render free tier instances sleep after 15 minutes of inactivity. A Stripe webhook or cron job hitting a sleeping instance receives a 502 after a 30-second cold start — too slow for Stripe's 20-second timeout.

**Fix:** Change to `plan: starter` minimum for the API. The web can remain on free if acceptable. Document this clearly in `deploy/README.md`.

---

#### M-06 — Turbo pipeline doesn't include `typecheck` task

**File:** `turbo.json`

TypeScript type checking is entirely absent from the CI pipeline. `tsc --noEmit` errors are only caught if a developer runs it locally.

**Fix:**

```json
// turbo.json
{
  "pipeline": {
    "typecheck": {
      "dependsOn": ["^build"],
      "outputs": []
    }
  }
}
```

Add `"typecheck": "tsc --noEmit"` to each `apps/*/package.json` and `packages/*/package.json`. Add a `typecheck` step to `ci.yml`.

---

### 1.5 Issue Summary Table

| ID     | File                          | Issue                                                        | Severity | Effort |
| ------ | ----------------------------- | ------------------------------------------------------------ | -------- | ------ |
| BLK-01 | configmap.yaml + ingress.yaml | API URL/Ingress host mismatch — frontend can't reach backend | BLOCKING | 15 min |
| BLK-02 | ingress.yaml                  | TLS disabled — all traffic over HTTP                         | BLOCKING | 30 min |
| BLK-03 | secret.yaml                   | Plaintext secrets committed to repo                          | BLOCKING | 1h     |
| BLK-04 | agent-worker.yaml             | Probes target non-existent HTTP server → crash loop          | BLOCKING | 1h     |
| BLK-05 | pvc.yaml                      | Orphaned PVCs waste 35Gi, never mounted                      | BLOCKING | 10 min |
| BLK-06 | deploy.sh                     | Blocks on Ollama download (30+ min) — script times out       | BLOCKING | 15 min |
| BLK-07 | agent-worker.yaml             | Dead Service with no backend pods                            | BLOCKING | 5 min  |
| H-01   | api.yaml                      | MONGODB_URI double-mounted                                   | HIGH     | 5 min  |
| H-02   | missing                       | No NetworkPolicy — all pods can reach DB                     | HIGH     | 1h     |
| H-03   | ingress.yaml                  | GraphQL WebSocket upgrade headers missing                    | HIGH     | 15 min |
| H-04   | all yamls                     | `:latest` image tags — not pinnable, rollback impossible     | HIGH     | 2h     |
| H-05   | missing                       | No HPA — no autoscaling                                      | HIGH     | 1h     |
| H-06   | missing                       | No PodDisruptionBudget for databases                         | HIGH     | 30 min |
| H-07   | ollama.yaml                   | No GPU node affinity — CPU starvation risk                   | HIGH     | 30 min |
| H-08   | deploy.sh                     | Interactive prompts break CI/CD                              | HIGH     | 30 min |
| M-01   | ci.yml                        | Tests `continue-on-error: true` — never fails CI             | MEDIUM   | 5 min  |
| M-02   | ci.yml                        | No CD pipeline — code never reaches Kubernetes               | MEDIUM   | 4h     |
| M-03   | mongodb.yaml                  | No replica set — transactions fail in production             | MEDIUM   | 2h     |
| M-04   | fly.api.toml                  | `min_machines=0` — cold starts drop Stripe webhooks          | MEDIUM   | 5 min  |
| M-05   | render.yaml                   | Free plan sleeps — Stripe webhooks fail                      | MEDIUM   | 5 min  |
| M-06   | turbo.json                    | No typecheck task in CI                                      | MEDIUM   | 1h     |

**Total estimated fix time: ~1.5 days of engineering effort** before this infrastructure is safe to point at production traffic.

---

### 1.6 Recommended Apply Order

```
Day 1 (blocking fixes):
  BLK-03  Delete secret.yaml, update .gitignore
  BLK-02  Enable TLS in ingress.yaml
  BLK-01  Fix configmap URL to match ingress host
  BLK-05  Delete pvc.yaml
  BLK-07  Remove dead agent-worker Service
  BLK-04  Fix agent-worker probes
  H-01    Remove duplicate MONGODB_URI mount
  H-08    Fix deploy.sh for CI compatibility
  BLK-06  Make Ollama deploy async

Day 2 (high/medium fixes):
  H-02    Add NetworkPolicy
  H-03    Add WebSocket Ingress annotations
  H-04    Switch to git SHA image tags
  M-03    Add MongoDB replica set init
  H-05    Add HPA
  H-06    Add PDB
  M-02    Add CD pipeline to GitHub Actions
  M-01    Remove continue-on-error from tests
  M-06    Add typecheck to Turbo pipeline
```

---

---

## Part 2 — React Native Expo Monorepo Feasibility

### 2.1 Feasibility Verdict

**Fully feasible. Recommended architecture: HIGH confidence.**

The existing backend is already structurally compatible with React Native. The key evidence:

| Requirement                               | Current status                                                                                  |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Tenant resolution without subdomain       | ✅ `tenantRoutingMiddleware` already checks `x-tenant` header (line 134 of `tenantRouting.ts`)  |
| Auth via header (not cookie)              | ✅ `Authorization: Bearer <token>` — mobile-native pattern                                      |
| GraphQL API                               | ✅ Apollo Server with `graphql-ws` subscriptions                                                |
| REST endpoints                            | ✅ Standard HTTP — works on mobile                                                              |
| No `document`/`window` in shared packages | ✅ `packages/billing`, `packages/auth`, `packages/db` types are Node.js-only or pure TypeScript |
| WebSocket subscriptions                   | ✅ `graphql-ws` works in React Native with URL polyfill                                         |

**Zero changes to the API are required** for the mobile app to connect. All integration work is on the mobile client and monorepo build configuration.

---

### 2.2 What Can Be Shared

```
packages/
  auth/          ← JWT decode (NOT sign/verify — server only)
                   Plan: share type definitions + jwt-decode usage
  billing/       ← PlanTier types, feature flags, plan definitions
                   Plan: share 100% — pure TypeScript, no Node deps
  db/src/        ← TypeScript interfaces (IUser, ICourse, IGroup, etc.)
                   Plan: share TYPES ONLY (not Mongoose model code)
  utils/         ← date.ts, math.ts, constants.ts — pure functions
                   Plan: share 100%
  config/        ← CANNOT share — reads process.env at init time
  shared/        ← validation.ts can be shared; encryption.ts uses Node crypto
  ui/            ← CANNOT share — React DOM components
```

**New package needed: `packages/types`**

Extract pure TypeScript interfaces from `packages/db` into a standalone package with zero runtime dependencies. This is the correct sharing boundary:

```
packages/types/
  src/
    user.ts         ← IUser, UserRole, UserStatus interfaces (no Mongoose)
    group.ts        ← IGroup, IGroupMember interfaces
    course.ts       ← ICourse, CourseStatus interfaces
    listing.ts      ← IBusinessListing interfaces
    enrollment.ts   ← IEnrollment interfaces
    automation.ts   ← IAutomation interfaces
    tenant.ts       ← ITenant interfaces
    billing.ts      ← re-exports from @luxgen/billing
    index.ts
```

Both `packages/db` and `apps/mobile` import from `@luxgen/types`. The DB package adds Mongoose schema on top of these interfaces.

---

### 2.3 Architecture of `apps/mobile`

```
apps/mobile/
├── package.json           ← name: "@luxgen/mobile"
├── app.json               ← Expo config (appId, icon, splash, plugins)
├── eas.json               ← EAS Build profiles (development, preview, production)
├── metro.config.js        ← CRITICAL: workspace symlink resolution
├── tsconfig.json          ← extends ../../tsconfig.base.json
├── babel.config.js
│
├── app/                   ← Expo Router (file-based routing)
│   ├── _layout.tsx        ← root layout: Apollo provider, auth context
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx    ← bottom tab navigator
│   │   ├── dashboard.tsx
│   │   ├── courses.tsx
│   │   ├── groups.tsx
│   │   └── profile.tsx
│   ├── courses/[id].tsx
│   ├── groups/[id].tsx
│   └── listings/index.tsx
│
├── components/
│   ├── ui/                ← React Native UI primitives (NOT from packages/ui)
│   ├── auth/
│   ├── courses/
│   └── groups/
│
├── hooks/
│   ├── useAuth.ts         ← reads from SecureStore, refreshes token
│   ├── useApolloClient.ts ← mobile Apollo client with x-tenant header
│   └── useTenant.ts       ← reads tenant from config / deep link
│
├── lib/
│   ├── apollo.ts          ← Apollo Client configured for mobile
│   ├── auth.ts            ← SecureStore token management
│   └── tenant.ts          ← tenant resolution logic for mobile
│
└── constants/
    └── api.ts             ← EXPO_PUBLIC_API_URL, EXPO_PUBLIC_GRAPHQL_URL
```

---

### 2.4 Critical: Metro Bundler Configuration

Metro does not resolve npm workspace symlinks by default. Without explicit configuration, imports from `@luxgen/types`, `@luxgen/billing`, etc. will fail with "module not found" in the Expo dev server.

**`apps/mobile/metro.config.js` — exact configuration required:**

```javascript
const { getDefaultConfig } = require('expo/metro-config');
const { FileStore } = require('metro-cache');
const path = require('path');

// Monorepo root
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch the entire monorepo for hot reloads of shared packages
config.watchFolders = [workspaceRoot];

// 2. Tell Metro where to resolve modules from — check monorepo root first
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Resolve workspace packages from their source (not dist/)
// This enables hot reload when editing shared packages
config.resolver.extraNodeModules = {
  '@luxgen/types': path.resolve(workspaceRoot, 'packages/types/src'),
  '@luxgen/billing': path.resolve(workspaceRoot, 'packages/billing/src'),
  '@luxgen/utils': path.resolve(workspaceRoot, 'packages/utils/src'),
  '@luxgen/auth': path.resolve(workspaceRoot, 'packages/auth/src'),
};

// 4. Persistent cache for faster subsequent builds
config.cacheStores = [new FileStore({ root: path.join(projectRoot, '.metro-cache') })];

module.exports = config;
```

---

### 2.5 Apollo Client for Mobile

The mobile Apollo client differs from the web client in three ways:

1. Sends `x-tenant` header (not relying on subdomain)
2. Reads token from `expo-secure-store` (not localStorage)
3. Uses React Native WebSocket for subscriptions

**`apps/mobile/lib/apollo.ts`:**

```typescript
import { ApolloClient, InMemoryCache, createHttpLink, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL!; // e.g. https://luxgen.yourdomain.com
const GRAPHQL_URL = `${API_URL}/graphql`;
const WS_URL = GRAPHQL_URL.replace('https://', 'wss://').replace('http://', 'ws://');

const httpLink = createHttpLink({ uri: GRAPHQL_URL });

const authLink = setContext(async (_, { headers }) => {
  const token = await SecureStore.getItemAsync('auth_token');
  const tenant = await SecureStore.getItemAsync('tenant_id');
  return {
    headers: {
      ...headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(tenant ? { 'x-tenant': tenant } : {}),
    },
  };
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: WS_URL,
    connectionParams: async () => {
      const token = await SecureStore.getItemAsync('auth_token');
      const tenant = await SecureStore.getItemAsync('tenant_id');
      return { authorization: token ? `Bearer ${token}` : '', 'x-tenant': tenant ?? '' };
    },
  }),
);

const splitLink = split(
  ({ query }) => {
    const def = getMainDefinition(query);
    return def.kind === 'OperationDefinition' && def.operation === 'subscription';
  },
  wsLink,
  authLink.concat(httpLink),
);

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});
```

---

### 2.6 Authentication on Mobile

On web, tokens are stored in `localStorage` (flagged as a security risk in DEVELOPER_AGENT_TODO). On mobile, use `expo-secure-store` which stores values in the device's secure enclave (Keychain on iOS, Android Keystore on Android).

**`apps/mobile/lib/auth.ts`:**

```typescript
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth_token';
const TENANT_KEY = 'tenant_id';
const TENANT_SUBDOMAIN_KEY = 'tenant_subdomain';

export async function saveSession(token: string, tenantId: string, subdomain: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  await SecureStore.setItemAsync(TENANT_KEY, tenantId);
  await SecureStore.setItemAsync(TENANT_SUBDOMAIN_KEY, subdomain);
}

export async function getToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function clearSession() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(TENANT_KEY);
  await SecureStore.deleteItemAsync(TENANT_SUBDOMAIN_KEY);
}
```

---

### 2.7 Tenant Selection on Mobile

Mobile apps have no subdomain. Three valid approaches for tenant selection:

**Option A — Tenant selector screen (recommended for B2B)**
On first launch, show a screen where the user types their organisation subdomain (e.g., `demo`). Store it in `SecureStore`. Send as `x-tenant: demo` header on all requests. The backend already handles this via the `headerTenant` fallback in `tenantRoutingMiddleware:134`.

**Option B — Deep link / Universal link**
Configure `luxgen://demo/login` or `https://demo.luxgen.yourdomain.com/app` to pre-populate the tenant. Requires `expo-linking` + `app.json` scheme config.

**Option C — QR code in the web dashboard**
Admin opens the web dashboard, clicks "Add Mobile Device" → shows QR code containing the tenant subdomain + a one-time auth token. Mobile scans it, auto-configures, and logs in.

**Recommended: Option A for MVP, Option B for polish.**

---

### 2.8 Turbo Pipeline Changes

Add the mobile app to the Turbo build graph:

```json
// turbo.json — add mobile tasks
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**", ".expo/**"]
    },
    "mobile#dev": {
      "cache": false,
      "persistent": true,
      "dependsOn": ["^build"]
    },
    "mobile#build:ios": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "mobile#build:android": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    }
  }
}
```

Add to root `package.json` scripts:

```json
{
  "scripts": {
    "dev:mobile": "turbo run dev --filter=@luxgen/mobile",
    "build:ios": "turbo run build:ios --filter=@luxgen/mobile",
    "build:android": "turbo run build:android --filter=@luxgen/mobile"
  }
}
```

---

### 2.9 EAS (Expo Application Services) CI Integration

Add to `.github/workflows/mobile.yml`:

```yaml
name: Mobile Build

on:
  push:
    branches: [main]
    paths:
      - 'apps/mobile/**'
      - 'packages/types/**'
      - 'packages/billing/**'
      - 'packages/utils/**'

jobs:
  eas-build:
    name: EAS Build (iOS + Android)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build shared packages
        run: npx turbo run build --filter=@luxgen/mobile^...

      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Build on EAS
        working-directory: apps/mobile
        run: eas build --platform all --profile preview --non-interactive
```

Trigger OTA updates on main-branch pushes (no app store review required for JS changes):

```yaml
- name: EAS Update (OTA)
  working-directory: apps/mobile
  run: eas update --branch production --message "Deploy ${{ github.sha }}"
```

---

### 2.10 New Dependencies Required

**`apps/mobile/package.json`:**

```json
{
  "name": "@luxgen/mobile",
  "dependencies": {
    "expo": "~52.0.0",
    "expo-router": "~4.0.0",
    "expo-secure-store": "~14.0.0",
    "expo-linking": "~7.0.0",
    "expo-notifications": "~0.29.0",
    "expo-constants": "~17.0.0",
    "@apollo/client": "^3.11.0",
    "graphql": "^16.0.0",
    "graphql-ws": "^5.0.0",
    "react-native-url-polyfill": "^2.0.0",
    "@luxgen/types": "*",
    "@luxgen/billing": "*",
    "@luxgen/utils": "*"
  }
}
```

**Backend — push notifications (new):**
Add to `apps/api/package.json` when push notifications are needed:

```json
"expo-server-sdk": "^3.10.0"
```

---

### 2.11 What Does NOT Work Out of the Box (and Fixes)

| Issue                                                           | Impact                            | Fix                                                                             |
| --------------------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------- |
| `react-native-url-polyfill` required for `graphql-ws`           | WebSocket subscriptions break     | Import at the top of `_layout.tsx`: `import 'react-native-url-polyfill/auto'`   |
| `packages/ui` uses `document`/DOM APIs                          | Build crash if imported in mobile | Never import `@luxgen/ui` in mobile — use `@luxgen/types` for shared types only |
| `packages/config/src/env.ts` reads `process.env` at module init | Metro bundler-time error          | Don't import `@luxgen/config` in mobile. Use Expo's `EXPO_PUBLIC_*` env vars    |
| `packages/shared/src/utils/encryption.ts` uses Node `crypto`    | Build crash                       | Don't import in mobile. Use `expo-crypto` for mobile encryption needs           |
| `packages/shared/src/utils/logger.ts` uses `process`            | Build crash                       | Don't import in mobile. Use `expo-constants` + console for mobile logging       |
| File uploads (bulk import feature)                              | Uses `FormData`                   | React Native `FormData` works; use `expo-document-picker` to select files       |
| Subdomain-based tenant resolution                               | Tenant never resolves             | Use `x-tenant` header — already supported by backend                            |

---

### 2.12 Push Notifications Architecture

Once the mobile app exists, push notifications for key events (new enrollment, group nudge, automation trigger) are a natural next step. This requires backend changes:

**New field on `IUser`:** `pushTokens: string[]` (Expo push tokens per device)

**New backend service:** `apps/api/src/services/pushNotificationService.ts`

```typescript
import { Expo } from 'expo-server-sdk';
const expo = new Expo();

async function sendPush(userId: string, title: string, body: string) {
  const user = await User.findById(userId).select('pushTokens');
  const messages = (user?.pushTokens ?? [])
    .filter((token) => Expo.isExpoPushToken(token))
    .map((token) => ({ to: token, title, body }));
  await expo.sendPushNotificationsAsync(messages);
}
```

This integrates with the `AutomationActionType.SEND_EMAIL` pattern — add `SEND_PUSH` as a new action type.

---

### 2.13 Implementation Roadmap

**Phase 1 — Foundation (1 sprint)**

1. Create `packages/types` with pure interfaces extracted from `@luxgen/db`
2. Create `apps/mobile` with Expo Router, Metro config, Apollo client
3. Implement tenant selector screen + `SecureStore` auth
4. Connect to GraphQL API — verify login, dashboard query, courses query work
5. Add mobile workflow to Turbo pipeline

**Phase 2 — Core Screens (2 sprints)** 6. Dashboard screen (reuse `GET_DASHBOARD_DATA` query — already exists in `graphql/queries/dashboard.ts`) 7. Courses list + detail screens 8. Groups list + detail + member list screens 9. User profile + settings screen 10. Add mobile CI to GitHub Actions with EAS Build

**Phase 3 — Mobile-Specific Features (1 sprint)** 11. Push notification registration (`expo-notifications` + save token to API) 12. Offline support for course content (Apollo cache persistence via `apollo3-cache-persist`) 13. Deep linking for tenant pre-configuration 14. App store submission (TestFlight + Google Play internal testing)

**Total estimate:** 4-5 sprints to a production-ready v1 mobile app sharing the existing backend.

---

### 2.14 Final Directory Structure After Expo Integration

```
luxgen-monorepo/
├── apps/
│   ├── api/                    existing
│   ├── web/                    existing
│   ├── agent-worker/           existing
│   └── mobile/                 NEW — Expo app
├── packages/
│   ├── types/                  NEW — pure TS interfaces (no Mongoose, no Node)
│   ├── billing/                existing — shared as-is
│   ├── utils/                  existing — shared as-is
│   ├── auth/                   existing — type definitions only shared
│   ├── db/                     existing — Mongoose models (backend only)
│   ├── ui/                     existing — React DOM components (web only)
│   ├── config/                 existing — backend only
│   ├── shared/                 existing — validation.ts shareable; encryption.ts not
│   └── agent/                  existing — backend only
├── k8s/                        existing + fixes
├── feature-discovery/          new docs
└── .github/workflows/
    ├── ci.yml                  existing + CD job added
    ├── web-build.yml           existing
    └── mobile.yml              NEW — EAS Build
```
