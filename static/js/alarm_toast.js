document.addEventListener('DOMContentLoaded', function () {
    // 告警队列和控制器
    const alarmQueue = [];
    let isProcessingQueue = false;
    const audioCache = new Map(); // 音频文件缓存
    let maxVisibleAlarms = 3; // 最大同时显示的告警数
    let currentVisibleAlarms = 0;

    const socket = new WebSocket(`ws://${window.location.host}/ws/alarms/`);

    socket.onmessage = function (event) {
        try {
            const data = JSON.parse(event.data);
            const alarm = data.alarm;
            const image = data.image;
            const audio = data.audio;

            // 加入告警队列
            alarmQueue.push({ alarm, image, audio });

            // 处理队列
            if (!isProcessingQueue) {
                processAlarmQueue();
            }
        } catch (e) {
            console.error("WebSocket message handling error:", e);
        }
    };

    // 处理告警队列
    function processAlarmQueue() {
        if (alarmQueue.length === 0) {
            isProcessingQueue = false;
            return;
        }

        isProcessingQueue = true;

        // 检查是否可以显示更多告警
        if (currentVisibleAlarms < maxVisibleAlarms) {
            const alarmData = alarmQueue.shift();

            // 弹窗展示
            if (window.vm?.alarmPopup !== false) {
                showAlarmToast(alarmData.alarm, alarmData.image);
            }

            // 播放语音
            if (window.vm?.alarmAudio !== false && alarmData.audio) {
                playAudio(alarmData.audio);
            }

            // 继续处理队列中的下一个告警
            setTimeout(processAlarmQueue, 300);
        } else {
            // 如果当前显示的告警已达上限，等待一段时间后再次尝试
            setTimeout(processAlarmQueue, 1000);
        }
    }

    function showAlarmToast(alarmText, imageUrl) {
        currentVisibleAlarms++;

        const uniqueId = 'alarm-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
        const toast = document.createElement('div');
        toast.id = uniqueId;
        toast.className = 'alarm-toast';

        // 创建关闭按钮
        const closeButton = `<div class="alarm-close-btn">&times;</div>`;

        toast.innerHTML = `
            <div class="alarm-toast-content">
                <div class="alarm-image-container">
                    <img src="${new URL(imageUrl, window.location.origin)}" alt="Alarm Image" />
                </div>
                <div class="alarm-text-container">
                    <div class="alarm-title">告警提醒</div>
                    <div class="alarm-message">${alarmText}</div>
                </div>
                ${closeButton}
            </div>
        `;

        // 为已有的toast调整位置
        const existingToasts = document.querySelectorAll('.alarm-toast');
        const topOffset = 20 + (existingToasts.length * 10);
        toast.style.top = `${topOffset}px`;

        document.body.appendChild(toast);

        // 添加关闭按钮事件
        const closeBtn = toast.querySelector('.alarm-close-btn');
        closeBtn.addEventListener('click', () => {
            removeToast(toast);
        });

        // 自动关闭定时器
        setTimeout(() => {
            removeToast(toast);
        }, 8000);
    }

    function removeToast(toast) {
        toast.classList.add('hide');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
                currentVisibleAlarms--;
                // 重新定位剩余的告警
                repositionToasts();
            }
        }, 500);
    }

    function repositionToasts() {
        const toasts = document.querySelectorAll('.alarm-toast');
        toasts.forEach((toast, index) => {
            const topOffset = 20 + (index * 10);
            toast.style.top = `${topOffset}px`;
        });
    }

    function playAudio(audioUrl) {
        try {
            // 检查缓存中是否已有该音频
            if (audioCache.has(audioUrl)) {
                const audio = audioCache.get(audioUrl);
                // 重置音频并播放
                audio.currentTime = 0;
                audio.play().catch(e => {
                    console.warn("Cached audio playback failed:", e);
                });
            } else {
                // 如果缓存中没有，创建新的音频对象并缓存
                const audio = new Audio(new URL(audioUrl, window.location.origin));
                audio.addEventListener('canplaythrough', () => {
                    // 音频加载完成后才缓存
                    audioCache.set(audioUrl, audio);
                    audio.play().catch(e => {
                        console.warn("New audio playback failed:", e);
                    });
                });

                // 设置加载超时
                setTimeout(() => {
                    if (!audioCache.has(audioUrl)) {
                        console.warn("Audio loading timeout:", audioUrl);
                    }
                }, 5000);
            }
        } catch (e) {
            console.error("Audio handling error:", e);
        }
    }

    // 清理过大的音频缓存
    function cleanAudioCache() {
        if (audioCache.size > 20) { // 限制缓存大小
            const keysToDelete = Array.from(audioCache.keys()).slice(0, 5);
            keysToDelete.forEach(key => audioCache.delete(key));
        }
    }

    // 定期清理音频缓存
    setInterval(cleanAudioCache, 60000);
});