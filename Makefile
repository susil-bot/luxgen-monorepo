# ─────────────────────────────────────────────────────────────────────────────
# LuxGen Development Makefile
# Usage: make <target>   |   make help
# ─────────────────────────────────────────────────────────────────────────────

.DEFAULT_GOAL := help
.PHONY: help setup dev dev-infra dev-full dev-docker dev-stack-web dev-stack-admin dev-stack-mobile dev-stack-api \
        dev-clean-web dev-web dev-api staging prod clean clean-all \
        logs logs-api logs-web logs-ollama \
        agent-start agent-stop agent-status \
        agent-pull agent-pull-mistral agent-pull-qwen \
        build build-api build-web build-mcp mcp-smoke \
        db-seed db-reset lint test

# ─── Colors ──────────────────────────────────────────────────────────────────
CYAN   := \033[36m
YELLOW := \033[33m
GREEN  := \033[32m
RED    := \033[31m
RESET  := \033[0m
BOLD   := \033[1m

# ─── Help ─────────────────────────────────────────────────────────────────────
help: ## Show this help
	@echo ""
	@echo "$(BOLD)LuxGen — Available Commands$(RESET)"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*##/ { printf "  $(CYAN)%-22s$(RESET) %s\n", $$1, $$2 }' $(MAKEFILE_LIST)
	@echo ""
	@echo "$(YELLOW)Quick start:$(RESET) make dev-stack-web   (or dev-stack-admin / dev-stack-mobile)"
	@echo ""

# ─── Setup (First-Time) ───────────────────────────────────────────────────────
setup: ## First-time setup: copy env examples, start infra
	@echo "$(GREEN)► Setting up LuxGen...$(RESET)"
	@[ -f apps/web/.env.local ]  || (cp apps/web/.env.example apps/web/.env.local  && echo "  Created apps/web/.env.local")
	@[ -f apps/api/.env ]        || (cp apps/api/.env.example apps/api/.env        && echo "  Created apps/api/.env")
	@if [ -d apps/mobile ] && [ ! -f apps/mobile/.env.local ]; then \
		cp apps/mobile/.env.example apps/mobile/.env.local && echo "  Created apps/mobile/.env.local"; \
	fi
	@[ -f .env.local ]           || (cp .env.example .env.local                    && echo "  Created .env.local")
	@npm install
	@npm run prepare
	@$(MAKE) dev-infra
	@echo "$(GREEN)✓ Setup complete. Run: make dev$(RESET)"

# ─── Development ──────────────────────────────────────────────────────────────
dev: ## Run web + api locally via turbo (fastest — infra must be running)
	@echo "$(GREEN)► Starting local dev servers...$(RESET)"
	@npx turbo run dev --concurrency=15

dev-web: ## Run only the web app locally
	@npx turbo run dev --filter=@luxgen/web

dev-api: ## Run only the API locally
	@npx turbo run dev --filter=@luxgen/api

# ─── Role-based dev stacks (shared API + Mongo) ───────────────────────────────
dev-stack-web: ## Web/learner dev: Mongo + API + Next.js (see skills/dev-workflows)
	@bash scripts/dev-stack.sh web

dev-clean-web: ## Kill :3000/:4000, wipe apps/web/.next, restart web stack
	@echo "$(GREEN)► Cleaning web dev stack (ports + .next)...$(RESET)"
	@for port in 3000 4000; do lsof -ti :$$port 2>/dev/null | xargs kill -9 2>/dev/null || true; done
	@rm -rf apps/web/.next
	@$(MAKE) dev-stack-web

dev-stack-admin: ## Admin/commerce dev: Mongo + API + Next.js (admin routes)
	@bash scripts/dev-stack.sh admin

dev-stack-mobile: ## Expo dev: Mongo + API + apps/mobile
	@bash scripts/dev-stack.sh mobile

dev-stack-api: ## Backend-only: Mongo + GraphQL API
	@bash scripts/dev-stack.sh api

dev-infra: ## Start MongoDB + Redis + Ollama in Docker (background)
	@echo "$(GREEN)► Starting infrastructure (MongoDB, Redis, Ollama)...$(RESET)"
	@docker compose up mongodb redis ollama -d
	@echo "$(GREEN)✓ Infrastructure running$(RESET)"
	@echo "  MongoDB:  localhost:27017"
	@echo "  Redis:    localhost:6379"
	@echo "  Ollama:   localhost:11434"

dev-full: dev-docker ## Alias for dev-docker

dev-docker: ## Full dev stack in Docker (build + hot reload + auto-seed on first boot)
	@echo "$(GREEN)► Starting Docker dev stack (persistent volumes)...$(RESET)"
	@docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d
	@echo ""
	@echo "$(GREEN)✓ Stack starting — first boot may take 2–3 min (npm install + seed)$(RESET)"
	@echo "  Web:      http://demo.localhost:3000"
	@echo "  Login:    http://demo.localhost:3000/login"
	@echo "  GraphQL:  http://localhost:4000/graphql"
	@echo "  Mongo UI: http://localhost:8081  (admin / admin123)"
	@echo ""
	@echo "  Demo login: alex.thompson@demo.com / password123"
	@echo "  Logs:       make logs"
	@echo "  Stop:       make clean  (keeps DB volume)"
	@echo "  Reset DB:   make db-reset  (wipes volume data, re-seeds on next start)"

# ─── Agent Studio (Local LLM) ─────────────────────────────────────────────────
agent-start: ## Start Ollama in Docker
	@echo "$(GREEN)► Starting Ollama...$(RESET)"
	@docker compose up ollama -d
	@echo "$(GREEN)✓ Ollama running at http://localhost:11434$(RESET)"

agent-stop: ## Stop Ollama
	@docker compose stop ollama

agent-status: ## Check Ollama and model status
	@echo "$(CYAN)Ollama status:$(RESET)"
	@curl -sf http://localhost:11434/api/tags | python3 -c \
		"import sys,json; d=json.load(sys.stdin); models=d.get('models',[]); \
		[print(f'  ✓ {m[\"name\"]} ({m[\"details\"][\"parameter_size\"]})')\
		 for m in models] if models else print('  ✗ No models downloaded')" \
		2>/dev/null || echo "  ✗ Ollama not running — run: make agent-start"

agent-pull: ## Pull the recommended model (qwen2.5-coder:7b, ~4.7 GB)
	@$(MAKE) agent-pull-qwen

agent-pull-mistral: ## Pull mistral:latest (~4.1 GB) — good general model
	@echo "$(YELLOW)► Pulling mistral:latest (~4.1 GB)...$(RESET)"
	@ollama pull mistral:latest 2>/dev/null || \
		docker exec luxgen-ollama ollama pull mistral:latest
	@echo "$(GREEN)✓ mistral:latest ready$(RESET)"

agent-pull-qwen: ## Pull qwen2.5-coder:7b (~4.7 GB) — best for code
	@echo "$(YELLOW)► Pulling qwen2.5-coder:7b (~4.7 GB)...$(RESET)"
	@ollama pull qwen2.5-coder:7b 2>/dev/null || \
		docker exec luxgen-ollama ollama pull qwen2.5-coder:7b
	@echo "$(GREEN)✓ qwen2.5-coder:7b ready. Update OLLAMA_MODEL=qwen2.5-coder:7b in apps/web/.env.local$(RESET)"

# ─── Environments ─────────────────────────────────────────────────────────────
staging: ## Build and start the staging environment
	@echo "$(GREEN)► Starting staging environment...$(RESET)"
	@[ -f .env.staging ] || (echo "$(RED)✗ .env.staging not found. Copy .env.staging.example and fill in values.$(RESET)" && exit 1)
	@docker compose -f docker-compose.staging.yml --env-file .env.staging up --build -d
	@echo "$(GREEN)✓ Staging running at http://localhost:3000$(RESET)"

staging-down: ## Stop the staging environment
	@docker compose -f docker-compose.staging.yml down

prod: ## Build and start production (requires .env.production)
	@echo "$(GREEN)► Starting production environment...$(RESET)"
	@[ -f .env.production ] || (echo "$(RED)✗ .env.production not found$(RESET)" && exit 1)
	@docker compose -f docker-compose.prod.yml --env-file .env.production up --build -d
	@echo "$(GREEN)✓ Production started$(RESET)"

prod-down: ## Stop production environment
	@docker compose -f docker-compose.prod.yml down

# ─── Build ────────────────────────────────────────────────────────────────────
build: ## Build all packages
	@npx turbo run build

build-web: ## Build web app only
	@npx turbo run build --filter=@luxgen/web

build-api: ## Build API only
	@npx turbo run build --filter=@luxgen/api

build-mcp: ## Build MCP server (packages/mcp-core + apps/mcp-server)
	@npm run build:mcp

mcp-smoke: ## Smoke test MCP GraphQL tools (requires LUXGEN_* env vars)
	@bash scripts/mcp-smoke.sh

dev-mcp-http: ## Run MCP HTTP server on :3100 (requires API)
	@MCP_TRANSPORT=http MCP_HTTP_PORT=3100 npm run dev:mcp

# ─── Database ─────────────────────────────────────────────────────────────────
db-seed: ## Seed the database with dev data (force — idempotent upsert)
	@echo "$(GREEN)► Seeding database...$(RESET)"
	@if docker compose ps api 2>/dev/null | grep -q Up; then \
		docker compose exec api sh -c "cd apps/api && npm run seed"; \
	else \
		cd apps/api && npm run seed; \
	fi

db-reset: ## Drop dev database volume data and re-seed on next API start
	@echo "$(RED)► Resetting dev database (luxgen_dev)...$(RESET)"
	@if docker compose ps mongodb 2>/dev/null | grep -q Up; then \
		docker compose exec mongodb mongosh -u admin -p password123 --authenticationDatabase admin luxgen_dev --eval "db.dropDatabase()"; \
		if docker compose ps api 2>/dev/null | grep -q Up; then \
			echo "  Restarting API to trigger auto-seed..."; \
			docker compose restart api; \
		fi; \
	else \
		echo "  MongoDB container not running — start with: make dev-docker"; exit 1; \
	fi
	@echo "$(GREEN)✓ Database dropped. API will auto-seed on restart.$(RESET)"

# ─── Logs ─────────────────────────────────────────────────────────────────────
logs: ## Follow all Docker logs
	@docker compose logs -f

logs-web: ## Follow web app logs
	@docker compose logs -f web

logs-api: ## Follow API logs
	@docker compose logs -f api

logs-ollama: ## Follow Ollama logs
	@docker compose logs -f ollama

# ─── Code Quality ─────────────────────────────────────────────────────────────
lint: ## Run linting across all packages
	@npx turbo run lint

test: ## Run tests across all packages
	@npx turbo run test

# ─── Cleanup ──────────────────────────────────────────────────────────────────
clean: ## Stop all Docker services (preserves volumes/data)
	@echo "$(YELLOW)► Stopping all services...$(RESET)"
	@docker compose down 2>/dev/null || true
	@docker compose -f docker-compose.staging.yml down 2>/dev/null || true
	@echo "$(GREEN)✓ All services stopped$(RESET)"

clean-all: ## Nuclear clean: stop services AND delete all volumes/data
	@echo "$(RED)► WARNING: This deletes all data including databases and model weights!$(RESET)"
	@read -p "Are you sure? [y/N] " confirm && [ "$$confirm" = "y" ]
	@docker compose down -v --remove-orphans 2>/dev/null || true
	@docker compose -f docker-compose.staging.yml down -v 2>/dev/null || true
	@npx turbo run clean 2>/dev/null || true
	@echo "$(GREEN)✓ Full clean complete$(RESET)"

# ─── Status ───────────────────────────────────────────────────────────────────
status: ## Show status of all services
	@echo "$(CYAN)Docker services:$(RESET)"
	@docker compose ps 2>/dev/null || echo "  No services running"
	@echo ""
	@echo "$(CYAN)Ollama:$(RESET)"
	@$(MAKE) --no-print-directory agent-status
