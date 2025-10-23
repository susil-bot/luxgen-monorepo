# Docker Setup for Luxgen Monorepo

This document provides comprehensive instructions for setting up and running the Luxgen monorepo using Docker.

## Prerequisites

- Docker Desktop (latest version)
- Docker Compose (included with Docker Desktop)
- Git

## Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd luxgen-monorepo
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.template .env

# Edit environment variables
nano .env
```

### 3. Start Development Environment
```bash
# Using Make (recommended)
make dev

# Or using the development script
./scripts/dev.sh start

# Or using docker-compose directly
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

## Available Services

| Service | Port | Description |
|---------|------|-------------|
| Web App | 3000 | Next.js frontend application |
| API Server | 4000 | GraphQL API server |
| MongoDB | 27017 | Database server |
| Redis | 6379 | Cache server |
| MongoDB Admin | 8081 | Mongo Express interface |
| Redis Admin | 8082 | Redis Commander interface |
| Nginx | 80 | Reverse proxy |

## Development Commands

### Using Make (Recommended)
```bash
# Start development environment
make dev

# Stop all services
make stop

# Restart services
make restart

# View logs
make logs

# View logs for specific service
make logs:web
make logs:api
make logs:db

# Run tests
make test

# Code quality
make lint
make format

# Clean up
make clean
```

### Using Development Script
```bash
# Start development environment
./scripts/dev.sh start

# Stop development environment
./scripts/dev.sh stop

# Restart development environment
./scripts/dev.sh restart

# View logs
./scripts/dev.sh logs

# View logs for specific service
./scripts/dev.sh logs web
./scripts/dev.sh logs api

# Execute commands in containers
./scripts/dev.sh exec web npm run test
./scripts/dev.sh exec api npm run build
```

### Using Docker Compose Directly
```bash
# Start all services
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Stop all services
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down

# View logs
docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f

# Build services
docker-compose -f docker-compose.yml -f docker-compose.dev.yml build
```

## Service Configuration

### Web Application
- **Port**: 3000
- **Hot Reload**: Enabled
- **Debug Mode**: Enabled
- **Environment**: Development

### API Server
- **Port**: 4000
- **GraphQL Endpoint**: http://localhost:4000/graphql
- **Health Check**: http://localhost:4000/health
- **Debug Port**: 9229

### Database (MongoDB)
- **Port**: 27017
- **Admin Interface**: http://localhost:8081
- **Username**: admin
- **Password**: password123
- **Database**: luxgen

### Cache (Redis)
- **Port**: 6379
- **Admin Interface**: http://localhost:8082
- **Persistence**: Enabled

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# Application
NODE_ENV=development
PORT=3000
API_PORT=4000

# Database
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=password123
MONGO_DATABASE=luxgen
MONGODB_URI=mongodb://admin:password123@mongodb:27017/luxgen?authSource=admin

# Redis
REDIS_URL=redis://redis:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# Next.js
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DEBUG=true
```

## Production Deployment

### 1. Build Production Images
```bash
make prod:build
```

### 2. Deploy to Production
```bash
make prod:deploy
```

### 3. Production Environment Variables
Create a `.env.prod` file with production values:

```bash
NODE_ENV=production
MONGO_ROOT_USERNAME=your-production-username
MONGO_ROOT_PASSWORD=your-production-password
JWT_SECRET=your-production-jwt-secret
CORS_ORIGIN=https://your-domain.com
```

## Monitoring and Logs

### View Logs
```bash
# All services
make logs

# Specific service
make logs:web
make logs:api
make logs:db
```

### Health Checks
```bash
# Check service health
make health

# Service status
make status
```

### Database Management
```bash
# Seed database
make db:seed

# Reset database
make db:reset

# Backup database
make db:backup

# Restore database
make db:restore
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   lsof -i :3000
   
   # Kill the process
   kill -9 <PID>
   ```

2. **Docker Not Running**
   ```bash
   # Start Docker Desktop
   open -a Docker
   ```

3. **Permission Issues**
   ```bash
   # Make scripts executable
   chmod +x scripts/dev.sh
   ```

4. **Container Won't Start**
   ```bash
   # Check logs
   docker-compose logs <service-name>
   
   # Rebuild containers
   docker-compose build --no-cache
   ```

### Clean Up
```bash
# Clean up Docker resources
make clean

# Clean up volumes
make clean:volumes

# Clean up everything
make clean:all
```

## Development Workflow

### 1. Start Development Environment
```bash
make dev
```

### 2. Make Changes
- Edit code in your IDE
- Changes are automatically reflected due to hot reload

### 3. Run Tests
```bash
make test
```

### 4. Code Quality
```bash
make lint
make format
```

### 5. Stop Environment
```bash
make stop
```

## Advanced Configuration

### Custom Docker Compose Files
You can create custom docker-compose files for specific environments:

```bash
# Development with custom configuration
docker-compose -f docker-compose.yml -f docker-compose.dev.yml -f docker-compose.custom.yml up -d
```

### Volume Mounts
For development, source code is mounted as volumes for hot reload:

```yaml
volumes:
  - ./apps/web:/app/apps/web
  - ./packages:/app/packages
  - /app/node_modules
```

### Network Configuration
Services communicate through a custom Docker network:

```yaml
networks:
  luxgen-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

## Security Considerations

### Development
- Use strong passwords for database
- Don't commit `.env` files
- Use different secrets for development

### Production
- Use environment-specific secrets
- Enable SSL/TLS
- Configure firewall rules
- Use secrets management

## Performance Optimization

### Resource Limits
```yaml
deploy:
  resources:
    limits:
      memory: 1G
    reservations:
      memory: 512M
```

### Caching
- Redis for application caching
- Docker layer caching for builds
- Nginx for static file caching

## Backup and Recovery

### Database Backup
```bash
# Create backup
make db:backup

# Restore from backup
make db:restore
```

### Volume Backup
```bash
# Backup volumes
docker run --rm -v luxgen_mongodb_data:/data -v $(pwd)/backups:/backup alpine tar czf /backup/mongodb-$(date +%Y%m%d).tar.gz -C /data .
```

## Support

For issues and questions:
1. Check the logs: `make logs`
2. Check service status: `make status`
3. Check health: `make health`
4. Review this documentation
5. Check the main README.md
