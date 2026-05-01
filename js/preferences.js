// TCCFlow Preferences Manager
// Gerencia dark mode, animações, foto de perfil, notificações, etc.

class PreferencesManager {
    constructor() {
        this.storagePrefix = 'tccflow_prefs_';
        this.init();
    }

    init() {
        this.loadPreferences();
        this.applyPreferences();
        this.setupListeners();
    }

    loadPreferences() {
        this.prefs = {
            darkMode: localStorage.getItem(this.storagePrefix + 'darkMode') === 'true',
            animationsEnabled: localStorage.getItem(this.storagePrefix + 'animationsEnabled') !== 'false',
            profilePhoto: localStorage.getItem(this.storagePrefix + 'profilePhoto') || null,
            notificationsEnabled: localStorage.getItem(this.storagePrefix + 'notificationsEnabled') === 'true',
            notificationSound: localStorage.getItem(this.storagePrefix + 'notificationSound') !== 'false',
            twoFactorEnabled: localStorage.getItem(this.storagePrefix + 'twoFactorEnabled') === 'true',
            sessionTimeout: parseInt(localStorage.getItem(this.storagePrefix + 'sessionTimeout') || '30'),
            loginAlerts: localStorage.getItem(this.storagePrefix + 'loginAlerts') !== 'false'
        };
    }

    applyPreferences() {
        if (this.prefs.darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        if (!this.prefs.animationsEnabled) {
            document.documentElement.classList.add('no-animations');
        } else {
            document.documentElement.classList.remove('no-animations');
        }
    }

    setupListeners() {
        window.addEventListener('storage', (e) => {
            if (e.key && e.key.startsWith(this.storagePrefix)) {
                this.loadPreferences();
                this.applyPreferences();
            }
        });
    }

    setDarkMode(enabled) {
        this.prefs.darkMode = enabled;
        localStorage.setItem(this.storagePrefix + 'darkMode', enabled.toString());
        this.applyPreferences();
        this.dispatchEvent('darkModeChanged', enabled);
    }

    toggleDarkMode() {
        this.setDarkMode(!this.prefs.darkMode);
    }

    setAnimationsEnabled(enabled) {
        this.prefs.animationsEnabled = enabled;
        localStorage.setItem(this.storagePrefix + 'animationsEnabled', enabled.toString());
        this.applyPreferences();
        this.dispatchEvent('animationsChanged', enabled);
    }

    toggleAnimations() {
        this.setAnimationsEnabled(!this.prefs.animationsEnabled);
    }

    setProfilePhoto(photoData) {
        this.prefs.profilePhoto = photoData;
        if (photoData) {
            localStorage.setItem(this.storagePrefix + 'profilePhoto', photoData);
        } else {
            localStorage.removeItem(this.storagePrefix + 'profilePhoto');
        }
        this.dispatchEvent('profilePhotoChanged', photoData);
    }

    getProfilePhoto() {
        return this.prefs.profilePhoto;
    }

    setNotificationsEnabled(enabled) {
        this.prefs.notificationsEnabled = enabled;
        localStorage.setItem(this.storagePrefix + 'notificationsEnabled', enabled.toString());
        this.dispatchEvent('notificationsChanged', enabled);

        if (enabled && 'Notification' in window && Notification.permission === 'default') {
            this.requestNotificationPermission();
        }
    }

    async requestNotificationPermission() {
        if (!('Notification' in window)) {
            console.log('Este navegador não suporta notificações');
            return false;
        }

        if (Notification.permission === 'granted') {
            return true;
        }

        if (Notification.permission !== 'denied') {
            try {
                const permission = await Notification.requestPermission();
                return permission === 'granted';
            } catch (error) {
                console.error('Erro ao solicitar permissão de notificação:', error);
                return false;
            }
        }

        return false;
    }

    sendNotification(title, options = {}) {
        if (this.prefs.notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification(title, {
                icon: '/favicon.png',
                badge: '/favicon.png',
                ...options
            });

            if (this.prefs.notificationSound) {
                this.playNotificationSound();
            }

            return notification;
        }
    }

    playNotificationSound() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gain.gain.setValueAtTime(0.3, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    }

    setTwoFactorEnabled(enabled) {
        this.prefs.twoFactorEnabled = enabled;
        localStorage.setItem(this.storagePrefix + 'twoFactorEnabled', enabled.toString());
        this.dispatchEvent('twoFactorChanged', enabled);
    }

    setSessionTimeout(minutes) {
        this.prefs.sessionTimeout = minutes;
        localStorage.setItem(this.storagePrefix + 'sessionTimeout', minutes.toString());
        this.dispatchEvent('sessionTimeoutChanged', minutes);
    }

    setLoginAlerts(enabled) {
        this.prefs.loginAlerts = enabled;
        localStorage.setItem(this.storagePrefix + 'loginAlerts', enabled.toString());
        this.dispatchEvent('loginAlertsChanged', enabled);
    }

    dispatchEvent(eventName, detail) {
        const event = new CustomEvent('preferences:' + eventName, { detail });
        window.dispatchEvent(event);
    }

    getPreference(key) {
        return this.prefs[key];
    }

    getAllPreferences() {
        return { ...this.prefs };
    }

    reset() {
        for (const key in this.prefs) {
            localStorage.removeItem(this.storagePrefix + key);
        }
        this.loadPreferences();
        this.applyPreferences();
    }
}

// Initialize preferences manager
const preferences = new PreferencesManager();

// Legacy support for old darkmode.js code
window.addEventListener('DOMContentLoaded', () => {
    const darkToggle = document.getElementById('darkModeToggle');
    if (darkToggle) {
        darkToggle.checked = preferences.prefs.darkMode;
        darkToggle.addEventListener('change', function() {
            preferences.setDarkMode(this.checked);
        });
    }

    window.addEventListener('preferences:darkModeChanged', (e) => {
        const darkToggle = document.getElementById('darkModeToggle');
        if (darkToggle) {
            darkToggle.checked = e.detail;
        }
    });
});
