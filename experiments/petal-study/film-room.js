// Film as a screening room: the films are a list of titles beside one frame. Hovering a title plays that
// film silently in the frame; clicking dims the page and plays it with sound.
import './film-room.css';

const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
const canHover = matchMedia('(hover: hover)').matches;
const clock = s => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;

function el(tag, className, text) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (text) e.textContent = text;
  return e;
}

export function filmRoom({films, socials, videoPoster}) {
  const posterOf = f => f.poster || (f.youtube ? `https://i.ytimg.com/vi/${f.youtube}/hqdefault.jpg` : f.src ? videoPoster(f.src) : '');
  const room = el('div', 'screening');
  const frame = el('button', 'screening-frame'); frame.type = 'button';
  const preview = el('video', 'screening-preview');
  Object.assign(preview, {muted: true, loop: true, playsInline: true, preload: 'none'});
  preview.setAttribute('aria-hidden', 'true');
  const poster = el('img', 'screening-poster'); poster.alt = '';
  frame.append(poster, preview, el('span', 'screening-play', 'Play'));
  const list = el('ol', 'screening-list');
  const rows = new Map();
  let active = null;

  // The silent preview starts a little way in, past the opening black.
  function cue(film) {
    if (active === film) return;
    active = film;
    rows.forEach((row, f) => row.classList.toggle('is-active', f === film));
    frame.setAttribute('aria-label', `Play ${film.title}`);
    poster.src = posterOf(film);
    preview.classList.remove('is-on');
    if (still || !film.src) { preview.removeAttribute('src'); preview.load(); return; }
    preview.src = film.src;
    preview.addEventListener('loadedmetadata', () => { if (active === film) preview.currentTime = Math.min(preview.duration * .2, 6); }, {once: true});
    preview.addEventListener('playing', () => { if (active === film) preview.classList.add('is-on'); }, {once: true});
    preview.play().catch(() => {});
  }

  films.forEach((film, i) => {
    const row = el('li', 'screening-row');
    const btn = el('button', 'screening-item'); btn.type = 'button';
    const meta = el('span', 'screening-meta', [film.kind, film.year].filter(Boolean).join(' · '));
    btn.append(el('span', 'screening-index', String(i + 1).padStart(2, '0')), el('span', 'screening-title', film.title), meta);
    // Each film's running time comes from its own file, so the list never goes stale.
    if (film.src) {
      const probe = Object.assign(document.createElement('video'), {preload: 'metadata', muted: true, src: film.src});
      probe.addEventListener('loadedmetadata', () => { meta.textContent = [film.kind, film.year, clock(probe.duration)].filter(Boolean).join(' · '); probe.removeAttribute('src'); probe.load(); }, {once: true});
    }
    if (canHover) { btn.addEventListener('pointerenter', () => cue(film)); btn.addEventListener('focus', () => cue(film)); }
    btn.addEventListener('click', () => { cue(film); screen(film); });
    row.append(btn); list.append(row); rows.set(film, row);
  });
  frame.addEventListener('click', () => active && screen(active));

  const layout = el('div', 'screening-layout');
  layout.append(list, frame);
  room.append(layout);

  const elsewhere = el('div', 'film-elsewhere');
  const label = el('h3', 'work-section-label', 'Watch elsewhere');
  const links = el('div', 'film-socials');
  for (const s of socials.filter(s => s.label !== 'GitHub')) {
    const a = el('a'); a.href = s.url; a.target = '_blank'; a.rel = 'noopener noreferrer';
    a.append(el('strong', '', s.label), el('span', '', s.handle));
    links.append(a);
  }
  elsewhere.append(label, links);
  room.append(elsewhere);

  // The theatre: the page goes dark and the film plays with sound.
  const theatre = el('dialog', 'theatre');
  theatre.setAttribute('aria-label', 'Film');
  const close = el('button', 'theatre-close', '×'); close.type = 'button'; close.setAttribute('aria-label', 'Close');
  const stage = el('div', 'theatre-stage');
  const caption = el('div', 'theatre-caption');
  theatre.append(close, stage, caption);
  close.addEventListener('click', () => theatre.close());
  theatre.addEventListener('click', e => { if (e.target === theatre) theatre.close(); });
  theatre.addEventListener('close', () => { stage.replaceChildren(); if (active && !still) preview.play().catch(() => {}); rows.get(active)?.querySelector('button').focus(); });
  room.append(theatre);

  function screen(film) {
    preview.pause();
    stage.replaceChildren();
    if (film.youtube) {
      const f = el('iframe');
      Object.assign(f, {src: `https://www.youtube-nocookie.com/embed/${film.youtube}?autoplay=1&rel=0`, title: film.title, allow: 'autoplay; encrypted-media; picture-in-picture; fullscreen', allowFullscreen: true});
      stage.append(f);
    } else if (film.external) {
      const a = el('a', 'theatre-external', 'Watch on X'); a.href = film.external; a.target = '_blank'; a.rel = 'noopener noreferrer';
      stage.append(a);
    } else {
      const v = Object.assign(el('video'), {src: film.src, poster: posterOf(film), controls: true, autoplay: true, playsInline: true});
      v.setAttribute('aria-label', film.title);
      stage.append(v); v.play().catch(() => {});
    }
    caption.replaceChildren(el('span', 'theatre-kind', [film.kind, film.year].filter(Boolean).join(' · ')), el('h3', '', film.title));
    if (film.note) caption.append(el('p', '', film.note));
    theatre.showModal(); theatre.focus();
  }
  theatre.tabIndex = -1;

  cue(films.find(f => f.featured) || films[0]);
  return {el: room, destroy() { preview.pause(); preview.removeAttribute('src'); preview.load(); if (theatre.open) theatre.close(); }};
}
