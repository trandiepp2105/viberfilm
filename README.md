# ViberFilm - Video Streaming Platform (Django & React)

A full-stack video streaming platform built with Django REST Framework backend and ReactJS for the frontend and admin panel. The application allows users to browse movies and TV series, manage their watchlist, stream videos with HLS technology, and manage their account. It features advanced search capabilities powered by Elasticsearch, video processing with multiple quality options, and is deployed using Docker.

**Live Application URL:** [Coming Soon]
_(The application will be deployed with frontend on port 3000, admin panel on port 3001, and backend API on port 8000.)_

## ✨ Features

**User Management:**

- **User Registration:** New users can create an account with email verification.
- **User Login/Logout:** Secure JWT-based authentication for registered users.
- **User Profiles:** Users can manage their personal information and preferences.
- **Watch History:** Track viewing progress and maintain watch history.

**Content & Media:**

- **Movie & TV Series Catalog:** Browse extensive collection of movies and TV shows.
- **Advanced Search:** Find specific content using Elasticsearch-powered search functionality.
- **Content Details:** View detailed information including cast, crew, ratings, and synopsis.
- **Season & Episode Management:** Organized TV series with seasons and episodes.
- **Genre & Category Filtering:** Browse content by genres, release year, and other criteria.

**Video Streaming:**

- **HLS Video Streaming:** Adaptive bitrate streaming for optimal viewing experience.
- **Multiple Quality Options:** Support for different video quality levels (480p, 720p, 1080p).
- **Video Player Controls:** Full-featured video player with seek, volume, and fullscreen controls.
- **Resume Playback:** Continue watching from where you left off.

**Content Management (Admin Panel):**

- **Content Upload:** Upload and manage video files with automatic processing.
- **Metadata Management:** Add and edit movie/series information, cast, and crew details.
- **User Management:** Admin tools for managing user accounts and permissions.
- **Analytics Dashboard:** View platform statistics and user engagement metrics.
- **Content Moderation:** Review and approve user-generated content and comments.

**Additional Features:**

- **Responsive Design:** Optimized for desktop, tablet, and mobile devices.
- **Comment System:** Users can comment and rate content.
- **Recommendation Engine:** Personalized content recommendations.
- **Backup & Recovery:** Automated database backup system.

## 🛠️ Tech Stack

- **Backend:**
  - Framework: Django (Python)
  - API: Django REST Framework
  - Authentication: JWT (JSON Web Tokens)
- **Frontend & Admin Panel:**
  - Library: ReactJS
  - UI Framework: Material-UI
  - State Management: React Context API
- **Database:** MySQL 8.0
- **Search Engine:** Elasticsearch
- **Caching & Message Broker:** Redis
- **Video Processing:** FFmpeg (for HLS conversion)
- **Containerization:** Docker, Docker Compose
- **Deployment:** Docker with automated scripts

## 🚀 Getting Started (Local Development)

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Git
- Docker & Docker Compose
- Node.js & npm (if you intend to run frontend/admin outside Docker for development)
- Python 3.9+ & pip (if you intend to run backend outside Docker for development)

### Installation with Docker

