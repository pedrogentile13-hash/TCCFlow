// ============================================================
// TCCFlow - Theme & Settings Manager
// Handles dark mode, animations, and other user preferences
// ============================================================

(function() {
    // Load theme immediately to avoid flash
    const savedTheme = localStorage.getItem('tccflow_theme') || 'light';
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
    }

    // Load animation preferences
    const animationsEnabled = localStorage.getItem('tccflow_animations') !== 'false';
    if (!animationsEnabled) {
        document.documentElement.classList.add('no-animations');
    }
})();

// Global theme manager
window.ThemeManager = {
    isDark() {
        return document.documentElement.classList.contains('dark');
    },

    setDark(isDark) {
        if (isDark) {
            document.documentElement.classList.add('dark');
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('tccflow_theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('tccflow_theme', 'light');
        }
        // Notify all listeners
        window.dispatchEvent(new CustomEvent('themechange', { detail: { isDark } }));
    },

    toggle() {
        this.setDark(!this.isDark());
    },

    animationsEnabled() {
        return !document.documentElement.classList.contains('no-animations');
    },

    setAnimations(enabled) {
        if (enabled) {
            document.documentElement.classList.remove('no-animations');
            localStorage.setItem('tccflow_animations', 'true');
        } else {
            document.documentElement.classList.add('no-animations');
            localStorage.setItem('tccflow_animations', 'false');
        }
        window.dispatchEvent(new CustomEvent('animationschange', { detail: { enabled } }));
    }
};
