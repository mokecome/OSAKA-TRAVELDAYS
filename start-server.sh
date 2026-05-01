#!/bin/bash
APP_DIR=/home/1267721.cloudwaysapps.com/yuqqxgzmck/public_html
LOG=$APP_DIR/server.log

# Hot path: cron runs us every 2 min, bail before sourcing nvm if server is up
if pgrep -f "node server.js" > /dev/null 2>&1; then
    exit 0
fi

# Cold path — only at boot or after a crash
export NVM_DIR=/home/master/.nvm
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" >/dev/null 2>&1
NODE=$(nvm which default 2>/dev/null) || NODE=$(command -v node)

if [ -z "$NODE" ]; then
    echo "[$(date)] ERROR: node binary not found via nvm" >> "$LOG"
    exit 1
fi

if [ -f "$APP_DIR/.env" ]; then
    set -a
    . "$APP_DIR/.env"
    set +a
fi

cd "$APP_DIR"

nohup "$NODE" server.js >> "$LOG" 2>&1 &
echo "[$(date)] Server started with PID $! using $NODE" >> "$LOG"
