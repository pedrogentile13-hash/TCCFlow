// TCCFlow Dark Mode - loads before render to avoid flash
(function() {
    if (localStorage.getItem('tccflow_darkmode') === 'true') {
        document.documentElement.classList.add('dark');
    }
})();
