# LuxGen Kubernetes Infrastructure

This directory contains Kubernetes manifests for deploying the LuxGen monorepo to a Kubernetes cluster.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Ingress (Nginx)                       │
│                    luxgen.yourdomain.com                     │
└───────┬─────────────────────────────────────────┬───────────┘
        │                                         │
        ▼                                         ▼
┌───────────────┐                         ┌───────────────┐
│   Web (Next)  │                         │   API (GraphQL)│
│   Port: 3000  │                         │   Port: 4000   │
│   Replicas: 2 │                         │   Replicas: 2  │
└───────────────┘                         └───────┬───────┘
                                                  │
                          ┌───────────────────────┼───────────────────────┐
                          │                       │                       │
                          ▼                       ▼                       ▼
                    ┌─────────────┐         ┌─────────────┐         ┌─────────────┐
                    │   Redis     │         │  MongoDB    │         │   Ollama    │
                    │  Port: 6379 │         │ Port: 27017 │         │ Port: 11434 │
                    │  Replicas: 1│         │ Replicas: 1 │         │ Replicas: 1 │
                    └─────────────┘         └─────────────┘         └─────────────┘
                          │                       │                       │
                          └───────────────────────┴───────────────────────┘
                                                  │
                                                  ▼
                                        ┌─────────────────┐
                                        │ Agent Worker    │
                                        │  Port: 4000     │
                                        │  Replicas: 1    │
                                        └─────────────────┘
```

## Prerequisites

- Kubernetes cluster (v1.24+)
- kubectl configured and connected to your cluster
- Docker registry (Docker Hub, ECR, GCR, etc.)
- nginx-ingress-controller installed
- (Optional) cert-manager for SSL certificates
- (Optional) External DNS for automatic DNS management

## Quick Start

### 1. Install Ingress Controller

```bash
# For nginx-ingress-controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.0/deploy/static/provider/cloud/deploy.yaml
```

### 2. Configure Secrets

Create a `.env.production` file in the root directory:

```bash
# .env.production
MONGODB_URI=mongodb://admin:YOUR_SECURE_PASSWORD@mongodb-service:27017/luxgen?authSource=admin
JWT_SECRET=YOUR_JWT_SECRET_MIN_32_CHARS_CHANGE_IN_PRODUCTION
JWT_EXPIRES_IN=7d
SEED_IF_EMPTY=true
TENANT_DEMO_KEY=demo-tenant-signing-key-min-32-chars
TENANT_IDEA-VIBES_KEY=idea-vibes-signing-key-min-32-chars
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=YOUR_SECURE_PASSWORD
MONGO_INITDB_DATABASE=luxgen
```

### 3. Update Configuration

Edit `configmap.yaml` to update:

- Domain names (replace `yourdomain.com`)
- API URLs
- CORS origins

### 4. Build and Push Docker Images

```bash
# Build images
docker build -t luxgen/api:latest -f apps/api/Dockerfile .
docker build -t luxgen/web:latest -f apps/web/Dockerfile .
docker build -t luxgen/agent-worker:latest -f apps/agent-worker/Dockerfile .

# Push to your registry
docker push luxgen/api:latest
docker push luxgen/web:latest
docker push luxgen/agent-worker:latest
```

**Note:** You'll need to create a Dockerfile for the agent-worker service:

```dockerfile
# apps/agent-worker/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY packages ./packages
COPY apps/agent-worker ./apps/agent-worker
RUN npm ci

FROM node:20-alpine AS runner
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 worker
WORKDIR /app
COPY --from=builder --chown=worker:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=worker:nodejs /app/apps/agent-worker ./apps/agent-worker
COPY --from=builder --chown=worker:nodejs /app/packages ./packages
USER worker
WORKDIR /app/apps/agent-worker
CMD ["node", "dist/index.js"]
```

### 5. Deploy

```bash
# Make deploy script executable
chmod +x k8s/deploy.sh

# Run deployment
./k8s/deploy.sh
```

Or deploy manually:

```bash
# Apply all manifests in order
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/pvc.yaml
kubectl apply -f k8s/mongodb.yaml
kubectl apply -f k8s/redis.yaml
kubectl apply -f k8s/ollama.yaml
kubectl apply -f k8s/api.yaml
kubectl apply -f k8s/web.yaml
kubectl apply -f k8s/agent-worker.yaml
kubectl apply -f k8s/ingress.yaml
```

## File Structure

```
k8s/
├── namespace.yaml          # Kubernetes namespace
├── configmap.yaml          # Non-sensitive configuration
├── secret.yaml             # Sensitive configuration (passwords, keys)
├── pvc.yaml                # Persistent volume claims
├── mongodb.yaml            # MongoDB StatefulSet + Service
├── redis.yaml              # Redis StatefulSet + Service
├── ollama.yaml             # Ollama StatefulSet + Service
├── api.yaml                # API Deployment + Service
├── web.yaml                # Web Deployment + Service
├── agent-worker.yaml       # Agent Worker Deployment + Service
├── ingress.yaml            # Ingress rules for routing
├── deploy.sh               # Automated deployment script
└── README.md               # This file
```

## Managing the Deployment

### Check Status

```bash
# Get all pods
kubectl get pods -n luxgen

