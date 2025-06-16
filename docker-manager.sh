#!/bin/bash

# ViberFilm Docker Management Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE} ViberFilm Docker Manager${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Function to check if docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
}

# Function to check if .env file exists
check_env() {
    if [ ! -f .env ]; then
        print_warning ".env file not found. Creating from .env.example..."
        if [ -f .env.example ]; then
            cp .env.example .env
            print_status ".env file created. Please update it with your configuration."
        else
            print_error ".env.example not found. Please create .env file manually."
            exit 1
        fi
    fi
}

# Function to build and start all services
start_all() {
    print_status "Building and starting all services..."
    docker compose up --build -d
    print_status "All services started successfully!"
    print_status "Frontend: http://localhost:3000"
    print_status "Admin: http://localhost:3001"
    print_status "Backend API: http://localhost:8000"
}

# Function to stop all services
stop_all() {
    print_status "Stopping all services..."
    docker compose down
    print_status "All services stopped."
}

# Function to view logs
view_logs() {
    service=${1:-""}
    if [ -z "$service" ]; then
        print_status "Viewing logs for all services..."
        docker compose logs -f
    else
        print_status "Viewing logs for $service..."
        docker compose logs -f "$service"
    fi
}

# Function to restart specific service
restart_service() {
    service=$1
    if [ -z "$service" ]; then
        print_error "Please specify a service name (frontend, admin, backend, db, redis, elasticsearch)"
        exit 1
    fi
    print_status "Restarting $service..."
    docker compose restart "$service"
    print_status "$service restarted successfully!"
}

# Function to run Django commands
django_cmd() {
    cmd=$1
    case $cmd in
        "migrate")
            print_status "Running Django migrations..."
            docker compose exec backend python manage.py migrate
            ;;
        "createsuperuser")
            print_status "Creating Django superuser..."
            docker compose exec backend python manage.py createsuperuser
            ;;
        "collectstatic")
            print_status "Collecting static files..."
            docker compose exec backend python manage.py collectstatic --noinput
            ;;
        "shell")
            print_status "Opening Django shell..."
            docker compose exec backend python manage.py shell
            ;;
        *)
            print_error "Unknown Django command. Available: migrate, createsuperuser, collectstatic, shell"
            exit 1
            ;;
    esac
}

# Function to clean up
cleanup() {
    print_warning "This will remove all containers, networks, and volumes. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_status "Cleaning up..."
        docker compose down -v
        docker system prune -f
        print_status "Cleanup completed."
    else
        print_status "Cleanup cancelled."
    fi
}

# Function to show status
show_status() {
    print_status "Service status:"
    docker compose ps
}

# Function to backup database
backup_db() {
    timestamp=$(date +%Y%m%d_%H%M%S)
    backup_file="backup_${timestamp}.sql"
    print_status "Creating database backup: $backup_file"
    docker compose exec db mysqldump -u root -p viberfilm_db > "$backup_file"
    print_status "Database backup created: $backup_file"
}

# Main script logic
main() {
    print_header
    check_docker
    check_env
    
    case "${1:-help}" in
        "start"|"up")
            start_all
            ;;
        "stop"|"down")
            stop_all
            ;;
        "restart")
            restart_service "$2"
            ;;
        "logs")
            view_logs "$2"
            ;;
        "django")
            django_cmd "$2"
            ;;
        "status"|"ps")
            show_status
            ;;
        "cleanup"|"clean")
            cleanup
            ;;
        "backup")
            backup_db
            ;;
        "help"|*)
            echo "Usage: $0 [command] [options]"
            echo ""
            echo "Commands:"
            echo "  start, up              Build and start all services"
            echo "  stop, down             Stop all services"
            echo "  restart [service]      Restart specific service"
            echo "  logs [service]         View logs (all services or specific)"
            echo "  django [command]       Run Django commands (migrate, createsuperuser, collectstatic, shell)"
            echo "  status, ps             Show service status"
            echo "  backup                 Backup database"
            echo "  cleanup, clean         Remove all containers and volumes"
            echo "  help                   Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0 start                   # Start all services"
            echo "  $0 restart frontend        # Restart frontend service"
            echo "  $0 logs backend            # View backend logs"
            echo "  $0 django migrate          # Run Django migrations"
            ;;
    esac
}

# Run main function with all arguments
main "$@"
