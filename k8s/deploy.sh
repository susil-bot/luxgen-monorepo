#!/bin/bash
set -e

echo "🚀 Deploying LuxGen to Kubernetes..."

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed. Please install kubectl first."
    exit 1
fi

# Check if connected to cluster
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ Not connected to a Kubernetes cluster. Please configure kubectl."
    exit 1
fi

echo "✅ kubectl is available and connected to cluster"

# Create namespace
echo "📦 Creating namespace..."
kubectl apply -f namespace.yaml

# Create secrets (prompt for values if not set)
echo "🔐 Setting up secrets..."
if [ -f .env.production ]; then
    echo "📝 Using .env.production file for secrets..."
    # Create secret from .env.production file
    kubectl create secret generic luxgen-secrets \
        --namespace=luxgen \
        --from-env-file=.env.production \
        --dry-run=client -o yaml | kubectl apply -f -
else
    echo "⚠️  No .env.production file found."
    echo "Please create .env.production with your production secrets or manually create the secret:"
    echo ""
    echo "  kubectl create secret generic luxgen-secrets \\"
    echo "    --namespace=luxgen \\"
    echo "    --from-literal=MONGODB_URI='mongodb://admin:YOUR_PASSWORD@mongodb-service:27017/luxgen?authSource=admin' \\"
    echo "    --from-literal=JWT_SECRET='YOUR_JWT_SECRET_MIN_32_CHARS' \\"
    echo "    --from-literal=JWT_EXPIRES_IN='7d' \\"
    echo "    --from-literal=SEED_IF_EMPTY='true' \\"
    echo "    --from-literal=TENANT_DEMO_KEY='demo-tenant-signing-key-min-32-chars' \\"
    echo "    --from-literal=TENANT_IDEA-VIBES_KEY='idea-vibes-signing-key-min-32-chars' \\"
    echo "    --from-literal=MONGO_INITDB_ROOT_USERNAME='admin' \\"
    echo "    --from-literal=MONGO_INITDB_ROOT_PASSWORD='YOUR_PASSWORD' \\"
    echo "    --from-literal=MONGO_INITDB_DATABASE='luxgen'"
    echo ""
    read -p "Have you already created the secret? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Please create the secret first and re-run this script."
        exit 1
    fi
fi

# Create configmap
echo "⚙️  Creating configmap..."
kubectl apply -f configmap.yaml

# Create PVCs
echo "💾 Creating persistent volume claims..."
kubectl apply -f pvc.yaml

# Deploy databases
echo "🗄️  Deploying MongoDB..."
kubectl apply -f mongodb.yaml

echo "🔄 Deploying Redis..."
kubectl apply -f redis.yaml

# Wait for databases to be ready
echo "⏳ Waiting for databases to be ready..."
kubectl wait --for=condition=ready pod -l app=mongodb -n luxgen --timeout=300s
kubectl wait --for=condition=ready pod -l app=redis -n luxgen --timeout=300s

# Deploy applications
echo "🔧 Deploying API..."
kubectl apply -f api.yaml

echo "🌐 Deploying Web..."
kubectl apply -f web.yaml

echo "🤖 Deploying Agent Worker..."
kubectl apply -f agent-worker.yaml

echo "🧠 Deploying Ollama..."
kubectl apply -f ollama.yaml

# Wait for applications to be ready
echo "⏳ Waiting for applications to be ready..."
kubectl wait --for=condition=ready pod -l app=api -n luxgen --timeout=300s
kubectl wait --for=condition=ready pod -l app=web -n luxgen --timeout=300s
kubectl wait --for=condition=ready pod -l app=agent-worker -n luxgen --timeout=300s
kubectl wait --for=condition=ready pod -l app=ollama -n luxgen --timeout=300s

# Deploy ingress
echo "🌍 Deploying Ingress..."
kubectl apply -f ingress.yaml

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Check status:"
echo "  kubectl get pods -n luxgen"
echo "  kubectl get services -n luxgen"
echo "  kubectl get ingress -n luxgen"
echo ""
echo "🔍 View logs:"
echo "  kubectl logs -f deployment/api -n luxgen"
echo "  kubectl logs -f deployment/web -n luxgen"
echo "  kubectl logs -f deployment/agent-worker -n luxgen"
echo ""
echo "🌐 Access the application:"
echo "  - Web: http://luxgen.yourdomain.com"
echo "  - API: http://luxgen.yourdomain.com/api"
echo "  - GraphQL: http://luxgen.yourdomain.com/graphql"
echo ""
echo "⚠️  Don't forget to:"
echo "  1. Update yourdomain.com in ingress.yaml"
echo "  2. Configure SSL certificates (cert-manager recommended)"
echo "  3. Build and push Docker images to your registry"
echo "  4. Update image names in deployment files"