/* site-init.js — runs before paint to set the color theme and avoid a flash.
   Loaded synchronously in <head>. Keep this tiny. */
(function () {
  try {
    document.documentElement.classList.remove('no-js');
    document.documentElement.classList.add('js');
    var stored = null;
    try { stored = localStorage.getItem('verachi-theme'); } catch (e) {}
    var prefersDark =
      window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = stored || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();
