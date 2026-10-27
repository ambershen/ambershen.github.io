// Sketchbook · wall: pieces taped up as prints, titles on the print margin. The group names are the filter:
// the chosen one takes the marker. Hover lifts a print and plays it; click opens it large.
import {header, node, still} from './shared.js';
import {items as sketches, sketchGroups} from '../../src/data/portfolio.js';
import {videoPoster} from '../../src/data/video-posters.js';
header('Sketchbook');
const page = document.querySelector('#page');

const head = node('header', 'w-head');
head.append(node('h1', '', 'Sketchbook'), node('p', 'w-intro', 'An ongoing collection of visual experiments, typography, and ways of seeing.'));
const filters = node('p', 'w-filters');
const choices = [{id: 'all', title: 'All'}, ...sketchGroups];
const words = choices.map((g, i) => {
  const b = node('button', 'marker w-filter', g.title); b.type = 'button';
  b.addEventListener('click', () => choose(g.id));
  filters.append(b); if (i < choices.length - 1) filters.append(node('span', 'w-dot', '·'));
  return {id: g.id, b};
});
head.append(filters); page.append(head);

const wall = node('div', 'w-wall'); page.append(wall);
// A steady scatter: the same tilt and nudge for a piece on every visit.
const rand = seed => { const x = Math.sin(seed * 91.7 + 13.1) * 43758.5453; return x - Math.floor(x); };
const prints = sketches.map((s, i) => {
  const card = node('figure', 'w-print'); card.dataset.theme = s.theme; card.tabIndex = 0;
  card.style.setProperty('--tilt', `${(rand(i) - .5) * 5}deg`);
  card.style.setProperty('--nudge', `${(rand(i + 7) - .5) * 28}px`);
  card.style.setProperty('--tape', `${(rand(i + 3) - .5) * 14}deg`);
  if (i % 5 === 0) card.classList.add('is-wide');
  const photo = node('div', 'w-photo');
  let media;
  if (s.video) {
    media = node('video'); media.muted = true; media.loop = true; media.playsInline = true; media.preload = 'none';
    media.poster = s.poster || videoPoster(s.video); media.src = s.video;
  } else { media = node('img'); media.src = s.image; media.alt = s.title; media.loading = 'lazy'; media.decoding = 'async'; }
  photo.append(media);
  // The title is written on the print's white margin.
  photo.append(node('figcaption', 'w-caption', s.title));
  card.append(node('span', 'w-tape'), photo);
  wall.append(card);
  card.addEventListener('pointerenter', () => { if (media.tagName === 'VIDEO' && !still) media.play().catch(() => {}); });
  card.addEventListener('pointerleave', () => { if (media.tagName === 'VIDEO') media.pause(); });
  card.addEventListener('click', () => open(s));
  card.addEventListener('keydown', e => { if (e.key === 'Enter') open(s); });
  return {card, theme: s.theme};
});

function choose(id) {
  words.forEach(w => w.b.classList.toggle('is-on', w.id === id));
  prints.forEach(p => p.card.classList.toggle('is-hidden', id !== 'all' && p.theme !== id));
}
choose('all');

/* A closer look. */
const viewer = node('dialog', 'w-viewer');
viewer.addEventListener('click', e => { if (e.target === viewer) viewer.close(); });
viewer.addEventListener('close', () => viewer.querySelector('video')?.pause());
document.body.append(viewer);
function open(s) {
  viewer.replaceChildren();
  let media;
  if (s.video) { media = node('video'); media.src = s.video; media.poster = s.poster || videoPoster(s.video); media.controls = true; media.playsInline = true; media.autoplay = !still; media.muted = !s.sound; }
  else { media = node('img'); media.src = s.image; media.alt = s.title; }
  const cap = node('figcaption'); cap.append(node('h2', '', s.title)); if (s.exploration) cap.append(node('p', '', s.exploration));
  const close = node('button', 'w-close', '×'); close.type = 'button'; close.setAttribute('aria-label', 'Close'); close.onclick = () => viewer.close();
  const fig = node('figure'); fig.append(media, cap);
  viewer.append(close, fig); viewer.showModal();
}