This is the recommended way to run the entire stack locally using our automated Docker management script.

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd viberfilm
    ```

2.  **Configure Environment Variables:**
    
    Copy the environment template and configure with your settings:

    ```bash
    cp .env.example .env
    ```

    **Configure your `.env` file with appropriate values:**

    ```env
    # ============================================================================
    # ENVIRONMENT SETTINGS
    # ============================================================================
    ENVIRONMENT=development
    DEBUG=True
    SECRET_KEY=your-django-secret-key-change-this-in-production

    # ============================================================================
    # SERVER & NETWORK CONFIGURATION
    # ============================================================================
    SERVER_IP=127.0.0.1
    SERVER_PORT=8000
    FRONTEND_PORT=3000
    ADMIN_PORT=3001
    ALLOWED_HOSTS=localhost,127.0.0.1,your-domain.com

    # ============================================================================
    # DATABASE CONFIGURATION
    # ============================================================================
    MYSQL_ROOT_PASSWORD=your-mysql-root-password
    MYSQL_DATABASE=viberfilm_database
    MYSQL_USER=viberfilm_user
    MYSQL_PASSWORD=your-mysql-password
    MYSQL_HOST=db
    MYSQL_PORT=3306

    # Database connection for Django
    DB_NAME=${MYSQL_DATABASE}
    DB_USER=${MYSQL_USER}
    DB_PASSWORD=${MYSQL_PASSWORD}
    DB_HOST=${MYSQL_HOST}
    DB_PORT=${MYSQL_PORT}

    # ============================================================================
    # REDIS CONFIGURATION
    # ============================================================================
    REDIS_URL=redis://redis:6379/0
    REDIS_HOST=redis
    REDIS_DB=0

    # ============================================================================
    # ELASTICSEARCH CONFIGURATION
    # ============================================================================
    ELASTICSEARCH_HOST=elasticsearch
    ELASTICSEARCH_PORT=9200
    ELASTIC_HOST=http://${ELASTICSEARCH_HOST}:${ELASTICSEARCH_PORT}
    ELASTIC_USERNAME=elastic
    ELASTIC_PASSWORD=your-elasticsearch-password

    # ============================================================================
    # EMAIL CONFIGURATION
    # ============================================================================
    EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
    EMAIL_HOST=smtp.gmail.com
    EMAIL_PORT=587
    EMAIL_USE_TLS=True
    EMAIL_HOST_USER=your-email@gmail.com
    EMAIL_HOST_PASSWORD=your-app-password
    DEFAULT_FROM_EMAIL=${EMAIL_HOST_USER}

    # ============================================================================
    # ADMIN USER CREDENTIALS
    # ============================================================================
    DJANGO_SUPERUSER_USERNAME=admin
    DJANGO_SUPERUSER_EMAIL=admin@yourdomain.com
    DJANGO_SUPERUSER_PASSWORD=your-admin-password

    # ============================================================================
    # JWT CONFIGURATION
    # ============================================================================
    JWT_ACCESS_TOKEN_LIFETIME=60
    JWT_REFRESH_TOKEN_LIFETIME=10080
    JWT_ROTATE_REFRESH_TOKENS=True
    JWT_BLACKLIST_AFTER_ROTATION=True
    ```

3.  **Build and Run with Docker Manager Script:**

    Make the Docker manager script executable and start all services:

    ```bash
    chmod +x docker-manager.sh
    ./docker-manager.sh start
    ```

    This will:
    - Build all Docker images
    - Start MySQL, Redis, and Elasticsearch
    - Run database migrations
    - Create admin user
    - Start all services

4.  **Alternative Docker Commands:**

    If you prefer using Docker Compose directly:

    ```bash
    # Build and start all services
    docker-compose up --build -d

    # Apply migrations manually (if needed)
    docker-compose exec backend python manage.py makemigrations
    docker-compose exec backend python manage.py migrate

    # Create superuser
    docker-compose exec backend python manage.py createsuperuser
    ```

5.  **Access the application:**
    
    Once all services are running:
    - **Frontend (User Interface):** `http://localhost:3000`
    - **Admin Panel:** `http://localhost:3001`
    - **Backend API:** `http://localhost:8000`
    - **API Documentation:** `http://localhost:8000/api/docs/`

## 🐳 Docker Management

The project includes a comprehensive Docker management script for easy development:

```bash
# Start all services (builds if necessary)
./docker-manager.sh start

# Stop all services
./docker-manager.sh stop

# Restart all services
./docker-manager.sh restart

# Restart specific service
./docker-manager.sh restart backend
./docker-manager.sh restart frontend

# View logs for all services
./docker-manager.sh logs

# View logs for specific service
./docker-manager.sh logs backend

# Clean up containers and images
./docker-manager.sh clean

# Get help
./docker-manager.sh help
```

## 📁 Project Structure

```
viberfilm/
├── 📁 backend/              # Django REST API
│   ├── 📁 api/              # API routes and configurations
│   ├── 📁 core/             # Django settings and main configuration
│   ├── 📁 film/             # Movie and TV series models and views
│   ├── 📁 user/             # User management and authentication
│   ├── 📁 video/            # Video processing and streaming
│   ├── 📁 search/           # Elasticsearch integration
│   ├── 📁 comment/          # Comment system
│   ├── 📁 media/            # Uploaded media files
│   ├── 📄 manage.py         # Django management script
│   ├── 📄 requirements.txt  # Python dependencies
│   └── 📄 entrypoint.sh     # Docker entrypoint script
├── 📁 frontend/             # React user interface
│   ├── 📁 src/              # React source code
│   ├── 📁 public/           # Static assets
│   ├── 📄 package.json      # Node.js dependencies
│   └── 📄 Dockerfile        # Frontend Docker configuration
├── 📁 admin/                # React admin panel
│   ├── 📁 src/              # Admin panel source code
│   ├── 📁 public/           # Admin static assets
│   ├── 📄 package.json      # Admin dependencies
│   └── 📄 Dockerfile        # Admin Docker configuration
├── 📄 docker-compose.yml    # Docker services configuration
├── 📄 docker-manager.sh     # Docker management script
├── 📄 backup-database.sh    # Database backup script
├── 📄 .env.example          # Environment variables template
├── 📄 .gitignore            # Git ignore rules
└── 📄 README.md             # This file
```

## 🔄 Data Management

### Backup System

The project includes an automated backup system:

```bash
# Create backup
./backup-database.sh

# This creates a timestamped backup in backups/ directory containing:
# - Database dump
# - Media files
# - Configuration files
# - Restore script
```

