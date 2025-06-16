#!/bin/bash

# ViberFilm Database Backup Script
# This script creates a complete backup of the database and media files

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[BACKUP]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE} ViberFilm Database Backup${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Check if docker is running and containers exist
check_requirements() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    
    if ! docker ps --format "table {{.Names}}" | grep -q "mysql"; then
        print_error "MySQL container 'mysql' is not running."
        print_warning "Please start your services first: ./docker-manager.sh start"
        exit 1
    fi
    
    if ! docker ps --format "table {{.Names}}" | grep -q "backend"; then
        print_warning "Backend container is not running. Media files backup may fail."
    fi
}

# Create backup directory
create_backup_dir() {
    BACKUP_TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_DIR="./backups/backup_${BACKUP_TIMESTAMP}"
    
    print_status "Creating backup directory: $BACKUP_DIR" >&2
    mkdir -p "$BACKUP_DIR"
    
    # Create subdirectories
    mkdir -p "$BACKUP_DIR/database"
    mkdir -p "$BACKUP_DIR/media"
    mkdir -p "$BACKUP_DIR/logs"
    
    echo "$BACKUP_DIR"
}

# Backup database
backup_database() {
    local backup_dir=$1
    
    print_status "Starting database backup..."
    
    # Load environment variables from .env file
    if [ -f ".env" ]; then
        source .env
    fi
    
    # Get database credentials from .env or use defaults
    DB_NAME=${MYSQL_DATABASE:-"viberfilm_database"}
    DB_USER=${MYSQL_USER:-"trandiep2105"}
    DB_PASSWORD=${MYSQL_PASSWORD:-"Diep2105@"}
    
    print_status "Database: $DB_NAME"
    print_status "User: $DB_USER"
    
    # Create SQL dump with timestamp
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local sql_file="$backup_dir/database/${DB_NAME}_${timestamp}.sql"
    
    # Ensure database directory exists
    mkdir -p "$(dirname "$sql_file")"
    
    print_status "Creating SQL dump: $(basename "$sql_file")"
    
    if docker exec mysql mysqldump -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" > "$sql_file"; then
        print_status "Database backup completed successfully!"
        
        # Get file size
        local size=$(du -h "$sql_file" | cut -f1)
        print_status "Backup size: $size"
        
        # Create a compressed version
        print_status "Creating compressed backup..."
        gzip -c "$sql_file" > "${sql_file}.gz"
        local compressed_size=$(du -h "${sql_file}.gz" | cut -f1)
        print_status "Compressed size: $compressed_size"
        
    else
        print_error "Database backup failed!"
        return 1
    fi
}

# Backup media files
backup_media() {
    local backup_dir=$1
    
    print_status "Starting media files backup..."
    
    if docker ps --format "table {{.Names}}" | grep -q "backend"; then
        # Check if media directory exists in container
        if docker exec backend test -d /backend/media; then
            print_status "Copying media files from backend container..."
            docker cp backend:/backend/media/. "$backup_dir/media/"
            
            # Get media backup size
            local media_size=$(du -sh "$backup_dir/media" 2>/dev/null | cut -f1 || echo "0")
            print_status "Media files backup size: $media_size"
        else
            print_warning "No media directory found in backend container"
        fi
        
        # Also backup static files if they exist
        if docker exec backend test -d /backend/static; then
            print_status "Copying static files from backend container..."
            mkdir -p "$backup_dir/static"
            docker cp backend:/backend/static/. "$backup_dir/static/"
        fi
        
    else
        print_warning "Backend container not running. Skipping media backup."
    fi
}

# Backup logs
backup_logs() {
    local backup_dir=$1
    
    print_status "Starting logs backup..."
    
    # Backup Docker container logs
    print_status "Backing up Docker container logs..."
    
    # Get list of running containers
    local containers=$(docker ps --format "{{.Names}}" | grep -E "(backend|frontend|admin|mysql|redis|elasticsearch)" || true)
    
    if [ -n "$containers" ]; then
        for container in $containers; do
            print_status "Backing up logs for container: $container"
            
            # Create container-specific log directory
            mkdir -p "$backup_dir/logs/docker/$container"
            
            # Get container logs (last 1000 lines to avoid huge files)
            docker logs --tail 1000 "$container" > "$backup_dir/logs/docker/$container/${container}.log" 2>&1 || {
                print_warning "Could not backup logs for container: $container"
            }
        done
    else
        print_warning "No relevant containers found for log backup"
    fi
    
    # Backup application logs from backend container if exists
    if docker ps --format "table {{.Names}}" | grep -q "backend"; then
        print_status "Checking for Django application logs..."
        
        # Check if Django logs directory exists
        if docker exec backend test -d /backend/logs 2>/dev/null; then
            print_status "Copying Django application logs..."
            docker cp backend:/backend/logs/. "$backup_dir/logs/django/" 2>/dev/null || {
                print_warning "Could not copy Django logs"
            }
        else
            print_status "No Django logs directory found in backend container"
        fi
        
        # Backup any other log files that might exist
        docker exec backend find /backend -name "*.log" -type f 2>/dev/null | while read -r logfile; do
            if [ -n "$logfile" ]; then
                print_status "Found log file: $logfile"
                mkdir -p "$backup_dir/logs/misc"
                docker cp "backend:$logfile" "$backup_dir/logs/misc/" 2>/dev/null || true
            fi
        done
    fi
    
    # Get logs backup size
    local logs_size=$(du -sh "$backup_dir/logs" 2>/dev/null | cut -f1 || echo "0")
    print_status "Logs backup size: $logs_size"
    
    # Create logs summary
    cat > "$backup_dir/logs/backup_summary.txt" << EOF
Logs Backup Summary
===================
Date: $(date)
Total size: $logs_size

Docker Container Logs:
$(ls -la "$backup_dir/logs/docker/" 2>/dev/null || echo "No Docker logs")

Django Application Logs:
$(ls -la "$backup_dir/logs/django/" 2>/dev/null || echo "No Django logs")

Miscellaneous Logs:
$(ls -la "$backup_dir/logs/misc/" 2>/dev/null || echo "No misc logs")
EOF

    print_status "Logs backup completed!"
}

