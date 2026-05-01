// TCCFlow Notifications Manager
// Gerencia notificações push, notificações de tarefas, prazos, etc.

class NotificationsManager {
    constructor() {
        this.serviceWorkerPath = '/sw.js';
        this.notificationQueue = [];
        this.init();
    }

    async init() {
        // Registrar service worker se suportado
        if ('serviceWorker' in navigator && preferences.prefs.notificationsEnabled) {
            try {
                await navigator.serviceWorker.register(this.serviceWorkerPath).catch(() => {
                    console.log('Service Worker não disponível no diretório raiz, usando fallback');
                });
            } catch (error) {
                console.log('Service Worker registration skipped:', error);
            }
        }

        // Solicitar permissão se necessário
        if (preferences.prefs.notificationsEnabled && 'Notification' in window) {
            if (Notification.permission === 'default') {
                await preferences.requestNotificationPermission();
            }
        }

        // Ouvir mudanças nas preferências
        window.addEventListener('preferences:notificationsChanged', (e) => {
            if (e.detail && 'Notification' in window && Notification.permission === 'default') {
                preferences.requestNotificationPermission();
            }
        });

        // Processar fila de notificações
        this.processQueue();
    }

    notifyTaskDue(taskName, dueDate) {
        this.queueNotification(
            'Tarefa Próxima do Prazo',
            {
                body: `"${taskName}" vence em ${this.formatDate(dueDate)}`,
                icon: '/favicon.png',
                badge: '/favicon.png',
                tag: 'task-due-' + taskName,
                requireInteraction: false
            }
        );
    }

    notifyTaskOverdue(taskName, daysOverdue) {
        this.queueNotification(
            'Tarefa Atrasada',
            {
                body: `"${taskName}" está atrasada há ${daysOverdue} dias`,
                icon: '/favicon.png',
                badge: '/favicon.png',
                tag: 'task-overdue-' + taskName,
                requireInteraction: true
            }
        );
    }

    notifyDeadline(title, daysUntil) {
        this.queueNotification(
            'Prazo Aproximando',
            {
                body: `${title} em ${daysUntil} dias`,
                icon: '/favicon.png',
                badge: '/favicon.png',
                tag: 'deadline-' + title,
                requireInteraction: daysUntil <= 3
            }
        );
    }

    notifyTeamMember(memberName, action) {
        this.queueNotification(
            'Atualização da Equipe',
            {
                body: `${memberName} ${action}`,
                icon: '/favicon.png',
                badge: '/favicon.png',
                tag: 'team-' + memberName
            }
        );
    }

    notifyProjectUpdate(projectName, updateType) {
        this.queueNotification(
            'Atualização do Projeto',
            {
                body: `${projectName}: ${updateType}`,
                icon: '/favicon.png',
                badge: '/favicon.png',
                tag: 'project-' + projectName
            }
        );
    }

    notifyNewLogin(device, location) {
        this.queueNotification(
            'Novo Acesso à Conta',
            {
                body: `Login detectado em ${device} de ${location}`,
                icon: '/favicon.png',
                badge: '/favicon.png',
                tag: 'login-alert',
                requireInteraction: true
            }
        );
    }

    notifySecurityAlert(message) {
        this.queueNotification(
            'Alerta de Segurança',
            {
                body: message,
                icon: '/favicon.png',
                badge: '/favicon.png',
                tag: 'security-alert',
                requireInteraction: true
            }
        );
    }

    queueNotification(title, options) {
        this.notificationQueue.push({ title, options });
        this.processQueue();
    }

    processQueue() {
        while (this.notificationQueue.length > 0) {
            const { title, options } = this.notificationQueue.shift();
            this.send(title, options);
        }
    }

    send(title, options = {}) {
        if (preferences.prefs.notificationsEnabled) {
            preferences.sendNotification(title, options);
        }
    }

    requestPermission() {
        return preferences.requestNotificationPermission();
    }

    formatDate(date) {
        if (typeof date === 'string') {
            date = new Date(date);
        }
        const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return date.toLocaleDateString('pt-BR', options);
    }

    getDaysUntil(dueDate) {
        const now = new Date();
        const due = new Date(dueDate);
        const diffTime = due - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    scheduleNotification(callback, delayMs) {
        setTimeout(callback, delayMs);
    }

    // Verificar tarefas atrasadas e próximas
    checkTaskDeadlines() {
        try {
            const tasks = JSON.parse(localStorage.getItem('tccflow_tasks') || '[]');
            const now = new Date();

            tasks.forEach(task => {
                if (task.dueDate) {
                    const daysUntil = this.getDaysUntil(task.dueDate);

                    if (daysUntil < 0) {
                        const daysOverdue = Math.abs(daysUntil);
                        this.notifyTaskOverdue(task.name, daysOverdue);
                    } else if (daysUntil === 1) {
                        this.notifyTaskDue(task.name, task.dueDate);
                    } else if (daysUntil <= 3 && daysUntil > 0) {
                        this.notifyDeadline(task.name, daysUntil);
                    }
                }
            });
        } catch (error) {
            console.error('Erro ao verificar prazos:', error);
        }
    }

    // Inicia verificação periódica de prazos (a cada 1 hora)
    startPeriodicCheck() {
        setInterval(() => {
            this.checkTaskDeadlines();
        }, 60 * 60 * 1000);

        // Verificação inicial
        this.checkTaskDeadlines();
    }
}

// Inicializar notificações
const notificationsManager = new NotificationsManager();

// Iniciar verificação periódica quando autenticado
window.addEventListener('authenticated', () => {
    notificationsManager.startPeriodicCheck();
});
