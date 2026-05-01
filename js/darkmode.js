// TCCFlow Dark Mode - loads before render to avoid flash
(function() {
    const darkMode = localStorage.getItem('tccflow_prefs_darkMode') === 'true';
    const animationsEnabled = localStorage.getItem('tccflow_prefs_animationsEnabled') !== 'false';

    if (darkMode) {
        document.documentElement.classList.add('dark');
    }

    if (!animationsEnabled) {
        document.documentElement.classList.add('no-animations');
    }
})();
