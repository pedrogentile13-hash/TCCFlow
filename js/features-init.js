// ============================================================
// TCCFlow - Features Initialization
// Inicializa todas as funcionalidades do app
// ============================================================

console.log('[FEATURES] Iniciando sistema de funcionalidades...');

// ============= 1. DARK MODE =============
window.addEventListener('DOMContentLoaded', () => {
    console.log('[DARK MODE] Status:', window.ThemeManager?.isDark() ? 'ATIVADO' : 'DESATIVADO');
    console.log('[DARK MODE] Preferência salva:', localStorage.getItem('tccflow_theme'));
});

// ============= 2. ANIMAÇÕES =============
window.addEventListener('DOMContentLoaded', () => {
    const animEnabled = window.ThemeManager?.animationsEnabled();
    console.log('[ANIMAÇÕES] Status:', animEnabled ? 'ATIVADO' : 'DESATIVADO');
    console.log('[ANIMAÇÕES] Preferência salva:', localStorage.getItem('tccflow_animations'));
});

// ============= 3. NOTIFICAÇÕES =============
window.addEventListener('DOMContentLoaded', async () => {
    if (window.NotificationManager) {
        const isSupported = window.NotificationManager.isSupported;
        const isEnabled = window.NotificationManager.isEnabled;
        const permission = localStorage.getItem('tccflow_notif_permission');

        console.log('[NOTIFICAÇÕES] Suportado:', isSupported ? 'SIM' : 'NÃO');
        console.log('[NOTIFICAÇÕES] Status:', isEnabled ? 'ATIVADO' : 'DESATIVADO');
        console.log('[NOTIFICAÇÕES] Permissão:', permission || 'NÃO DEFINIDA');

        if (isSupported && !isEnabled && permission === 'granted') {
            console.log('[NOTIFICAÇÕES] Inicializando...');
            await window.NotificationManager.init();
        }
    }
});

// ============= 4. FOTO DE PERFIL =============
window.addEventListener('DOMContentLoaded', () => {
    const avatar = document.getElementById('navAvatar') || document.getElementById('avatarImg');
    if (avatar && avatar.src) {
        console.log('[FOTO DE PERFIL] Ativado - Foto carregada');
    } else {
        console.log('[FOTO DE PERFIL] Ativado - Usando avatar padrão');
    }
});

// ============= 5. SEGURANÇA =============
window.addEventListener('DOMContentLoaded', () => {
    const securitySection = document.querySelector('[id*="Security"]') ||
                           document.getElementById('lastLoginTime');
    if (securitySection) {
        console.log('[SEGURANÇA] Aba de segurança ativada');
        console.log('[SEGURANÇA] Último login:', localStorage.getItem('tccflow_last_login') || 'Não registrado');
    }
});

// ============= LISTENERS GLOBAIS =============
window.addEventListener('themechange', (e) => {
    console.log('[DARK MODE] Mudança detectada:', e.detail.isDark ? 'ESCURO' : 'CLARO');
});

window.addEventListener('animationschange', (e) => {
    console.log('[ANIMAÇÕES] Mudança detectada:', e.detail.enabled ? 'ATIVADO' : 'DESATIVADO');
});

console.log('[FEATURES] ✅ Sistema de funcionalidades inicializado');
