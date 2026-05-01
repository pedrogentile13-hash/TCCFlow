// ============================================================
// TCCFlow - Push Notifications Manager
// Handles browser push notifications for mobile and desktop
// ============================================================

window.NotificationManager = {
    isSupported: 'serviceWorker' in navigator && 'Notification' in window,
    isEnabled: false,
    subscription: null,

    async init() {
        if (!this.isSupported) {
            console.log('[NOTIFICATIONS] Not supported on this browser');
            return false;
        }

        const permission = localStorage.getItem('tccflow_notif_permission');
        if (permission === 'denied') {
            console.log('[NOTIFICATIONS] User previously denied permission');
            return false;
        }

        if (permission === 'granted') {
            this.isEnabled = true;
            await this.registerServiceWorker();
            return true;
        }

        return false;
    },

    async requestPermission() {
        if (!this.isSupported) {
            alert('Seu navegador não suporta notificações');
            return false;
        }

        try {
            const permission = await Notification.requestPermission();
            localStorage.setItem('tccflow_notif_permission', permission);

            if (permission === 'granted') {
                this.isEnabled = true;
                await this.registerServiceWorker();
                this.notify('Notificações ativadas!', {
                    body: 'Você receberá atualizações importantes do TCCFlow',
                    icon: '../favicon.png'
                });
                return true;
            }
            return false;
        } catch (err) {
            console.error('[NOTIFICATIONS] Permission request failed:', err);
            return false;
        }
    },

    async registerServiceWorker() {
        try {
            if (!('serviceWorker' in navigator)) return;

            const registration = await navigator.serviceWorker.register('../sw.js', {
                scope: '/'
            });

            console.log('[NOTIFICATIONS] Service Worker registered:', registration);

            // Listen for push messages
            if (registration.scope) {
                registration.pushManager.getSubscription().then(sub => {
                    if (sub) {
                        this.subscription = sub;
                        console.log('[NOTIFICATIONS] Already subscribed');
                    }
                });
            }
        } catch (err) {
            console.error('[NOTIFICATIONS] Service Worker registration failed:', err);
        }
    },

    async subscribe(vapidPublicKey) {
        if (!this.isEnabled || !navigator.serviceWorker.controller) {
            console.log('[NOTIFICATIONS] Cannot subscribe without permission or SW');
            return null;
        }

        try {
            const registration = await navigator.serviceWorker.ready;

            // Try to get existing subscription first
            let subscription = await registration.pushManager.getSubscription();
            if (subscription) {
                this.subscription = subscription;
                return subscription;
            }

            // Create new subscription (VAPID key needed for real push notifications)
            if (vapidPublicKey) {
                subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
                });
                this.subscription = subscription;
                console.log('[NOTIFICATIONS] Subscribed to push notifications');
                return subscription;
            }
        } catch (err) {
            console.error('[NOTIFICATIONS] Subscription failed:', err);
        }

        return null;
    },

    async unsubscribe() {
        try {
            if (this.subscription) {
                await this.subscription.unsubscribe();
                this.subscription = null;
                this.isEnabled = false;
                localStorage.setItem('tccflow_notif_permission', 'denied');
                console.log('[NOTIFICATIONS] Unsubscribed');
                return true;
            }
        } catch (err) {
            console.error('[NOTIFICATIONS] Unsubscribe failed:', err);
        }
        return false;
    },

    notify(title, options = {}) {
        if (!this.isEnabled || !this.isSupported) return;

        try {
            const notification = new Notification(title, {
                icon: options.icon || '../favicon.png',
                badge: options.badge || '../favicon.png',
                tag: options.tag || 'tccflow-notification',
                requireInteraction: options.requireInteraction || false,
                ...options
            });

            if (options.onClick) {
                notification.onclick = () => {
                    window.focus();
                    options.onClick();
                    notification.close();
                };
            }

            return notification;
        } catch (err) {
            console.error('[NOTIFICATIONS] Failed to show notification:', err);
        }
    },

    // Task notifications
    notifyTaskAssigned(taskTitle, assignedBy) {
        this.notify('Nova Tarefa Atribuída', {
            body: `${assignedBy} lhe atribuiu: ${taskTitle}`,
            icon: '../icons/task.svg',
            tag: 'task-' + Date.now()
        });
    },

    notifyTaskCompleted(taskTitle) {
        this.notify('Tarefa Completada!', {
            body: `Parabéns! Você completou: ${taskTitle}`,
            icon: '../icons/task.svg',
            tag: 'task-complete-' + Date.now()
        });
    },

    notifyDeadlineApproaching(taskTitle, daysLeft) {
        this.notify('Prazo se Aproximando', {
            body: `${taskTitle} vence em ${daysLeft} dia(s)`,
            icon: '../icons/calendar.svg',
            tag: 'deadline-' + Date.now(),
            requireInteraction: true
        });
    },

    // Team notifications
    notifyTeamMemberJoined(memberName) {
        this.notify('Novo Membro na Equipe', {
            body: `${memberName} entrou no projeto`,
            icon: '../icons/team.svg',
            tag: 'team-' + Date.now()
        });
    },

    // Message notifications
    notifyNewMessage(senderName, message) {
        const preview = message.substring(0, 50) + (message.length > 50 ? '...' : '');
        this.notify(`Mensagem de ${senderName}`, {
            body: preview,
            icon: '../icons/message.svg',
            tag: 'message-' + Date.now()
        });
    },

    // Meeting notifications
    notifyMeetingReminder(meetingTitle, minutesUntil) {
        this.notify('Reunião em Breve', {
            body: `${meetingTitle} começa em ${minutesUntil} minutos`,
            icon: '../icons/meeting.svg',
            tag: 'meeting-' + Date.now(),
            requireInteraction: false
        });
    },

    // Deadline notifications
    notifyDeadlineToday(itemName) {
        this.notify('Prazo Hoje!', {
            body: `${itemName} vence hoje!`,
            icon: '../icons/deadline.svg',
            tag: 'deadline-today-' + Date.now(),
            requireInteraction: true
        });
    },

    // Helper to convert VAPID key
    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }

        return outputArray;
    }
};

// Auto-initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    await window.NotificationManager.init();
});
