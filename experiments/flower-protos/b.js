// B · Scroll story: the introduction becomes a sequence; each line takes over the flower as it
// reaches the middle of the screen. The flower stays pinned and playable throughout.
import {choose, whenReady} from './driver.js';
const steps = [...document.querySelectorAll('.proto-step')];
let current = null, ready = false;
function activate(step) {
  if (!ready || !step || step.dataset.mode === current) return;
  current = step.dataset.mode;
  steps.forEach(s => s.classList.toggle('is-active', s === step));
  choose(current);
}
const watch = new IntersectionObserver(entries => {
  for (const e of entries) if (e.isIntersecting) activate(e.target);
}, {rootMargin: '-45% 0px -45% 0px'});
steps.forEach(s => {
  watch.observe(s);
  s.querySelector('.proto-word')?.addEventListener('click', () => { current = null; activate(s); });
});
whenReady().then(() => {
  ready = true;
  const mid = innerHeight / 2;
  activate(steps.find(s => { const r = s.getBoundingClientRect(); return r.top <= mid && r.bottom >= mid; }) || steps[0]);
});
