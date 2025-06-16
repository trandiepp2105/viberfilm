#!/bin/bash

# ============================================================================
# ViberFilm Deployment Script
# ============================================================================

set -e  # Exit on any error

echo "============================================================================"
echo "🚀 ViberFilm Deployment Script"
echo "============================================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="$PROJECT_DIR/backups"
LATEST_BACKUP=$(ls -t $BACKUP_DIR/backup_*/database/ 2>/dev/null | head -1)

echo -e "${BLUE}📁 Project Directory: $PROJECT_DIR${NC}"
echo -e "${BLUE}💾 Backup Directory: $BACKUP_DIR${NC}"

# Function to print step
print_step() {
    echo -e "\n${YELLOW}📋 Step: $1${NC}"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to print error
print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# ============================================================================
# Step 1: Cleanup existing containers and volumes
# ============================================================================
print_step "Cleaning up existing containers and volumes"

echo "🧹 Stopping and removing containers..."
docker compose down --volumes --remove-orphans || true

echo "🗑️  Removing unused Docker resources..."
docker system prune -f
docker volume prune -f

print_success "Cleanup completed"

# ============================================================================
# Step 2: Clean media directory
# ============================================================================
print_step "Cleaning media directory"

if [ -d "$PROJECT_DIR/backend/media" ]; then
    echo "🗂️  Backing up current media..."
    if [ ! -d "$PROJECT_DIR/media_backup" ]; then
        mkdir -p "$PROJECT_DIR/media_backup"
    fi
    cp -r "$PROJECT_DIR/backend/media"/* "$PROJECT_DIR/media_backup/" 2>/dev/null || true
    
    echo "🗑️  Removing media files..."
    rm -rf "$PROJECT_DIR/backend/media"/*
    print_success "Media directory cleaned"
else
    echo "📁 Media directory doesn't exist, creating..."
    mkdir -p "$PROJECT_DIR/backend/media"
    print_success "Media directory created"
fi

# ============================================================================
# Step 3: Restore from backup
# ============================================================================
print_step "Restoring from backup"

if [ -d "$BACKUP_DIR/backup_20250616_152115" ]; then
    RESTORE_DIR="$BACKUP_DIR/backup_20250616_152115"
    echo "📦 Found backup: $RESTORE_DIR"
    
    # Restore media files
    if [ -d "$RESTORE_DIR/media" ]; then
        echo "📁 Restoring media files..."
        cp -r "$RESTORE_DIR/media"/* "$PROJECT_DIR/backend/media/" 2>/dev/null || true
        print_success "Media files restored"
    fi
    
    print_success "Backup restoration completed"
else
    print_error "No backup found at $BACKUP_DIR/backup_20250616_152115"
    echo "Continuing without backup restoration..."
fi

# ============================================================================
# Step 4: Set proper permissions
# ============================================================================
print_step "Setting proper permissions"

chmod -R 755 "$PROJECT_DIR/backend/media" 2>/dev/null || true
chown -R $USER:$USER "$PROJECT_DIR/backend/media" 2>/dev/null || true

print_success "Permissions set"

# ============================================================================
# Step 5: Build and start services
# ============================================================================
print_step "Building and starting services"

echo "🔨 Building Docker images..."
docker compose build --no-cache

echo "🚀 Starting services..."
docker compose up -d

print_success "Services started"

# ============================================================================
# Step 6: Wait for services to be ready
# ============================================================================
print_step "Waiting for services to be ready"

echo "⏳ Waiting for database to be ready..."
sleep 30

echo "⏳ Waiting for backend to be ready..."
sleep 15

# ============================================================================
# Step 7: Database setup
# ============================================================================
print_step "Setting up database"

echo "🗃️  Running database migrations..."
docker compose exec -T backend python manage.py makemigrations
docker compose exec -T backend python manage.py migrate

# Restore database if backup exists
if [ -f "$RESTORE_DIR/database/viberfilm_database.sql" ]; then
    echo "📥 Restoring database from backup..."
    docker compose exec -T db mysql -u root -p$MYSQL_ROOT_PASSWORD $MYSQL_DATABASE < "$RESTORE_DIR/database/viberfilm_database.sql"
    print_success "Database restored from backup"
else
    echo "🆕 Creating superuser (if needed)..."
    docker compose exec -T backend python manage.py shell << EOF
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@viberfilm.com', 'admin123')
    print('Superuser created')
else:
    print('Superuser already exists')
EOF
fi

echo "📊 Collecting static files..."
docker compose exec -T backend python manage.py collectstatic --noinput

print_success "Database setup completed"

# ============================================================================
# Step 8: Health check
# ============================================================================
print_step "Running health checks"

echo "🔍 Checking service status..."
docker compose ps

echo "🌐 Testing endpoints..."
sleep 5

# Test backend
if curl -f http://localhost:8000/api/ >/dev/null 2>&1; then
    print_success "Backend is responding"
else
    print_error "Backend is not responding"
fi

# Test frontend
if curl -f http://localhost/ >/dev/null 2>&1; then
    print_success "Frontend is responding"
else
    print_error "Frontend is not responding"
fi

# Test admin
if curl -f http://localhost:3001/ >/dev/null 2>&1; then
    print_success "Admin panel is responding"
else
    print_error "Admin panel is not responding"
fi

# ============================================================================
# Deployment completed
# ============================================================================
echo -e "\n${GREEN}============================================================================${NC}"
echo -e "${GREEN}🎉 ViberFilm Deployment Completed Successfully!${NC}"
echo -e "${GREEN}============================================================================${NC}"

echo -e "\n${BLUE}📱 Application URLs:${NC}"
echo -e "   🌐 Frontend:    http://localhost/"
echo -e "   ⚙️  Admin:       http://localhost:3001/"
echo -e "   🔧 Backend API: http://localhost:8000/api/"
echo -e "   🗄️  Database:    localhost:3307"

echo -e "\n${BLUE}🔧 Management Commands:${NC}"
echo -e "   📊 View logs:        docker compose logs -f"
echo -e "   🛑 Stop services:    docker compose down"
echo -e "   🔄 Restart:          docker compose restart"
echo -e "   💾 Backup:           ./backup-database.sh"

echo -e "\n${YELLOW}⚠️  Remember to:${NC}"
echo -e "   1. Change default passwords in production"
echo -e "   2. Update SECRET_KEY in .env file"
echo -e "   3. Configure proper SSL/HTTPS"
echo -e "   4. Set up regular backups"

echo -e "\n${GREEN}Happy coding! 🚀${NC}"
