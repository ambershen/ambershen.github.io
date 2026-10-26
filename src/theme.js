// Light/dark switch. The inline script in each page's <head> applies the saved
// theme before first paint; this module adds the toggle and keeps open pages
// (including the case-study iframe) in sync.
const root = document.documentElement;
const sun = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.5 1.5M17.2 17.2l1.5 1.5M5.3 18.7l1.5-1.5M17.2 6.8l1.5-1.5"/></svg>';
const moon = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19.5 14.6A8 8 0 0 1 9.4 4.5a8 8 0 1 0 10.1 10.1Z"/></svg>';

export const isLight = () => root.dataset.theme === 'light';

const listeners = new Set();
export function onThemeChange(fn) { listeners.add(fn); }

function apply(theme) {
  if (theme === 'light') root.dataset.theme = 'light'; else delete root.dataset.theme;
  for (const button of document.querySelectorAll('.theme-toggle')) paint(button);
  listeners.forEach(fn => fn(theme));
}
function paint(button) {
  const light = isLight();
  button.innerHTML = light ? moon : sun;
  button.setAttribute('aria-label', light ? 'Switch to dark mode' : 'Switch to light mode');
  button.title = light ? 'Dark mode' : 'Light mode';
}

export function themeToggle() {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'theme-toggle';
  paint(button);
  button.addEventListener('click', () => {
    const next = isLight() ? 'dark' : 'light';
    try { localStorage.setItem('theme', next); } catch {}
    apply(next);
  });
  return button;
}

addEventListener('storage', event => { if (event.key === 'theme') apply(event.newValue); });
