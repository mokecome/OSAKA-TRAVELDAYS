#!/bin/bash
NODE=/home/master/.nvm/versions/node/v22.22.0/bin/node
APP_DIR=/home/1267721.cloudwaysapps.com/yuqqxgzmck/public_html
LOG=$APP_DIR/server.log

# Load environment variables
if [ -f "$APP_DIR/.env" ]; then
    set -a
    . "$APP_DIR/.env"
    set +a
fi

cd "$APP_DIR"

# Check if already running
if pgrep -f "node server.js" > /dev/null 2>&1; then
    exit 0
fi

# Start the server with logging
nohup "$NODE" server.js >> "$LOG" 2>&1 &
echo "[$(date)] Server started with PID $!" >> "$LOG"