# Get all services
kubectl get services -n luxgen

# Get ingress
kubectl get ingress -n luxgen

# Get persistent volumes
kubectl get pvc -n luxgen
```

### View Logs

```bash
# API logs
kubectl logs -f deployment/api -n luxgen

# Web logs
kubectl logs -f deployment/web -n luxgen

# Agent Worker logs
kubectl logs -f deployment/agent-worker -n luxgen

# MongoDB logs
kubectl logs -f statefulset/mongodb -n luxgen

# Redis logs
kubectl logs -f statefulset/redis -n luxgen

# Ollama logs
kubectl logs -f statefulset/ollama -n luxgen
```

### Scale Services

```bash
# Scale API to 3 replicas
kubectl scale deployment/api -n luxgen --replicas=3

# Scale Web to 3 replicas
kubectl scale deployment/web -n luxgen --replicas=3
```

### Update Deployment

```bash
# Update image
kubectl set image deployment/api api=luxgen/api:v1.2.0 -n luxgen
kubectl set image deployment/web web=luxgen/web:v1.2.0 -n luxgen

# Rolling restart
kubectl rollout restart deployment/api -n luxgen
kubectl rollout restart deployment/web -n luxgen
```

### Delete Deployment

```bash
# Delete everything in the luxgen namespace
kubectl delete namespace luxgen

# Or delete individual components
kubectl delete -f k8s/
```

## Resource Requirements

| Service | CPU Request | CPU Limit | Memory Request | Memory Limit | Storage |
| ------- | ----------- | --------- | -------------- | ------------ | ------- |
| MongoDB | 250m        | 1000m     | 512Mi          | 2Gi          | 10Gi    |
| Redis   | 100m        | 500m      | 256Mi          | 1Gi          | 5Gi     |
| API     | 250m        | 500m      | 512Mi          | 1Gi          | -       |
| Web     | 100m        | 300m      | 256Mi          | 512Mi        | -       |
| Agent   | 250m        | 1000m     | 512Mi          | 2Gi          | -       |
| Ollama  | 1000m       | 4000m     | 2Gi            | 8Gi          | 20Gi    |

**Total (minimum):** 2.25 CPU cores, 6.5Gi RAM, 35Gi storage

## SSL/HTTPS Setup

### Using cert-manager

1. Install cert-manager:

```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
```

2. Create ClusterIssuer:

```yaml
# cert-issuer.yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your-email@example.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
      - http01:
          ingress:
            class: nginx
```

3. Apply it:

```bash
kubectl apply -f cert-issuer.yaml
```

4. Uncomment the TLS section in `ingress.yaml`

## Multi-Tenancy

The application supports multi-tenancy via subdomains. To add a new tenant:

1. Add the tenant's signing key to secrets
2. Add a new Ingress rule or use a wildcard DNS entry
3. The application will automatically route based on the subdomain

## Monitoring (Optional)

### Prometheus + Grafana

```bash
# Install Prometheus
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install prometheus prometheus-community/kube-prometheus-stack -n monitoring --create-namespace
```

### Health Checks

All services expose health endpoints:

- API: `http://api-service:4000/health`
- Web: `http://web-service:3000/api/health`

## Troubleshooting

### Pods not starting

```bash
# Check pod status
kubectl describe pod <pod-name> -n luxgen

# Check events
kubectl get events -n luxgen --sort-by='.lastTimestamp'
```

### Database connection issues

```bash
# Test MongoDB connection
kubectl exec -it <mongodb-pod> -n luxgen -- mongosh -u admin -p

# Test Redis connection
kubectl exec -it <redis-pod> -n luxgen -- redis-cli ping
```

### Ingress not working

```bash
# Check ingress status
kubectl describe ingress luxgen-ingress -n luxgen

# Check nginx controller logs
kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx
```

## Production Recommendations

1. **Use a managed database service** (MongoDB Atlas, AWS DocumentDB) instead of self-hosted MongoDB
2. **Use a managed cache** (AWS ElastiCache, Redis Cloud) instead of self-hosted Redis
3. **Use a managed LLM service** instead of self-hosted Ollama for production
4. **Enable resource quotas and limits** in the namespace
5. **Set up PodDisruptionBudgets** for high availability
6. **Use HorizontalPodAutoscaler** for automatic scaling
7. **Implement backup strategies** for MongoDB and Redis
8. **Use private container registry** with image scanning
9. **Enable audit logging** for security compliance
10. **Set up centralized logging** (ELK, Loki, etc.)

## Cost Optimization

For small deployments, consider:

- Using a single cluster with multiple namespaces
- Using smaller instance types (t3.medium, e2-medium)
- Using spot/preemptible instances for non-critical workloads
- Reducing Ollama resources or using a managed LLM API
- Using serverless options (Cloud Run, Lambda) for web/API

## Support

For issues or questions:

- Check the main README.md
- Review docs/deployment/ directory
- Check application logs
- Review Kubernetes events
