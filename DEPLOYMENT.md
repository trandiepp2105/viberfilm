# 🚀 ViberFilm Deployment Guide

**Simple 4-step deployment process for a fresh server.**

## 📋 Prerequisites

- **Fresh Ubuntu/Debian Server** (20.04+ recommended)
- **Root or sudo access**
- **Minimum 4GB RAM** (8GB recommended)
- **50GB+ storage** for media files
- **Internet connection**

---

## Step 1: Run Setup Script ⚙️

**One command to install everything you need.**

```bash
# Download and run the setup script
wget https://raw.githubusercontent.com/trandiepp2105/viberfilm/main/setup.sh && chmod +x setup.sh && ./setup.sh
```

**What this installs:**
- ✅ Git, Docker, Docker Compose
- ✅ UFW Firewall (ports 22, 80, 443, 3000, 3001, 8000)
- ✅ Fail2Ban security
- ✅ Essential system packages

**After setup completes:**
```bash
# Apply Docker permissions (choose one)
newgrp docker              # Option 1: Apply immediately
sudo reboot                # Option 2: Reboot (recommended)
```

---

## Step 2: Clone Repository 📂

```bash
# Clone ViberFilm repository
git clone https://github.com/trandiepp2105/viberfilm.git

# Enter project directory
cd viberfilm
```

---

## Step 3: Configure Environment 🔧

```bash
# Copy environment template
cp .env.example .env

# Edit your settings
nano .env
```

**⚠️ IMPORTANT: Update these values in `.env`:**

```env
# Server Configuration
SERVER_IP=your-server-ip-here
ALLOWED_HOSTS=your-domain.com,your-server-ip

# Security (CHANGE THESE!)
SECRET_KEY=your-strong-50-character-secret-key
MYSQL_ROOT_PASSWORD=your-mysql-root-password
MYSQL_PASSWORD=your-mysql-password
ELASTIC_PASSWORD=your-elasticsearch-password

# Admin User
DJANGO_SUPERUSER_USERNAME=admin
DJANGO_SUPERUSER_EMAIL=admin@yourdomain.com
DJANGO_SUPERUSER_PASSWORD=your-admin-password

# Email (Optional)
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

**💡 Tips:**
- Use strong, unique passwords
- Generate SECRET_KEY with: `python -c "import secrets; print(secrets.token_urlsafe(50))"`
- For Gmail: Use [App Password](https://support.google.com/accounts/answer/185833), not regular password

---

## Step 4: Deploy Application 🚀

```bash
# Make deployment script executable
chmod +x docker-manager.sh

# Deploy everything (this takes 3-5 minutes)
./docker-manager.sh start
```

**What happens during deployment:**
1. 🔨 Builds Docker images (backend, frontend, admin)
2. 🗄️ Starts databases (MySQL, Redis, Elasticsearch)
3. 🔄 Runs Django migrations
4. 👤 Creates admin user automatically
5. 🌐 Starts all web services

**Monitor deployment progress:**
```bash
# Watch all logs in real-time
./docker-manager.sh logs

# Check container status
docker ps
```

---

## ✅ Verify Deployment

### Quick Health Check
```bash
# Test all services (should return HTTP 200)
curl -I http://localhost:8000/api/     # Backend API
curl -I http://localhost:3000/         # Frontend
curl -I http://localhost:3001/         # Admin Panel
```

### Access Your Platform
Once deployment completes successfully:

🌐 **Frontend (Users):** `http://your-server-ip:3000`  
🛠️ **Admin Panel:** `http://your-server-ip:3001`  
🔧 **API Docs:** `http://your-server-ip:8000/api/`

### Login to Admin Panel
1. Open: `http://your-server-ip:3001`
2. Use credentials from your `.env`:
   - **Username:** `DJANGO_SUPERUSER_USERNAME`
   - **Password:** `DJANGO_SUPERUSER_PASSWORD`

---

## 🎉 Deployment Complete!

**Your ViberFilm platform is now live!**

**✅ What's running:**
- Frontend on port 3000
- Admin panel on port 3001  
- Backend API on port 8000
- MySQL database
- Redis cache
- Elasticsearch search

**🔧 Next steps:**
- Upload your first video via admin panel
- Configure domain and SSL (see Optional Setup below)
- Set up automated backups

---

## 📦 Optional: Restore Database Backup

**If you have a backup from a previous installation:**

```bash
# 1. Upload your backup file to the server
# scp backup_YYYYMMDD_HHMMSS.tar.gz user@server:/path/to/viberfilm/

# 2. Extract backup
mkdir -p backups
cd backups
tar -xzf backup_YYYYMMDD_HHMMSS.tar.gz

# 3. Wait for all services to start (2-3 minutes after deployment)
cd backup_YYYYMMDD_HHMMSS

# 4. Restore data
chmod +x restore.sh && ./restore.sh

# 5. Return to project root
cd ../../
```

---

## 🌐 Optional: Production Setup

### Domain & SSL Setup
```bash
# 1. Install Nginx
sudo apt install nginx

# 2. Configure reverse proxy
sudo nano /etc/nginx/sites-available/viberfilm
```

**Nginx configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /admin {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
# 3. Enable site
sudo ln -s /etc/nginx/sites-available/viberfilm /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx

# 4. Get SSL certificate
sudo snap install --classic certbot
sudo certbot --nginx -d your-domain.com
```

---

## 🔧 Management Commands

```bash
# Restart all services
./docker-manager.sh restart

# Stop all services
./docker-manager.sh stop

# View logs
./docker-manager.sh logs

# Create backup
./backup-database.sh

# Clean up (removes unused Docker data)
./docker-manager.sh clean

# Update application
git pull && ./docker-manager.sh restart
```

---

## 🚨 Troubleshooting

### Common Issues

**Services won't start:**
```bash
# Check what's using the ports
sudo netstat -tulpn | grep -E ':3000|:3001|:8000'

# Check Docker logs
docker compose logs backend
docker compose logs mysql
```

**Database connection failed:**
```bash
# Restart database
docker compose restart mysql

# Check MySQL logs
docker compose logs mysql
```

**Elasticsearch won't start:**
```bash
# Increase virtual memory (common fix)
echo 'vm.max_map_count=262144' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
./docker-manager.sh restart
```

**Permission errors:**
```bash
# Fix Docker permissions
sudo chmod 666 /var/run/docker.sock
newgrp docker
```

### Health Check
```bash
# Create simple health check script
cat > health-check.sh << 'EOF'
#!/bin/bash
echo "=== ViberFilm Health Check ==="
echo "Date: $(date)"
echo

echo "Containers:"
docker ps --format "table {{.Names}}\t{{.Status}}"
echo

echo "Service Response:"
curl -s -o /dev/null -w "Backend: %{http_code}\n" http://localhost:8000/api/
curl -s -o /dev/null -w "Frontend: %{http_code}\n" http://localhost:3000/
curl -s -o /dev/null -w "Admin: %{http_code}\n" http://localhost:3001/
echo

echo "Resources:"
echo "Memory: $(free -h | grep Mem | awk '{print $3"/"$2}')"
echo "Disk: $(df -h / | tail -1 | awk '{print $3"/"$2" ("$5" used)"}')"
EOF

chmod +x health-check.sh
./health-check.sh
```

---

## 🎬 Success!

**Your ViberFilm platform is ready for action!**

🌟 **Start uploading content via the admin panel**  
🌟 **Share your platform with users**  
🌟 **Monitor performance and enjoy streaming!**

**Need help?** Check the main [README.md](README.md) for detailed features and API documentation.
