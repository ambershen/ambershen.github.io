// Shared by the page prototypes: header with theme toggle, torn paper, small helpers.
import {themeToggle} from '../../src/theme.js';
export function header(current) {
  const h = document.createElement('header'); h.className = 'p-header';
  for (const [label, href] of [['Work', './work.html'], ['Sketchbook', './sketch-wall.html'], ['Film', '/#film'], ['Teaching', '/#teaching']]) {
    const a = document.createElement('a'); a.href = href; a.textContent = label; if (label === current) a.setAttribute('aria-current', 'page'); h.append(a);
  }
  const home = document.createElement('a'); home.href = './'; home.textContent = '✿'; home.setAttribute('aria-label', 'Prototypes'); h.prepend(home);
  h.append(themeToggle());
  document.body.prepend(h);
  return h;
}
export const node = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
// A torn scrap: ragged sides, slightly uneven top and bottom, and a soft fold. Call after it is in the DOM.
export function tear(paper) {
  const w = paper.offsetWidth, h = paper.offsetHeight, pts = [], j = a => (Math.random() * a).toFixed(1);
  for (let x = 0; x <= w; x += 9) pts.push(`${x}px ${j(1.6)}px`);
  for (let y = 0; y <= h; y += 4) pts.push(`calc(100% - ${j(4)}px) ${y}px`);
  for (let x = w; x >= 0; x -= 9) pts.push(`${x}px calc(100% - ${j(1.6)}px)`);
  for (let y = h; y >= 0; y -= 4) pts.push(`${j(4)}px ${y}px`);
  paper.style.clipPath = `polygon(${pts.join(',')})`;
  paper.style.setProperty('--fold', `${20 + Math.random() * 60}%`);
  paper.style.setProperty('--fold-angle', `${80 + Math.random() * 40}deg`);
}
export function scrap(text) { const s = node('span', 'scrap'); s.append(node('span', '', text)); return s; }
export const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const phone = matchMedia('(max-width: 600px)');
