// Inlined at the top of every built page by vite.config.ts. GitHub Pages caches HTML for 10 minutes and each
// deploy deletes the previous build's hashed files, so a visitor holding the old HTML asks for /assets/ files
// that are gone. If one fails, load the page once more under a fresh URL (which skips the cache), then tidy
// the URL back. The sessionStorage flag stops it from looping if the files are really missing.
(() => {
  const url = new URL(location.href);
  if (url.searchParams.has('fresh')) { url.searchParams.delete('fresh'); history.replaceState(history.state, '', url); }
  addEventListener('error', e => {
    const t = e.target;
    if (!(t instanceof HTMLScriptElement || t instanceof HTMLLinkElement) || !/\/assets\//.test(t.src || t.href)) return;
    try { if (sessionStorage.getItem('fresh-reload')) return; sessionStorage.setItem('fresh-reload', '1'); } catch { return; }
    const next = new URL(location.href); next.searchParams.set('fresh', Date.now()); location.replace(next);
  }, true);
  addEventListener('load', () => setTimeout(() => { try { sessionStorage.removeItem('fresh-reload'); } catch {} }, 5000));
})();
