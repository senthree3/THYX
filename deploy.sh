#!/bin/bash

# 获取当前脚本所在的目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 检查 mosquitto 是否已安装
if ! command -v mosquitto >/dev/null 2>&1; then
    echo "📦 Mosquitto 未检测到，开始离线安装..."

    # 执行 install_mosquitto.sh
    if [ -x "$SCRIPT_DIR/mosquitto-offline/install_mosquitto.sh" ]; then
        cd "$SCRIPT_DIR/mosquitto-offline"
        ./install_mosquitto.sh
    else
        echo "❌ 找不到 install_mosquitto.sh 或没有执行权限"
        exit 1
    fi
else
    echo "✅ Mosquitto 已安装，跳过安装步骤。"
fi

# 停止并禁用旧服务
systemctl stop SophonSystem.service >/dev/null 2>&1
systemctl disable SophonSystem.service >/dev/null 2>&1
systemctl stop nginx >/dev/null 2>&1
systemctl disable nginx >/dev/null 2>&1

SOURCE_DIR="$SCRIPT_DIR"
TARGET_DIR="/opt/ai_box"

echo "📂 Installing AI Box via symlink..."

# 删除旧目录
sudo rm -rf "$TARGET_DIR"

# 建立软连接
sudo ln -s "$SOURCE_DIR" "$TARGET_DIR"

echo "🛠️  Creating systemd service..."

# 写 systemd 服务文件
sudo tee /etc/systemd/system/ai_box.service > /dev/null <<EOF
[Unit]
Description=AI Box Service
After=network.target

[Service]
Type=forking
ExecStart=$TARGET_DIR/run_all.sh
ExecStop=$TARGET_DIR/stop_all.sh
Restart=always
User=root
WorkingDirectory=$TARGET_DIR

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable ai_box

echo "✅ Installation complete!"
echo "You can now use:"
echo "  sudo systemctl start ai_box"
echo "  sudo systemctl stop ai_box"
echo "  sudo systemctl restart ai_box"

