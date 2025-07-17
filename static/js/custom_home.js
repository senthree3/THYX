document.addEventListener('DOMContentLoaded', () => {
    const localTimeSpan = document.getElementById('local-time');

    function updateTime() {
        const now = new Date();
        localTimeSpan.textContent = now.toLocaleString();
    }

    setInterval(updateTime, 1000); // Update time every second
    updateTime(); // Initial call to set the time immediately
});

// API基础路径
const API_BASE_URL = '/aibbox/v1';

// 通用的API请求处理函数
function handleApiResponse(response) {
    return response.json().then(data => {
        if (data.code === 200) {
            return {
                success: true,
                message: data.data || data.message || '操作成功'
            };
        } else {
            return {
                success: false,
                message: data.data || data.message || '操作失败'
            };
        }
    });
}

// 显示消息的函数
function showMessage(message, isSuccess = true) {
    alert(message);
    // 如果需要更好的用户体验，可以替换为toast或其他提示方式
}

// 合并后的上传授权函数（同时处理更新授权和上传授权）
function uploadAuth() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.BOX';
    input.onchange = () => {
        const file = input.files[0];
        if (!file) {
            return;
        }

        const formData = new FormData();
        formData.append('license', file);

        fetch(`${API_BASE_URL}/api/upload-auth/`, {
            method: 'POST',
            body: formData
        })
            .then(handleApiResponse)
            .then(result => {
                showMessage(result.message, result.success);
                if (result.success) {
                    // 上传成功后刷新页面以更新授权状态
                    setTimeout(() => location.reload(), 1000);
                }
            })
            .catch(error => {
                console.error('上传授权失败:', error);
                showMessage('上传授权失败，请检查网络连接', false);
            });
    };
    input.click();
}

// 删除原来的updateAuth函数，现在统一使用uploadAuth函数

function updateKey() {
    fetch(`${API_BASE_URL}/api/update-key/`, {method: 'POST'})
        .then(handleApiResponse)
        .then(result => {
            showMessage(result.message, result.success);
        })
        .catch(error => {
            console.error('更新密钥失败:', error);
            showMessage('更新密钥失败，请检查网络连接', false);
        });
}

function downloadKey() {
    const downloadUrl = `${API_BASE_URL}/api/download-key/`;

    fetch(downloadUrl)
        .then(async response => {
            // 如果不是200，说明后端返回了错误
            if (response.status !== 200) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch (e) {
                    // 响应不是JSON格式的情况
                    throw new Error('下载失败');
                }
                throw new Error(errorData.data || errorData.message || '下载失败');
            }

            // 成功获取文件流
            return response.blob();
        })
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'KEY.BOX';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        })
        .catch(error => {
            console.error('下载密钥失败:', error);
            showMessage('下载密钥失败：' + error.message, false);
        });
}


function restartService() {
    if (!confirm('确定要重启服务吗？这可能会暂时中断服务。')) {
        return;
    }

    fetch(`${API_BASE_URL}/api/restart-service/`, {method: 'POST'})
        .then(handleApiResponse)
        .then(result => {
            showMessage(result.message, result.success);
            if (result.success) {
                // 服务重启后可能需要等待一段时间
                showMessage('服务正在重启，请稍后刷新页面', true);
            }
        })
        .catch(error => {
            console.error('重启服务失败:', error);
            showMessage('重启服务失败，请检查网络连接', false);
        });
}

function restartDevice() {
    if (!confirm('确定要重启设备吗？这将会断开所有连接！')) {
        return;
    }

    // 二次确认
    if (!confirm('设备重启后需要手动重新连接，确定继续吗？')) {
        return;
    }

    fetch(`${API_BASE_URL}/api/restart-device/`, {method: 'POST'})
        .then(handleApiResponse)
        .then(result => {
            showMessage(result.message, result.success);
            if (result.success) {
                showMessage('设备将在几秒后重启，请注意重新连接', true);
            }
        })
        .catch(error => {
            console.error('重启设备失败:', error);
            showMessage('重启设备失败，请检查网络连接', false);
        });
}

function syncTime() {
    const now = new Date();

    // 直接发送本地时间字符串 YYYY-MM-DD HH:MM:SS 格式
    const localTimeString = now.getFullYear() + '-' +
        String(now.getMonth() + 1).padStart(2, '0') + '-' +
        String(now.getDate()).padStart(2, '0') + ' ' +
        String(now.getHours()).padStart(2, '0') + ':' +
        String(now.getMinutes()).padStart(2, '0') + ':' +
        String(now.getSeconds()).padStart(2, '0');

    fetch(`${API_BASE_URL}/api/sync-time/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({time: localTimeString})
    })
        .then(handleApiResponse)
        .then(result => {
            showMessage(result.message, result.success);
            if (result.success) {
                // 时间同步成功后可以更新显示的时间
                updateTime();
            }
        })
        .catch(error => {
            console.error('同步时间失败:', error);
            showMessage('同步时间失败，请检查网络连接', false);
        });
}

// 更新时间显示的函数（供同步时间后调用）
function updateTime() {
    const localTimeSpan = document.getElementById('local-time');
    if (localTimeSpan) {
        const now = new Date();
        localTimeSpan.textContent = now.toLocaleString();
    }
}