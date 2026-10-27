// A · Open from the start: every word is visible at once, the breeze plays by itself,
// and a caption under the flower names the effect in use and how to touch it.
import {modes, choose, whenReady} from './driver.js';
const caption = document.querySelector('.proto-caption');
function show(id) {
  const m = modes.find(m => m.id === id); if (!m) return;
  caption.querySelector('b').textContent = m.word;
  caption.querySelector('span').textContent = m.title;
  caption.querySelector('i').textContent = m.hint;
  caption.hidden = false;
}
for (const m of modes) (m.id === 'play' ? document.querySelector('#play') : document.querySelector(`[data-mode="${m.id}"]`))
  .addEventListener('click', () => show(m.id));
whenReady().then(() => choose('bloom'));
