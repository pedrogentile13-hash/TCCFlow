/* TCCFlow — Font Switcher (shared across all pages) */
(function () {
  const FONTS = {
    geist: {
      label: "Geist",
      url: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap",
      body: '"Geist", -apple-system, BlinkMacSystemFont, sans-serif',
    },
    inter: {
      label: "Inter",
      url: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap",
      body: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    },
    lato: {
      label: "Lato",
      url: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Lato:wght@300;400;700;900&family=JetBrains+Mono:wght@400;500;600&display=swap",
      body: '"Lato", -apple-system, BlinkMacSystemFont, sans-serif',
    },
  };

  function applyFont(key) {
    const f = FONTS[key] || FONTS.geist;
    // Update or inject link tag
    let link = document.getElementById("tcc-font-link");
    if (!link) {
      link = document.createElement("link");
      link.id = "tcc-font-link";
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    link.href = f.url;
    document.documentElement.style.setProperty("--font-body", f.body);
    localStorage.setItem("tccflow_font", key);
    // Broadcast to other components
    window.dispatchEvent(new CustomEvent("tccflow-font-changed", { detail: key }));
  }

  // Apply on load
  const saved = localStorage.getItem("tccflow_font") || "geist";
  // Run after DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => applyFont(saved));
  } else {
    applyFont(saved);
  }

  // Expose globally
  window.TCCFont = { apply: applyFont, fonts: FONTS, current: () => localStorage.getItem("tccflow_font") || "geist" };
})();
