#!/bin/bash

# ============================================================================
# ViberFilm Cleanup Script
# ============================================================================

echo "🧹 ViberFilm Cleanup Script"
echo "=========================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}⚠️  This will remove ALL containers, volumes, and media files!${NC}"
echo -e "${RED}❌ This action cannot be undone!${NC}"
echo ""
read -p "Are you sure you want to continue? (type 'YES' to confirm): " confirm

if [ "$confirm" != "YES" ]; then
    echo "❌ Cleanup cancelled"
    exit 1
fi

echo ""
echo "🛑 Stopping services..."
docker compose down --volumes --remove-orphans

echo "🗑️  Removing Docker resources..."
docker system prune -af
docker volume prune -f

echo "📁 Cleaning media directory..."
rm -rf backend/media/*

echo "🧹 Cleaning logs..."
rm -rf logs/*

echo "🔧 Removing build artifacts..."
rm -rf frontend/build/*
rm -rf admin/build/*

echo -e "\n${GREEN}✅ Cleanup completed!${NC}"
echo "💡 Run ./deploy.sh to deploy fresh installation"
