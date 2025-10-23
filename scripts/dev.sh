#!/bin/bash

# Luxgen Monorepo Development Script
# This script provides easy commands for local development with Docker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to check if docker-compose is available
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        print_error "docker-compose is not installed. Please install docker-compose and try again."
        exit 1
    fi
}

# Function to start development environment
start_dev() {
    print_status "Starting development environment..."
    check_docker
    check_docker_compose
    
    # Start services
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
    
    print_success "Development environment started!"
    print_status "Services available at:"
    echo "  - Web App: http://localhost:3000"
    echo "  - API Server: http://localhost:4000"
    echo "  - MongoDB Admin: http://localhost:8081"
    echo "  - Redis Admin: http://localhost:8082"
    echo "  - Nginx: http://localhost:80"
}

# Function to stop development environment
stop_dev() {
    print_status "Stopping development environment..."
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml down
    print_success "Development environment stopped!"
}

# Function to restart development environment
restart_dev() {
    print_status "Restarting development environment..."
    stop_dev
    start_dev
}

# Function to show logs
show_logs() {
    local service=${1:-""}
    if [ -z "$service" ]; then
        print_status "Showing logs for all services..."
        docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f
    else
        print_status "Showing logs for $service..."
        docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f "$service"
    fi
}

# Function to build services
build_services() {
    print_status "Building services..."
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml build
    print_success "Services built successfully!"
}

# Function to clean up
cleanup() {
    print_status "Cleaning up Docker resources..."
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml down -v
    docker system prune -f
    print_success "Cleanup completed!"
}

# Function to show status
show_status() {
    print_status "Development environment status:"
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml ps
}

# Function to execute commands in containers
exec_container() {
    local service=$1
    local command=${2:-"bash"}
    
    if [ -z "$service" ]; then
        print_error "Please specify a service name"
        echo "Available services: web, api, mongodb, redis, dev-tools"
        exit 1
    fi
    
    print_status "Executing '$command' in $service container..."
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml exec "$service" $command
}

# Function to show help
show_help() {
    echo "Luxgen Monorepo Development Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start       Start development environment"
    echo "  stop        Stop development environment"
    echo "  restart     Restart development environment"
    echo "  logs        Show logs (optionally for specific service)"
    echo "  build       Build all services"
    echo "  cleanup     Clean up Docker resources"
    echo "  status      Show status of all services"
    echo "  exec        Execute command in container"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start"
    echo "  $0 logs web"
    echo "  $0 exec api npm run test"
    echo "  $0 exec mongodb mongosh"
}

# Main script logic
case "${1:-help}" in
    start)
        start_dev
        ;;
    stop)
        stop_dev
        ;;
    restart)
        restart_dev
        ;;
    logs)
        show_logs "$2"
        ;;
    build)
        build_services
        ;;
    cleanup)
        cleanup
        ;;
    status)
        show_status
        ;;
    exec)
        exec_container "$2" "$3"
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
