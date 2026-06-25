#!/bin/bash
# deploy.sh — Deploy LuxGen to Kubernetes
#
# Usage (local):
#   cp deploy/env/production.env.example .env.production
#   # fill in real values, then:
#   ./k8s/deploy.sh
#
# Usage (CI / non-interactive — secrets already exist in the cluster):
#   LUXGEN_SECRETS_ALREADY_EXIST=true ./k8s/deploy.sh
#
# Non-interactive mode skips secret creation when the cluster already has
# `luxgen-secrets`. No prompts are used; the script exits on the first error.
#
set -euo pipefail

NAMESPACE=luxgen
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Required keys — keep in sync with k8s/secret.yaml.example
REQUIRED_SECRET_KEYS=(
  MONGODB_URI
  JWT_SECRET
  JWT_EXPIRES_IN
  SEED_IF_EMPTY
  TENANT_DEMO_KEY
  TENANT_IDEA-VIBES_KEY
  MONGO_INITDB_ROOT_USERNAME
  MONGO_INITDB_ROOT_PASSWORD
  MONGO_INITDB_DATABASE
)

validate_env_production() {
  local env_file="$1"
  local missing=()
  local empty=()

  for key in "${REQUIRED_SECRET_KEYS[@]}"; do
    local line
    line="$(grep -E "^${key}=" "$env_file" | tail -n 1 || true)"
    if [ -z "$line" ]; then
      missing+=("$key")
      continue
    fi
    local value="${line#*=}"
    value="${value%\"}"
    value="${value#\"}"
    value="${value%\'}"
    value="${value#\'}"
    if [ -z "$value" ]; then
      empty+=("$key")
    fi
  done

  if [ "${#missing[@]}" -gt 0 ] || [ "${#empty[@]}" -gt 0 ]; then
    echo "❌ .env.production is missing required secret keys:"
    for key in "${missing[@]}"; do
      echo "   - $key (not set)"
    done
    for key in "${empty[@]}"; do
      echo "   - $key (empty value)"
    done
    echo ""
    echo "   See k8s/secret.yaml.example for the full list."
    exit 1
  fi
}

echo "🚀 Deploying LuxGen to Kubernetes..."

# ── Pre-flight checks ─────────────────────────────────────────────────────────

if ! command -v kubectl &>/dev/null; then
  echo "❌ kubectl is not installed. Please install kubectl first."
  exit 1
fi

if ! kubectl cluster-info &>/dev/null; then
  echo "❌ Not connected to a Kubernetes cluster. Please configure kubectl."
  exit 1
fi

echo "✅ kubectl connected to cluster"

# ── Namespace ─────────────────────────────────────────────────────────────────

echo "📦 Creating namespace..."
kubectl apply -f "$SCRIPT_DIR/namespace.yaml"

# ── Secrets ───────────────────────────────────────────────────────────────────

echo "🔐 Setting up secrets..."

if [ -f "$REPO_ROOT/.env.production" ]; then
  echo "📝 Using .env.production for secrets..."
  validate_env_production "$REPO_ROOT/.env.production"
  kubectl create secret generic luxgen-secrets \
    --namespace="$NAMESPACE" \
    --from-env-file="$REPO_ROOT/.env.production" \
    --dry-run=client -o yaml | kubectl apply -f -

elif [ "${LUXGEN_SECRETS_ALREADY_EXIST:-false}" = "true" ]; then
  echo "✅ Skipping secret creation — LUXGEN_SECRETS_ALREADY_EXIST=true"

else
  echo ""
  echo "❌ No secret source found. Provide one of:"
  echo ""
  echo "   Option A — env file (local):"
  echo "     cp deploy/env/production.env.example .env.production"
  echo "     # fill in values, then re-run this script"
  echo ""
  echo "   Option B — CI / pre-existing secret:"
  echo "     LUXGEN_SECRETS_ALREADY_EXIST=true ./k8s/deploy.sh"
  echo ""
  echo "   Option C — manual kubectl:"
  echo "     kubectl create secret generic luxgen-secrets \\"
  echo "       --namespace=$NAMESPACE \\"
  echo "       --from-literal=MONGODB_URI='...' \\"
  echo "       --from-literal=JWT_SECRET='...' \\"
  echo "       # (see k8s/secret.yaml.example for all required keys)"
  echo ""
  exit 1
