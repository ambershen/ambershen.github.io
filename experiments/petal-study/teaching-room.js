// Teaching: the videos on a curved ring (teaching-ring.js). The one in the centre is captioned below;
// clicking it plays it in a dark full-screen view.
import './teaching-room.css';
import {loadXWidgets} from '../../src/x-embed.js';
import {teachingGroups, teachingFeatured, teachingTopics} from '../../src/data/teaching.js';
import {socials} from '../../src/data/site.js';

function el(tag, className, text) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (text) e.textContent = text;
  return e;
}

const all = teachingGroups.flatMap(g => g.videos.map(v => ({...v, publisher: v.publisher || 'TRAE · YouTube'})));
const key = v => v.youtube || v.url;
const byKey = new Map(all.map(v => [key(v), v]));
const urlOf = v => v.url || `https://www.youtube.com/watch?v=${v.youtube}${v.start ? '&t=' + v.start + 's' : ''}`;
// Ring order: the topics in turn, each video tagged with its topic.
const ordered = teachingTopics.flatMap(t => t.videos.map(id => byKey.get(id) && {...byKey.get(id), topic: t.title})).filter(Boolean);

export function teachingRoom({fullBleed}) {
  const room = el('div', 'lessons');
  const stage = el('div', 'lesson-ring');
  const caption = el('div', 'lesson-caption');
  caption.setAttribute('aria-live', 'polite');
  const nav = el('div', 'lesson-nav');
  const prev = el('button', 'lesson-step', '←'), next = el('button', 'lesson-step', '→');
  prev.type = next.type = 'button';
  prev.setAttribute('aria-label', 'Previous video'); next.setAttribute('aria-label', 'Next video');
  nav.append(prev, next);
  const foot = el('div', 'lesson-foot');
  foot.append(caption, nav);
  // The same videos as plain links, for screen readers.
  const list = el('ul', 'lesson-sr-list');
  for (const v of ordered) { const li = el('li'), a = el('a', '', v.title); a.href = urlOf(v); a.target = '_blank'; a.rel = 'noopener noreferrer'; li.append(a); list.append(li); }
  const x = socials.find(s => s.label === 'X');
  const more = el('a', 'lesson-more', 'Check more daily builds on X');
  more.href = x.url; more.target = '_blank'; more.rel = 'noopener noreferrer';
  room.append(stage, foot, more, list);

  const theatre = el('dialog', 'lesson-theatre');
  theatre.setAttribute('aria-label', 'Video'); theatre.tabIndex = -1;
  const close = el('button', 'lesson-theatre-close', '×'); close.type = 'button'; close.setAttribute('aria-label', 'Close');
  const screen = el('div', 'lesson-screen');
  theatre.append(close, screen);
  room.append(theatre);
  let opener = null, token = 0;
  close.addEventListener('click', () => theatre.close());
  theatre.addEventListener('click', e => { if (e.target === theatre) theatre.close(); });
  theatre.addEventListener('close', () => { token++; screen.replaceChildren(); opener?.focus(); });

  function play(video, from) {
    opener = from; const mine = ++token;
    screen.classList.remove('is-x-embed');
    theatre.showModal(); theatre.focus();
    if (video.youtube) {
      const f = el('iframe');
      Object.assign(f, {title: video.title, src: `https://www.youtube-nocookie.com/embed/${video.youtube}?autoplay=1&rel=0${video.start ? '&start=' + video.start : ''}`, allow: 'autoplay; encrypted-media; picture-in-picture; fullscreen', allowFullscreen: true, referrerPolicy: 'strict-origin-when-cross-origin'});
      screen.replaceChildren(f); return;
    }
    // X posts load through X's own widget; if it never arrives, the post is one click away.
    screen.classList.add('is-x-embed');
    const status = el('p', 'lesson-status', 'Loading video from X…'); status.setAttribute('role', 'status');
    const host = el('div', 'lesson-x-host');
    screen.replaceChildren(status, host);
    let timer;
    loadXWidgets().then(widgets => mine === token && Promise.race([
      widgets.widgets.createTweet(new URL(video.url).pathname.split('/').pop(), host, {conversation: 'none', dnt: true, theme: 'dark'}),
      new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('X embed timed out')), 15000); }),
    ])).then(result => {
      if (mine !== token) return;
      if (!result) throw new Error('X embed unavailable');
      status.remove();
    }).catch(() => {
      if (mine !== token) return;
      host.remove(); status.textContent = 'The X player couldn’t load. ';
      const a = el('a', '', 'Open the post on X'); a.href = video.url; a.target = '_blank'; a.rel = 'noopener noreferrer';
      status.append(a);
    }).finally(() => clearTimeout(timer));
  }

  function describe(video, i) {
    const title = el('h3', '', video.title);
    caption.replaceChildren(
      el('p', 'lesson-meta', `${String(i + 1).padStart(2, '0')} / ${ordered.length} · ${video.topic}`),
      title,
      el('p', 'lesson-publisher', video.publisher),
    );
  }

  let ring = null, alive = true;
  const start = Math.max(0, ordered.findIndex(v => key(v) === teachingFeatured));
  describe(ordered[start], start);
  // three.js loads only when Teaching opens.
  import('./teaching-ring.js').then(({mountRing}) => {
    if (!alive) return;
    fullBleed(stage);
    ring = mountRing(stage, ordered, {start, onFocus: describe, onOpen: play, isPaused: () => theatre.open});
    prev.onclick = () => ring.step(-1); next.onclick = () => ring.step(1);
  });

  return {el: room, fit: () => fullBleed(stage), destroy() { alive = false; ring?.destroy(); if (theatre.open) theatre.close(); }};
}
