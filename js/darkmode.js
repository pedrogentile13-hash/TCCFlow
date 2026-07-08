// TCCFlow Dark Mode - loads before render to avoid flash
(function() {
    var STORAGE_KEY = 'tccflow_darkmode';

    function applyDark() {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
    }

    function removeDark() {
        document.documentElement.classList.remove('dark');
        document.documentElement.removeAttribute('data-theme');
    }

    function isEnabled() {
        return localStorage.getItem(STORAGE_KEY) === 'true';
    }

    function dispatch(enabled) {
        window.dispatchEvent(new CustomEvent('tccflow-dark-changed', { detail: { enabled: enabled } }));
    }

    // Apply immediately (before render) based on stored preference
    if (isEnabled()) {
        applyDark();
    }

    // Apply animations preference globally
    if (localStorage.getItem('tccflow_animations') === 'false') {
        document.documentElement.classList.add('no-animations');
    }

    // Expose global API
    window.TCCDark = {
        enable: function() {
            localStorage.setItem(STORAGE_KEY, 'true');
            applyDark();
            dispatch(true);
        },
        disable: function() {
            localStorage.setItem(STORAGE_KEY, 'false');
            removeDark();
            dispatch(false);
        },
        toggle: function() {
            if (isEnabled()) {
                window.TCCDark.disable();
            } else {
                window.TCCDark.enable();
            }
        },
        isEnabled: isEnabled
    };
})();
