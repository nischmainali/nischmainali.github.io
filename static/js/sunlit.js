// Sunlit theme - follows system preference, with manual override
(function() {
  var STORAGE_KEY = 'sunlit-theme';

  // SVG icons
  var sunIcon = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>';
  var moonIcon = '<svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';

  function getSystemPreference() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function getStoredPreference() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function setStoredPreference(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {
      // Ignore storage failures (private mode / blocked storage)
    }
  }

  function applyTheme(theme, animate) {
    var isDark = theme === 'dark';
    var wasDark = document.body.classList.contains('dark');

    if (isDark !== wasDark) {
      if (animate) {
        document.body.classList.add('animation-ready');
        void document.body.offsetWidth;
      }

      document.body.classList.toggle('dark', isDark);

      if (animate) {
        setTimeout(function() {
          document.body.classList.remove('animation-ready');
        }, 2000);
      }
    }

    updateToggleButton();
  }

  function toggleTheme() {
    var currentTheme = document.body.classList.contains('dark') ? 'dark' : 'light';
    var newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setStoredPreference(newTheme);
    applyTheme(newTheme, true);
  }

  function updateToggleButton() {
    var btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.innerHTML = '<span class="sun">' + sunIcon + '</span><span class="moon">' + moonIcon + '</span>';
      btn.setAttribute('aria-label', document.body.classList.contains('dark') ? 'Switch to light mode' : 'Switch to dark mode');
    }
  }

  function createToggleButton() {
    if (document.getElementById('theme-toggle')) {
      return;
    }
    var btn = document.createElement('button');
    btn.id = 'theme-toggle';
    btn.setAttribute('aria-label', 'Toggle theme');
    btn.innerHTML = '<span class="sun">' + sunIcon + '</span><span class="moon">' + moonIcon + '</span>';
    btn.addEventListener('click', toggleTheme);
    document.body.appendChild(btn);
  }

  function init() {
    // Determine initial theme: stored preference > system preference
    var stored = getStoredPreference();
    var system = getSystemPreference();
    var theme = stored || system;

    applyTheme(theme, false);
    createToggleButton();

    // Listen for system preference changes
    var mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    var onChange = function(e) {
      // Only auto-switch if user hasn't set a manual preference
      if (!getStoredPreference()) {
        applyTheme(e.matches ? 'dark' : 'light', true);
      }
    };

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', onChange);
    } else if (typeof mediaQuery.addListener === 'function') {
      mediaQuery.addListener(onChange);
    }
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
