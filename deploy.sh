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
    echo "[0/3] Cloning repo for the first time..."
    git clone "$REPO_URL" "$REPO_DIR"
fi

# Navigate to project directory
cd "$REPO_DIR"

# Pull latest code
echo "[1/3] Pulling latest code from $BRANCH..."
git fetch origin
git reset --hard origin/$BRANCH

# Set correct permissions
echo "[2/3] Setting file permissions..."
chown -R www-data:www-data "$REPO_DIR"
chmod -R 755 "$REPO_DIR"

# Restart Nginx
echo "[3/3] Restarting Nginx..."
nginx -t && systemctl restart nginx

echo "========================================="
echo "  Deploy complete!"
echo "========================================="
