# Luxgen Monorepo Makefile
# Easy commands for development and deployment

.PHONY: help install build dev start stop restart logs clean test lint format

# Default target
help: ## Show this help message
	@echo "Luxgen Monorepo - Available Commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

# Development Commands
install: ## Install all dependencies
	@echo "Installing dependencies..."
	npm install

dev: ## Start development environment with Docker
	@echo "Starting development environment..."
	./scripts/dev.sh start

start: ## Start all services
	@echo "Starting services..."
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

stop: ## Stop all services
	@echo "Stopping services..."
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml down

restart: ## Restart all services
	@echo "Restarting services..."
	./scripts/dev.sh restart

# Build Commands
build: ## Build all packages
	@echo "Building packages..."
	npm run build

build:docker ## Build Docker images
	@echo "Building Docker images..."
	docker-compose build

# Development Tools
logs: ## Show logs for all services
	@echo "Showing logs..."
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f

logs:web ## Show logs for web service
	@echo "Showing web logs..."
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f web

logs:api ## Show logs for API service
	@echo "Showing API logs..."
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f api

logs:db ## Show logs for database services
	@echo "Showing database logs..."
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f mongodb redis

# Testing Commands
test: ## Run all tests
	@echo "Running tests..."
	npm run test

test:watch ## Run tests in watch mode
	@echo "Running tests in watch mode..."
	npm run test:watch

test:coverage ## Run tests with coverage
	@echo "Running tests with coverage..."
	npm run test:coverage

# Code Quality Commands
lint: ## Run ESLint
	@echo "Running ESLint..."
	npm run lint

lint:fix ## Fix ESLint issues
	@echo "Fixing ESLint issues..."
	npm run lint:fix

format: ## Format code with Prettier
	@echo "Formatting code..."
	npm run format

format:check ## Check code formatting
	@echo "Checking code formatting..."
	npm run format:check

# Database Commands
db:seed ## Seed the database
	@echo "Seeding database..."
	docker-compose exec api npm run db:seed

db:reset ## Reset the database
	@echo "Resetting database..."
	docker-compose exec mongodb mongosh --eval "db.dropDatabase()"
	$(MAKE) db:seed

db:backup ## Backup the database
	@echo "Backing up database..."
	docker-compose exec mongodb mongodump --out /backup/$(shell date +%Y%m%d_%H%M%S)

db:restore ## Restore the database
	@echo "Restoring database..."
	docker-compose exec mongodb mongorestore /backup/latest

# Cleanup Commands
clean: ## Clean up Docker resources
	@echo "Cleaning up Docker resources..."
	./scripts/dev.sh cleanup

clean:volumes ## Clean up Docker volumes
	@echo "Cleaning up Docker volumes..."
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml down -v

clean:all ## Clean up everything
	@echo "Cleaning up everything..."
	docker system prune -af
	docker volume prune -f

# Production Commands
prod:build ## Build for production
	@echo "Building for production..."
	docker build -t luxgen-monorepo:latest .

prod:deploy ## Deploy to production
	@echo "Deploying to production..."
	docker-compose -f docker-compose.prod.yml up -d

# Utility Commands
status: ## Show status of all services
	@echo "Service status:"
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml ps

shell:web ## Open shell in web container
	@echo "Opening shell in web container..."
	docker-compose exec web bash

shell:api ## Open shell in API container
	@echo "Opening shell in API container..."
	docker-compose exec api bash

shell:db ## Open MongoDB shell
	@echo "Opening MongoDB shell..."
	docker-compose exec mongodb mongosh

# Health Checks
health: ## Check health of all services
	@echo "Checking service health..."
	@curl -f http://localhost:3000/api/health || echo "Web service is not healthy"
	@curl -f http://localhost:4000/health || echo "API service is not healthy"

# Development Setup
setup: ## Initial development setup
	@echo "Setting up development environment..."
	$(MAKE) install
	$(MAKE) build
	$(MAKE) dev
	@echo "Development environment is ready!"
	@echo "Access the application at:"
	@echo "  - Web: http://localhost:3000"
	@echo "  - API: http://localhost:4000"
	@echo "  - MongoDB Admin: http://localhost:8081"
	@echo "  - Redis Admin: http://localhost:8082"
