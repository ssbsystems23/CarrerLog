# VPS Deployment Guide

## Prerequisites
- Ubuntu/Debian VPS with root access
- Domain name pointing to your VPS IP
- PostgreSQL installed

## Step 1: Install System Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python and dependencies
sudo apt install python3 python3-pip python3-venv nginx postgresql postgresql-contrib -y

# Install certbot for SSL (optional but recommended)
sudo apt install certbot python3-certbot-nginx -y
```

## Step 2: Setup PostgreSQL Database

```bash
# Switch to postgres user
sudo -u postgres psql

# In PostgreSQL shell, create database and user
CREATE DATABASE carrerlog;
CREATE USER your_db_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE carrerlog TO your_db_user;
\q
```

## Step 3: Deploy Backend Code

```bash
# Create deployment directory
sudo mkdir -p /var/www/developer-dashboard/backend
cd /var/www/developer-dashboard/backend

# Clone or upload your code here
# If using git:
# git clone your-repo-url .

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

## Step 4: Configure Environment Variables

```bash
# Copy production env template
cp .env.production .env

# Edit .env with your actual values
nano .env
```

Update these values:
- `SECRET_KEY`: Generate a secure random string
- `DATABASE_URL`: Update with your PostgreSQL credentials
- `GOOGLE_REDIRECT_URI`: Update with your production domain

```bash
# Generate a secure secret key
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

## Step 5: Run Database Migrations

```bash
# Make sure you're in the backend directory with venv activated
source .venv/bin/activate

# Run Alembic migrations
alembic upgrade head
```

## Step 6: Setup Systemd Service

```bash
# Copy service file
sudo cp developer-dashboard.service /etc/systemd/system/

# Edit the service file to update paths
sudo nano /etc/systemd/system/developer-dashboard.service
```

Update these paths in the service file:
- `WorkingDirectory=/var/www/developer-dashboard/backend`
- `Environment="PATH=/var/www/developer-dashboard/backend/.venv/bin"`
- `ExecStart=/var/www/developer-dashboard/backend/.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 4`

```bash
# Create uploads directory
mkdir -p /var/www/developer-dashboard/backend/uploads

# Set correct permissions
sudo chown -R www-data:www-data /var/www/developer-dashboard
sudo chmod -R 755 /var/www/developer-dashboard

# Enable and start the service
sudo systemctl daemon-reload
sudo systemctl enable developer-dashboard
sudo systemctl start developer-dashboard

# Check status
sudo systemctl status developer-dashboard
```

## Step 7: Configure Nginx

```bash
# Copy nginx config
sudo cp nginx.conf /etc/nginx/sites-available/developer-dashboard

# Edit the config
sudo nano /etc/nginx/sites-available/developer-dashboard
```

Update these values:
- `server_name api.yourdomain.com yourdomain.com;` → Your actual domain
- `location /uploads/` alias path → `/var/www/developer-dashboard/backend/uploads/;`
- Update CORS origins in main.py to match your frontend domain

```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/developer-dashboard /etc/nginx/sites-enabled/

# Test nginx configuration
sudo nginx -t

# If test passes, reload nginx
sudo systemctl reload nginx
```

## Step 8: Setup SSL Certificate (Recommended)

```bash
# Get SSL certificate from Let's Encrypt
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Certbot will automatically configure nginx for HTTPS
# Follow the prompts to complete setup
```

## Step 9: Verify Deployment

```bash
# Check if backend is running
curl http://localhost:8000/api/v1/

# Check through nginx
curl http://yourdomain.com/api/v1/

# Check logs if issues occur
sudo journalctl -u developer-dashboard -f
sudo tail -f /var/log/nginx/developer-dashboard-error.log
```

## Troubleshooting Common Issues

### 1. 500 Internal Server Error

Check backend logs:
```bash
sudo journalctl -u developer-dashboard -n 50
```

Check nginx error logs:
```bash
sudo tail -f /var/log/nginx/developer-dashboard-error.log
```

### 2. Backend Not Starting

```bash
# Check service status
sudo systemctl status developer-dashboard

# Check for port conflicts
sudo netstat -tlnp | grep :8000

# Test running manually
cd /var/www/developer-dashboard/backend
source .venv/bin/activate
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

### 3. Database Connection Issues

```bash
# Test database connection
psql -U your_db_user -d carrerlog -h localhost

# Check if PostgreSQL is running
sudo systemctl status postgresql
```

### 4. Nginx 502 Bad Gateway

This means nginx can't reach your backend:
```bash
# Verify backend is running
sudo systemctl status developer-dashboard

# Check if listening on correct port
sudo netstat -tlnp | grep :8000
```

### 5. CORS Issues

Update CORS origins in `app/main.py`:
```python
allow_origins=[
    "https://yourdomain.com",
    "https://www.yourdomain.com",
]
```

Then restart the service:
```bash
sudo systemctl restart developer-dashboard
```

## Useful Commands

```bash
# Restart backend
sudo systemctl restart developer-dashboard

# View backend logs
sudo journalctl -u developer-dashboard -f

# Restart nginx
sudo systemctl restart nginx

# View nginx logs
sudo tail -f /var/log/nginx/developer-dashboard-error.log

# Check if ports are listening
sudo netstat -tlnp | grep -E ':(80|443|8000)'

# Update code and restart
cd /var/www/developer-dashboard/backend
git pull
source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
sudo systemctl restart developer-dashboard
```

## Security Checklist

- [ ] Change SECRET_KEY to a secure random string
- [ ] Update database password from default
- [ ] Enable SSL/HTTPS with certbot
- [ ] Configure firewall (ufw):
  ```bash
  sudo ufw allow 22/tcp  # SSH
  sudo ufw allow 80/tcp  # HTTP
  sudo ufw allow 443/tcp # HTTPS
  sudo ufw enable
  ```
- [ ] Update CORS origins to only allow your frontend domain
- [ ] Set appropriate file permissions (755 for directories, 644 for files)
- [ ] Never commit .env file to git
- [ ] Regularly update system packages
