#!/bin/bash

# ViberFilm Server Setup Script - Essential Components Only
# This script installs basic requirements for ViberFilm deployment

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}" >&2
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        error "This script should not be run as root for security reasons."
        error "Please run as a regular user with sudo privileges."
        exit 1
    fi
}

# Check sudo privileges
check_sudo() {
    if ! sudo -n true 2>/dev/null; then
        error "This script requires sudo privileges. Please ensure your user can use sudo."
        exit 1
    fi
}

# Update system packages
update_system() {
    log "Updating system packages..."
    
    sudo apt update
    sudo apt upgrade -y
    
    # Install essential packages
    sudo apt install -y \
        curl \
        wget \
        git \
        vim \
        htop \
        unzip \
        software-properties-common \
        apt-transport-https \
        ca-certificates \
        gnupg \
        lsb-release \
        ufw \
        fail2ban \
        tree \
        nano \
        jq \
        net-tools
    
    log "System packages updated successfully"
}

# Install Docker
install_docker() {
    log "Installing Docker..."
    
    # Remove old Docker versions
    sudo apt remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true
    
    # Add Docker's official GPG key
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    
    # Add Docker repository
    echo \
        "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
        $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Install Docker Engine
    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    # Add current user to docker group
    sudo usermod -aG docker $USER
    
    # Start and enable Docker
    sudo systemctl start docker
    sudo systemctl enable docker
    
    # Configure Docker daemon
    sudo mkdir -p /etc/docker
    sudo tee /etc/docker/daemon.json > /dev/null <<EOF
{
    "log-driver": "json-file",
    "log-opts": {
        "max-size": "10m",
        "max-file": "3"
    },
    "storage-driver": "overlay2"
}
EOF
    
    # Restart Docker to apply configuration
    sudo systemctl restart docker
    
    log "Docker installed successfully"
    info "You may need to log out and log back in for Docker permissions to take effect"
}

# Install Docker Compose (standalone version for compatibility)
install_docker_compose() {
    log "Installing Docker Compose standalone..."
    
    # Get latest version
    DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | jq -r .tag_name)
    
    # Download and install
    sudo curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" \
        -o /usr/local/bin/docker-compose
    
    # Make executable
    sudo chmod +x /usr/local/bin/docker-compose
    
    # Create symlink for easier access
    sudo ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
    
    log "Docker Compose installed successfully"
}

# Configure UFW firewall
configure_firewall() {
    log "Configuring UFW firewall..."
    
    # Reset UFW to defaults
    sudo ufw --force reset
    
    # Set default policies
    sudo ufw default deny incoming
    sudo ufw default allow outgoing
    
    # Allow SSH (be careful not to lock yourself out!)
    sudo ufw allow ssh
    sudo ufw allow 22
    
    # Allow ViberFilm application ports
    sudo ufw allow 3000 comment 'ViberFilm Frontend'
    sudo ufw allow 3001 comment 'ViberFilm Admin'
    sudo ufw allow 8000 comment 'ViberFilm Backend API'
    
    # Allow HTTP/HTTPS for web traffic
    sudo ufw allow 80 comment 'HTTP'
    sudo ufw allow 443 comment 'HTTPS'
    
    # Enable UFW
    sudo ufw --force enable
    
    log "UFW firewall configured successfully"
    info "Firewall rules:"
    sudo ufw status verbose
}

# Configure Fail2Ban for security
configure_fail2ban() {
    log "Configuring Fail2Ban..."
    
    # Create custom jail configuration
    sudo tee /etc/fail2ban/jail.local > /dev/null <<EOF
[DEFAULT]
# Ban IP for 1 hour (3600 seconds)
bantime = 3600

# Find time window in seconds
findtime = 600

# Max retry attempts
maxretry = 5

# Ignore local IPs
ignoreip = 127.0.0.1/8 ::1

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
logpath = /var/log/nginx/error.log
maxretry = 3

[nginx-noscript]
enabled = true
filter = nginx-noscript
logpath = /var/log/nginx/access.log
maxretry = 6

[nginx-badbots]
enabled = true
filter = nginx-badbots
logpath = /var/log/nginx/access.log
maxretry = 2

[nginx-noproxy]
enabled = true
filter = nginx-noproxy
logpath = /var/log/nginx/access.log
maxretry = 2
EOF
    
    # Start and enable Fail2Ban
    sudo systemctl start fail2ban
    sudo systemctl enable fail2ban
    
    log "Fail2Ban configured successfully"
    info "Fail2Ban status:"
    sudo fail2ban-client status
}

# Print system information
print_system_info() {
    log "Installation completed successfully!"
    echo
    info "System Information:"
    echo "OS: $(lsb_release -d | cut -f2)"
    echo "Kernel: $(uname -r)"
    echo "Docker: $(docker --version)"
    echo "Docker Compose: $(docker-compose --version)"
    echo
    info "Firewall Status:"
    sudo ufw status
    warning "Important: Please reboot your system to ensure all changes take effect"
    echo "Run: sudo reboot"
}

# Main execution
main() {
    log "Starting ViberFilm essential setup..."
    
    check_root
    check_sudo
    
    update_system
    install_docker
    install_docker_compose
    configure_firewall
    configure_fail2ban
    
    print_system_info
}

# Run main function
main "$@"