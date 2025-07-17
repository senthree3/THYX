#!/bin/bash

echo "🔍 正在查找并安装当前目录下的所有 .deb 包..."

# 避免出现未满足依赖时的安装失败
sudo dpkg -i *.deb

# 检查并自动修复依赖问题（如果有）
echo "🔧 检查并修复缺失依赖..."
sudo apt-get install -f -y

# 再次尝试安装一遍，确保完全安装
sudo dpkg -i *.deb

# 验证 Mosquitto 是否安装成功
if systemctl list-units --type=service | grep -q mosquitto; then
    echo "✅ Mosquitto 服务已成功安装。"
    echo "▶️ 尝试启动 mosquitto..."
    sudo systemctl enable mosquitto
    sudo systemctl start mosquitto
    sudo systemctl status mosquitto --no-pager
else
    echo "❌ Mosquitto 安装失败，请检查依赖或包版本。"
fi

