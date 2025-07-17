document.addEventListener('DOMContentLoaded', function () {
    const right = document.querySelector('.right');
    if (!right || document.getElementById('alarm-popup-btn')) return;

    // Persistent state management
    const getState = (key, defaultVal = false) => {
        try {
            return JSON.parse(localStorage.getItem(key)) ?? defaultVal;
        } catch (e) {
            return defaultVal;
        }
    };

    const setState = (key, val) => {
        localStorage.setItem(key, JSON.stringify(val));
    };

    // Create toggle button function
    const createToggleBtn = ({id, iconOn, iconOff, colorOn, label, storageKey}) => {
        const btn = document.createElement('button');
        btn.id = id;
        btn.className = 'el-button el-button--default is-circle waves-effect';
        btn.style.marginRight = '6px';

        let state = getState(storageKey, false);

        const render = () => {
            btn.innerHTML = `<i class="fas ${state ? iconOn : iconOff}"></i>`;
            btn.style.color = state ? colorOn : '#ccc';
        };

        btn.setAttribute('title', label);
        btn.addEventListener('click', () => {
            state = !state;
            render();
            setState(storageKey, state);

            // Update global variables
            if (!window.vm) window.vm = {};
            if (id === 'alarm-popup-btn') window.vm.alarmPopup = state;
            if (id === 'alarm-audio-btn') window.vm.alarmAudio = state;
        });

        render();
        return btn;
    };

    // Create two icon buttons
    const popupBtn = createToggleBtn({
        id: 'alarm-popup-btn',
        iconOn: 'fa-bell',
        iconOff: 'fa-bell-slash',
        colorOn: '#f56c6c',
        label: 'Alarm Popup',
        storageKey: 'alarm_popup_state'
    });

    const audioBtn = createToggleBtn({
        id: 'alarm-audio-btn',
        iconOn: 'fa-volume-up',
        iconOff: 'fa-volume-mute',
        colorOn: '#67c23a',
        label: 'Voice Broadcast',
        storageKey: 'alarm_audio_state'
    });

    // Insert buttons (at the beginning)
    const firstBtn = right.querySelector('button');
    right.insertBefore(audioBtn, firstBtn);
    right.insertBefore(popupBtn, audioBtn);

    // Sync state variables to window.vm (also set values when page initially loads)
    if (!window.vm) window.vm = {};
    window.vm.alarmPopup = getState('alarm_popup_state', false);
    window.vm.alarmAudio = getState('alarm_audio_state', false);
});