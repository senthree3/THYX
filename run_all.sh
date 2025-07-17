#!/bin/bash

# 获取当前脚本实际目录，跟随软链接
BASE_DIR=$(readlink -f "$(dirname "$0")")

echo "[Run] Working directory: $BASE_DIR"

# 虚拟环境路径
VENV_DIR="$BASE_DIR/venv"
PYTHON="$VENV_DIR/bin/python"
DAPHNE="$VENV_DIR/bin/daphne"

# 确保虚拟环境已存在
if [ ! -x "$DAPHNE" ]; then
    echo "[Error] Virtual environment not found or incomplete at $VENV_DIR"
    exit 1
fi

echo "[Run] Starting Daphne..."
cd "$BASE_DIR"
setsid "$DAPHNE" -b 127.0.0.1 -p 9780 ai_box.asgi:application > /dev/null 2>&1 &

sleep 2

echo "[Run] Starting Nginx..."
sudo "$BASE_DIR/server/nginx" -p "$BASE_DIR" -c "$BASE_DIR/server/conf/nginx.conf"

echo "[Run] All services started."