### Restore from Backup

```bash
# Navigate to backup directory
cd backups/backup_YYYYMMDD_HHMMSS/

# Run restore script
./restore.sh

# This will restore:
# - Database data
# - Media files
# - Previous configurations
```

## 🎬 Video Content Management

### Supported Video Formats

- **Input:** MP4, AVI, MOV, MKV
- **Output:** HLS (HTTP Live Streaming) with multiple qualities
- **Qualities:** 480p, 720p, 1080p (configurable)

### Adding Content

1. **Via Admin Panel:**
   - Upload video files through the admin interface
   - Add metadata (title, description, cast, genre, etc.)
   - System automatically processes videos for streaming

2. **Via API:**
   - Use REST endpoints to programmatically add content
   - Bulk upload capabilities for large content libraries

## 🔍 Search Functionality

The platform uses Elasticsearch for powerful search capabilities:

- **Content Search:** Find movies and TV shows by title, cast, genre
- **Fuzzy Search:** Handle typos and partial matches
- **Faceted Search:** Filter by multiple criteria
- **Auto-complete:** Real-time search suggestions

## ☁️ Deployment

### Production Environment

1. **Server Requirements:**
   - Docker and Docker Compose
   - Minimum 4GB RAM (8GB recommended)
   - 50GB+ storage for media files

2. **Deployment Steps:**
   ```bash
   # Clone repository
   git clone <repository-url>
   cd viberfilm
   
   # Configure production environment
   cp .env.example .env
   # Edit .env with production values
   
   # Start services
   ./docker-manager.sh start
   ```

3. **Production Configuration:**
   ```env
   ENVIRONMENT=production
   DEBUG=False
   SECRET_KEY=your-production-secret-key
   ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
   
   # Use strong passwords
   MYSQL_ROOT_PASSWORD=strong-root-password
   MYSQL_PASSWORD=strong-user-password
   ELASTIC_PASSWORD=strong-elastic-password
   ```

### SSL and Domain Setup

For production deployment with custom domain and SSL:

1. Configure reverse proxy (Nginx recommended)
2. Set up SSL certificates (Let's Encrypt recommended)
3. Update ALLOWED_HOSTS in .env
4. Configure DNS records

## 🧪 Development & Testing

### Running Tests

```bash
# Backend tests
docker-compose exec backend python manage.py test

# Frontend tests
docker-compose exec frontend npm test

# Admin panel tests
docker-compose exec admin npm test
```

### Development Workflow

1. **Backend Development:**
   ```bash
   # Enter backend container
   docker-compose exec backend bash
   
   # Create new Django app
   python manage.py startapp newapp
   
   # Run migrations
   python manage.py makemigrations
   python manage.py migrate
   ```

2. **Frontend Development:**
   ```bash
   # Enter frontend container
   docker-compose exec frontend bash
   
   # Install new packages
   npm install package-name
   
   # Run development server (if not using Docker)
   npm start
   ```

## 📊 Monitoring & Logs

### View Logs

```bash
# All services
./docker-manager.sh logs

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql
docker-compose logs -f elasticsearch
```

### Health Checks

```bash
# Check all containers
docker ps

# Check specific service health
docker-compose exec backend python manage.py check
docker-compose exec mysql mysqladmin ping
```

## 🔧 Troubleshooting

### Common Issues

1. **Port Conflicts:**
   ```bash
   # Check if ports are in use
   netstat -tulpn | grep :3000
   netstat -tulpn | grep :8000
   
   # Change ports in .env file if needed
   ```

2. **Database Connection Issues:**
   ```bash
   # Check MySQL logs
   docker-compose logs mysql
   
   # Verify database connection
   docker-compose exec backend python manage.py dbshell
   ```

3. **Elasticsearch Issues:**
   ```bash
   # Check Elasticsearch status
   curl http://localhost:9200/_cluster/health
   
   # Increase Docker memory if needed (minimum 2GB for Elasticsearch)
   ```

4. **Video Processing Issues:**
   ```bash
   # Check FFmpeg availability
   docker-compose exec backend ffmpeg -version
   
   # Monitor video processing logs
   docker-compose logs -f backend | grep video
   ```

## 🤝 Contributing

Contributions are welcome! If you'd like to contribute, please follow these steps:

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

### Development Guidelines

- Follow PEP 8 for Python code
- Use ESLint configuration for JavaScript/React code
- Write tests for new features
- Update documentation for API changes
- Use meaningful commit messages

## 📜 License

Distributed under the MIT License. See `LICENSE` file for more information.

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Email: [your-email@domain.com]

---

**Author:** Van Diep Tran  
**GitHub:** https://github.com/trandiepp2105

**Note:** Remember to keep your `.env` file secure and never commit it to version control. Use strong passwords for production deployment.
