#!/bin/bash

# ENpower Website - Deploy Script
# Usage: ./deploy.sh

set -e

REPO_URL="https://github.com/Shravani-Todankar/ESL.git"
REPO_DIR="/var/www/ESL"
BRANCH="main"

echo "========================================="
echo "  ENpower Website - Deploying..."
echo "========================================="

# If repo doesn't exist, clone it
if [ ! -d "$REPO_DIR/.git" ]; then
    echo "[0/5] Cloning repo for the first time..."
    git clone "$REPO_URL" "$REPO_DIR"
fi

# Navigate to project directory
cd "$REPO_DIR"

# Pull latest code
echo "[1/5] Pulling latest code from $BRANCH..."
git fetch origin
git reset --hard origin/$BRANCH

# Set correct permissions
echo "[2/5] Setting file permissions..."
chown -R www-data:www-data "$REPO_DIR"
chmod -R 755 "$REPO_DIR"

# Install/update backend dependencies
echo "[3/5] Installing backend dependencies..."
cd "$REPO_DIR/api"
npm install --production

# Restart backend via PM2 (start if not running, reload if running)
echo "[4/5] Restarting backend (PM2)..."
if pm2 describe enpower-api > /dev/null 2>&1; then
    pm2 reload enpower-api --update-env
else
    pm2 start send-email.js --name enpower-api
    pm2 save
fi

# Restart Nginx
echo "[5/5] Restarting Nginx..."
nginx -t && systemctl restart nginx

echo "========================================="
echo "  Deploy complete!"
echo "========================================="
pm2 status enpower-api
