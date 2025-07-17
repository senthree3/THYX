#!/bin/bash

BASE_DIR=$(readlink -f "$(dirname "$0")")

echo "[Stop] Working directory: $BASE_DIR"

echo "[Stop] Stopping Daphne..."
ps aux | grep "daphne -b 127.0.0.1 -p 9780" | grep -v grep | awk '{print $2}' | xargs -r kill -9

echo "[Stop] Stopping Nginx..."
sudo "$BASE_DIR/server/nginx" -p "$BASE_DIR" -c "$BASE_DIR/server/conf/nginx.conf" -s stop

echo "[Stop] All services stopped."