# Backup configuration files
backup_config() {
    local backup_dir=$1
    
    print_status "Backing up configuration files..."
    
    # Copy important config files
    cp .env "$backup_dir/.env.backup" 2>/dev/null || print_warning ".env file not found"
    cp docker-compose.yml "$backup_dir/docker-compose.yml.backup" 2>/dev/null || print_warning "docker-compose.yml not found"
    
    # Create environment info
    cat > "$backup_dir/backup_info.txt" << EOF
Backup Information
==================
Date: $(date)
Server: $(hostname)
Docker Version: $(docker --version)
Database: $DB_NAME
User: $DB_USER

Files included:
- Database SQL dump
- Media files
- Static files
- Configuration files

Restore instructions:
1. Copy this backup to new server
2. Run: ./restore.sh $(basename "$backup_dir")
EOF
}

# Create restore script
create_restore_script() {
    local backup_dir=$1
    
    print_status "Creating restore script..."
    
    cat > "$backup_dir/restore.sh" << 'EOF'
#!/bin/bash

# ViberFilm Database Restore Script
# Usage: ./restore.sh

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[RESTORE]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Get the directory where this script is located
BACKUP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$BACKUP_DIR")"

print_status "Restoring from: $BACKUP_DIR"
print_status "Project root: $PROJECT_ROOT"

# Check if we're in the right location
if [ ! -f "$PROJECT_ROOT/docker-compose.yml" ]; then
    print_error "docker-compose.yml not found in $PROJECT_ROOT"
    print_error "Please run this script from the backup directory in your project root"
    exit 1
fi

cd "$PROJECT_ROOT"

# Restore configuration
if [ -f "$BACKUP_DIR/.env.backup" ]; then
    if [ ! -f ".env" ]; then
        print_status "Restoring .env file..."
        cp "$BACKUP_DIR/.env.backup" ".env"
    else
        print_warning ".env already exists. Backup available at $BACKUP_DIR/.env.backup"
    fi
fi

# Start services
print_status "Starting services..."
./docker-manager.sh start

# Wait for database to be ready
print_status "Waiting for database to be ready..."
sleep 30

# Restore database
print_status "Restoring database..."
for sql_file in "$BACKUP_DIR/database"/*.sql; do
    if [ -f "$sql_file" ]; then
        print_status "Restoring $(basename "$sql_file")..."
        
        # Try to get DB credentials from .env
        if [ -f ".env" ]; then
            source .env
        fi
        
        DB_NAME=${MYSQL_DATABASE:-"viberfilm_database"}
        DB_USER=${MYSQL_USER:-"trandiep2105"}
        DB_PASSWORD=${MYSQL_PASSWORD:-"Diep2105@"}
        
        docker exec -i mysql mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < "$sql_file"
        print_status "Database restored successfully!"
        break
    fi
done

# Restore media files
if [ -d "$BACKUP_DIR/media" ] && [ "$(ls -A "$BACKUP_DIR/media")" ]; then
    print_status "Restoring media files..."
    docker cp "$BACKUP_DIR/media/." backend:/backend/media/
    print_status "Media files restored!"
fi

# Restore static files
if [ -d "$BACKUP_DIR/static" ] && [ "$(ls -A "$BACKUP_DIR/static")" ]; then
    print_status "Restoring static files..."
    docker cp "$BACKUP_DIR/static/." backend:/backend/static/
    print_status "Static files restored!"
fi

# Run migrations to ensure database is up to date
print_status "Running database migrations..."
./docker-manager.sh django migrate

# Collect static files
print_status "Collecting static files..."
./docker-manager.sh django collectstatic

print_status "Restore completed successfully!"
print_status "Your ViberFilm application should now be running with restored data."
EOF

    chmod +x "$backup_dir/restore.sh"
    print_status "Restore script created: $backup_dir/restore.sh"
}

# Main backup function
main() {
    print_header
    
    print_status "Starting ViberFilm backup process..."
    
    # Check requirements
    check_requirements
    
    # Create backup directory
    BACKUP_DIR=$(create_backup_dir)
    
    # Perform backups
    backup_database "$BACKUP_DIR"
    backup_media "$BACKUP_DIR"
    backup_logs "$BACKUP_DIR"
    backup_config "$BACKUP_DIR"
    create_restore_script "$BACKUP_DIR"
    
    # Create compressed archive
    print_status "Creating compressed backup archive..."
    tar -czf "${BACKUP_DIR}.tar.gz" -C "$(dirname "$BACKUP_DIR")" "$(basename "$BACKUP_DIR")"
    
    local archive_size=$(du -h "${BACKUP_DIR}.tar.gz" | cut -f1)
    
    print_status "Backup completed successfully!"
    echo ""
    echo "📁 Backup directory: $BACKUP_DIR"
    echo "📦 Compressed archive: ${BACKUP_DIR}.tar.gz (Size: $archive_size)"
    echo ""
    echo "🚀 To deploy to a new server:"
    echo "1. Copy ${BACKUP_DIR}.tar.gz to the new server"
    echo "2. Extract: tar -xzf $(basename "${BACKUP_DIR}.tar.gz")"
    echo "3. Setup ViberFilm project on new server"
    echo "4. Run: ./$(basename "$BACKUP_DIR")/restore.sh"
    echo ""
    echo "💡 Or use the restore script directly from the backup directory"
}

# Run main function
main "$@"