fi

# ── ConfigMap ─────────────────────────────────────────────────────────────────

echo "⚙️  Applying configmap..."
kubectl apply -f "$SCRIPT_DIR/configmap.yaml"

# ── Databases ─────────────────────────────────────────────────────────────────

echo "🗄️  Deploying MongoDB..."
kubectl apply -f "$SCRIPT_DIR/mongodb.yaml"

echo "🔄 Deploying Redis..."
kubectl apply -f "$SCRIPT_DIR/redis.yaml"

echo "⏳ Waiting for databases (timeout 5m)..."
kubectl wait --for=condition=ready pod -l app=mongodb -n "$NAMESPACE" --timeout=300s
kubectl wait --for=condition=ready pod -l app=redis -n "$NAMESPACE" --timeout=300s

echo "🔧 Initialising MongoDB replica set (rs0)..."
if ! kubectl get job mongodb-rs-init -n "$NAMESPACE" -o jsonpath='{.status.succeeded}' 2>/dev/null | grep -q '^1$'; then
  kubectl delete job mongodb-rs-init -n "$NAMESPACE" --ignore-not-found
  kubectl apply -f "$SCRIPT_DIR/mongodb.yaml"
  kubectl wait --for=condition=complete job/mongodb-rs-init -n "$NAMESPACE" --timeout=300s
fi

echo "✅ Databases ready"

# ── Applications ──────────────────────────────────────────────────────────────

echo "🔧 Deploying API..."
kubectl apply -f "$SCRIPT_DIR/api.yaml"

echo "🌐 Deploying Web..."
kubectl apply -f "$SCRIPT_DIR/web.yaml"

echo "🤖 Deploying Agent Worker..."
kubectl apply -f "$SCRIPT_DIR/agent-worker.yaml"

echo "⏳ Waiting for applications (timeout 5m)..."
kubectl wait --for=condition=ready pod -l app=api -n "$NAMESPACE" --timeout=300s
kubectl wait --for=condition=ready pod -l app=web -n "$NAMESPACE" --timeout=300s
kubectl wait --for=condition=ready pod -l app=agent-worker -n "$NAMESPACE" --timeout=300s
echo "✅ Applications ready"

# ── Ingress ───────────────────────────────────────────────────────────────────

echo "🌍 Deploying Ingress..."
kubectl apply -f "$SCRIPT_DIR/ingress.yaml"

# ── Ollama (async — model download can take 10-30 min on first run) ───────────

echo "🧠 Deploying Ollama (async — will be ready when model download completes)..."
kubectl apply -f "$SCRIPT_DIR/ollama.yaml"
echo "⏳ Ollama is downloading the model in the background."
echo "   Monitor progress: kubectl logs statefulset/ollama -n $NAMESPACE -f"

# ── Done ──────────────────────────────────────────────────────────────────────

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Check status:"
echo "   kubectl get pods -n $NAMESPACE"
echo "   kubectl get services -n $NAMESPACE"
echo "   kubectl get ingress -n $NAMESPACE"
echo ""
echo "🔍 View logs:"
echo "   kubectl logs -f deployment/api -n $NAMESPACE"
echo "   kubectl logs -f deployment/web -n $NAMESPACE"
echo "   kubectl logs -f deployment/agent-worker -n $NAMESPACE"
echo "   kubectl logs -f statefulset/ollama -n $NAMESPACE"
echo ""
echo "⚠️  Before going live, verify:"
echo "   1. yourdomain.com updated in k8s/ingress.yaml and k8s/configmap.yaml"
echo "   2. cert-manager installed: kubectl get pods -n cert-manager"
echo "   3. Docker images built and pushed to your registry"
echo "   4. Image names updated in k8s/api.yaml, k8s/web.yaml, k8s/agent-worker.yaml"
