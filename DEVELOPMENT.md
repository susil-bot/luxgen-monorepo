# Luxgen Monorepo - Development Setup

This guide will help you set up the Luxgen monorepo for development using Docker.

## Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ (for local development)
- Git

## Quick Start

### 1. Clone and Setup
```bash
git clone <repository-url>
cd luxgen-monorepo
```

### 2. Start Development Environment
```bash
# Option 1: Using npm scripts
npm run dev:docker

# Option 2: Using Makefile
make dev

# Option 3: Using the development script
./scripts/dev.sh start
```

### 3. Access the Application
- **Web Application**: http://localhost:3000
- **API Server**: http://localhost:4000
- **MongoDB Admin**: http://localhost:8081 (admin/admin123)
- **Redis Admin**: http://localhost:8082
- **GraphQL Playground**: http://localhost:4000/graphql

## Development Commands

### Docker Commands
```bash
# Start development environment
npm run dev:docker

# Start with rebuild
npm run dev:docker:build

# Stop development environment
npm run docker:down

# Clean up Docker resources
npm run docker:clean

# View logs
make logs
make logs-web
make logs-api
make logs-db
```

### Development Scripts
```bash
# Start development environment
./scripts/dev.sh start

# Stop development environment
./scripts/dev.sh stop

# Restart development environment
./scripts/dev.sh restart

# View logs
./scripts/dev.sh logs
./scripts/dev.sh logs web
./scripts/dev.sh logs api

# Execute commands in containers
./scripts/dev.sh exec api npm run test
./scripts/dev.sh exec web npm run lint
./scripts/dev.sh exec mongodb mongosh

# Clean up
./scripts/dev.sh cleanup
```

### Makefile Commands
```bash
# Development
make dev          # Start development environment
make start        # Start all services
make stop         # Stop all services
make restart      # Restart all services
make logs         # Show logs for all services

# Building
make build        # Build all packages
make build-docker # Build Docker images

# Testing
make test         # Run all tests
make test-watch   # Run tests in watch mode

# Code Quality
make lint         # Run ESLint
make format       # Format code

# Database
make db-seed      # Seed the database
make db-reset     # Reset the database
make db-backup    # Backup the database

# Cleanup
make clean        # Clean up Docker resources
make clean-volumes # Clean up Docker volumes
make clean-all    # Clean up everything

# Utilities
make status       # Show status of all services
make health       # Check health of all services
make shell-web    # Open shell in web container
make shell-api    # Open shell in API container
make shell-db      # Open MongoDB shell
```

## Development Features

### Hot Reload
- **API**: Automatic restart on file changes using `ts-node-dev`
- **Web**: Next.js hot reload for instant updates
- **Packages**: Shared packages are mounted as volumes for live updates

### Debugging
- **API Debug Port**: 9229 (attach your debugger)
- **Web Debug**: Built-in Next.js debugging
- **Database**: MongoDB and Redis admin interfaces

### Environment Variables
The development environment includes:
- `NODE_ENV=development`
- `DEBUG=luxgen:*`
- `LOG_LEVEL=debug`
- Database connection strings
- JWT secrets (development only)

## Project Structure

```
luxgen-monorepo/
├── apps/
│   ├── api/          # GraphQL API server
│   └── web/          # Next.js web application
├── packages/
│   ├── auth/         # Authentication utilities
│   ├── config/       # Configuration management
│   ├── core/         # Core business logic
│   ├── db/           # Database models and connections
│   ├── ui/           # Shared UI components
│   └── utils/        # Utility functions
├── docker-compose.yml        # Production configuration
├── docker-compose.dev.yml    # Development configuration
└── scripts/
    └── dev.sh        # Development helper script
```

## Services

### API Server (Port 4000)
- GraphQL API with Apollo Server
- Express.js backend
- MongoDB integration
- Redis caching
- JWT authentication

### Web Application (Port 3000)
- Next.js React application
- Apollo Client for GraphQL
- Shared UI components
- Authentication integration

### Database Services
- **MongoDB** (Port 27017): Primary database
- **Redis** (Port 6379): Caching and sessions
- **Mongo Express** (Port 8081): Database admin interface
- **Redis Commander** (Port 8082): Redis admin interface

## Troubleshooting

### Common Issues

1. **Port Conflicts**
   ```bash
   # Check if ports are in use
   lsof -i :3000
   lsof -i :4000
   lsof -i :27017
   ```

2. **Docker Issues**
   ```bash
   # Clean up Docker resources
   make clean-all
   
   # Rebuild containers
   make build-docker
   ```

3. **Database Connection Issues**
   ```bash
   # Check database status
   make status
   
   # View database logs
   make logs-db
   ```

4. **Permission Issues**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   ```

### Health Checks
```bash
# Check all services
make health

# Check specific service
curl http://localhost:3000/api/health
curl http://localhost:4000/health
```

## Development Workflow

1. **Start Development Environment**
   ```bash
   make dev
   ```

2. **Make Changes**
   - Edit files in `apps/` or `packages/`
   - Changes are automatically reflected due to volume mounts

3. **Run Tests**
   ```bash
   make test
   ```

4. **Check Code Quality**
   ```bash
   make lint
   make format
   ```

5. **Debug Issues**
   - Use browser dev tools for web app
   - Attach debugger to API (port 9229)
   - Check logs: `make logs`

6. **Stop Development**
   ```bash
   make stop
   ```

## Production Deployment

For production deployment, use:
```bash
make prod-build
make prod-deploy
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests: `make test`
4. Check code quality: `make lint`
5. Submit a pull request

## Support

If you encounter issues:
1. Check the logs: `make logs`
2. Verify service health: `make health`
3. Clean and rebuild: `make clean && make build-docker`
4. Check the troubleshooting section above
