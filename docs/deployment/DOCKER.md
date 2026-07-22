# Docker Deployment

> Self-hosted and full-stack Docker deployment. Best for Oracle Cloud Always Free or a VPS.

---

## Compose files

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Base: MongoDB, Redis, Ollama, dev API/web |
| `docker-compose.dev.yml` | Dev overrides (hot reload) |
| `docker-compose.staging.yml` | Staging stack |
| `docker-compose.prod.yml` | Production: API, web, nginx, optional monitoring |

---

## Production compose (self-hosted)

```bash
# Copy and fill secrets
cp deploy/env/production.env.example .env.production
# Edit .env.production

# Start production stack
docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.production up -d --build
```

Services: `mongodb`, `redis`, `api`, `web`, `nginx` (+ optional prometheus/grafana).

**Requirements:** 4 GB+ RAM minimum; 8 GB+ recommended with Ollama.

---

## Split Docker deploy (recommended)

Deploy API and web as **separate containers** using app Dockerfiles (same as Render):

```bash
# API
docker build -f apps/api/Dockerfile -t luxgen-api .
docker run -p 4000:4000 --env-file apps/api/.env luxgen-api

# Web
docker build -f apps/web/Dockerfile \
  --build-arg NEXT_PUBLIC_API_URL=https://api.yourdomain.com \
  --build-arg NEXT_PUBLIC_APP_URL=https://yourdomain.com \
  -t luxgen-web .
docker run -p 3000:3000 luxgen-web
```

Use managed MongoDB Atlas + Upstash instead of compose Mongo/Redis for smaller VMs.

---

## Oracle Cloud Always Free ( $0 VM )

Best option for **full stack including Ollama** without monthly cost.

### 1. Create VM

- Oracle Cloud → **Always Free** → Ampere A1 (up to 4 OCPU, 24 GB RAM)
- Ubuntu 22.04
- Open ports: 80, 443, 22

### 2. Install Docker

```bash
sudo apt update && sudo apt install -y docker.io docker-compose-plugin
sudo usermod -aG docker $USER
```

### 3. Clone and configure

```bash
git clone <your-repo> luxgen && cd luxgen
cp deploy/env/production.env.example .env.production
# Set MONGODB_URI to Atlas (recommended) or use compose mongodb
nano .env.production
```

### 4. Deploy minimal stack (Atlas + compose API/web)

```bash
# Only API + web — DB on Atlas
docker compose -f docker-compose.prod.yml up api web -d --build
...
```

Or full stack with local Mongo (uses RAM):

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

### 5. Ollama on VM (optional)

```bash
docker compose up ollama -d
docker exec luxgen-ollama ollama pull mistral:latest
```

Set web `OLLAMA_HOST=http://<vm-ip>:11434` — **only if exposing Agent Studio** (not recommended publicly without auth).

### 6. HTTPS

Use Caddy or nginx with Let's Encrypt in front of compose nginx service.

---

## Makefile shortcuts

```bash
make setup          # First-time local env
make dev-infra      # Mongo + Redis + Ollama only
make dev-full       # Full dev stack in Docker
make staging        # Staging environment
```

---

## Health checks

| Service | Endpoint |
|---------|----------|
| API | `http://localhost:4000/health` |
| Web | `http://localhost:3000/api/health` |
| Nginx | `http://localhost/health` |

---

## When to use Docker vs serverless

| Scenario | Use |
|----------|-----|
| $0, minimal ops | Vercel + Render — [FREE_TIER_CLOUD.md](./FREE_TIER_CLOUD.md) |
| $0, full control | Oracle VM + Docker |
| Paid single region | Docker on VPS (Hetzner, DigitalOcean) |
| Auto-scale web | Vercel for web + Docker/Railway for API |
