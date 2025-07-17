#!/bin/bash

BASE_DIR=$(readlink -f "$(dirname "$0")")

echo "[Restart] Working directory: $BASE_DIR"

$BASE_DIR/stop_all.sh
sleep 2
$BASE_DIR/run_all.sh
