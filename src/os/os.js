import './os.css';
import {icons} from './icons.js';
import {art, hasArt} from './app-icons.js';
import {flowerMark} from '../flower-mark.js';
import {caseStudies} from '../data/case-studies.js';
import {films, music, newsletter, buttondownUrls} from '../data/site.js';

// URLs are written out statically so Vite only bundles these files.
const u = url => url.href;
const paintings = import.meta.glob('../../images/art-paintings/*.{jpeg,jpg}', {eager: true, query: '?url', import: 'default'});
const paintingList = Object.keys(paintings).sort().map(k => paintings[k]);

// Loose work that only lives on this desktop.
const scrap = [
  u(new URL('../../images/scraps/retro-computer-01.mp4', import.meta.url)),
  u(new URL('../../images/scraps/retro-computer-02.mp4', import.meta.url)),
  u(new URL('../../images/scraps/retro-computer-03.mp4', import.meta.url)),
  u(new URL('../../images/scraps/retro-computer-04.mp4', import.meta.url)),
];
const paletteMe = [
  u(new URL('../../images/palette-me/frontpage.png', import.meta.url)),
  u(new URL('../../images/palette-me/1st.png', import.meta.url)),
  u(new URL('../../images/palette-me/2nd.png', import.meta.url)),
  u(new URL('../../images/palette-me/3rd.png', import.meta.url)),
];
const bentoBox = [
  u(new URL('../../images/small-tool-bento-box/frontpage.png', import.meta.url)),
  u(new URL('../../images/small-tool-bento-box/1st.png', import.meta.url)),
  u(new URL('../../images/small-tool-bento-box/2nd.png', import.meta.url)),
  u(new URL('../../images/small-tool-bento-box/3rd.png', import.meta.url)),
  u(new URL('../../images/small-tool-bento-box/4th.png', import.meta.url)),
  u(new URL('../../images/small-tool-bento-box/5th.png', import.meta.url)),
  u(new URL('../../images/small-tool-bento-box/6th.png', import.meta.url)),
];

// ── Apps ───────────────────────────────────────────────────────
// type: text | iframe | video | images | folder | links | newsletter | music
// at: [x%, y%] puts the icon on the desktop. No `at` and no `dock` = hidden,
// reachable only from a folder. caseStudy: slug of a /work/<slug>/ page.
const apps = [
  {id: 'readme', title: 'ReadMe.txt', icon: 'note', art: 'doc', type: 'text', at: [2.5, 4], w: 420, h: 380,
    html: `<p><strong>Welcome to Amber OS.</strong></p>
      <p>Two kinds of thing live here. A few pieces of past work you can open and actually play with — and the small projects that never fit the portfolio proper: scraps, tools, odds and ends from client jobs.</p>
      <p>Nothing here needs a case study. Open a folder and poke around.</p>
      <p class="os-dim">Drag windows by the title bar, and icons anywhere you like. Double-click a title bar to fill the screen. Esc closes the front window. The dock is at the bottom.</p>
      <p class="os-dim">— Amber</p>`},
  {id: 'bloom', title: 'Bloom', icon: 'flower', type: 'iframe', src: '/?embed#home', at: [2.5, 32], w: 940, h: 620,
    blurb: 'Brush the petals. Try the words: bloom, art, narrative, code, chaos.'},

  // NFC charm experiences: standalone pages also open inside Amber OS.
  {id: 'charms', title: 'Charms', icon: 'folder', type: 'folder', at: [31, 17], w: 540, h: 340,
    children: ['charm-hello', 'charm-creative']},
  {id: 'charm-hello', title: 'A Little Hello', icon: 'note', type: 'iframe', src: '/charms/hello/', w: 420, h: 720,
    external: '/charms/hello/', blurb: 'A little introduction, carried on a charm.'},
  {id: 'charm-creative', title: 'Creative', icon: 'folder', type: 'iframe', src: '/charms/creative/', w: 420, h: 720,
    external: '/charms/creative/', blurb: 'My portfolio and X, one tap away.'},

  // Folders on the desktop.
  {id: 'scraps', title: 'Scraps', icon: 'folder', type: 'folder', at: [11, 17], w: 560, h: 360,
    children: ['scrap-01', 'scrap-02', 'scrap-03', 'scrap-04']},
  {id: 'small-tools', title: 'Small Tools', icon: 'folder', type: 'folder', at: [12, 45], w: 520, h: 330,
    children: ['palette-me', 'bento-box']},
  {id: 'client-work', title: 'Client Work', icon: 'folder', type: 'folder', at: [20, 5], w: 520, h: 330,
    children: ['trae-raffle', 'raffle-reveal']},
  {id: 'films', title: 'Films', icon: 'folder', type: 'folder', at: [21, 31], w: 520, h: 330,
    children: films.map(f => `film-${f.id}`)},
  {id: 'sketches', title: 'Sketches', icon: 'folder', type: 'folder', at: [20, 58], w: 600, h: 400,
    children: ['calligramme', 'places-to-be', 'infinite-gallery', 'cloud-croissant', 'mirror', 'ascii-flow', 'touch-me']},

  // ── Dock ─────────────────────────────────────────────────────
  {id: 'finder', title: 'Finder', icon: 'finder', dockArt: 'finder', type: 'folder', dock: true, w: 640, h: 440, children: []},
  {id: 'photos', title: 'Photos', icon: 'photo', dockArt: 'photos', type: 'images', dock: true, w: 820, h: 600, images: paintingList},
  {id: 'music', title: 'Music', icon: 'music', dockArt: 'music', type: 'music', dock: true, w: 560, h: 430},
  {id: 'deskmate', title: 'Deskmate', icon: 'desk', dockArt: 'deskmate', type: 'video', dock: true, w: 820, h: 560,
    src: u(new URL('../../images/deskmate/frontpage.mp4', import.meta.url)), external: 'https://desk-mate.ai', blurb: 'Find your coworking people.'},
  {id: 'newsletter', title: newsletter.name, icon: 'letter', dockArt: 'mail', type: 'newsletter', dock: true, w: 460, h: 330},
  // Fill `html` with the experiments that didn't work out and it becomes a Rejects folder.
  {id: 'trash', title: 'Trash', icon: 'trash', dockArt: 'trash', type: 'text', dock: true, w: 400, h: 230,
    html: `<p>Empty.</p><p class="os-dim">The experiments that didn't work are still on a drive somewhere.</p>`},

  // ── In folders only ──────────────────────────────────────────
  {id: 'calligramme', title: 'Calligramme', icon: 'poem', type: 'video', w: 820, h: 560, caseStudy: 'calligramme',
    src: u(new URL('../../images/art-interactive/calligramme.mp4', import.meta.url))},
  {id: 'places-to-be', title: 'Places to Be', icon: 'place', type: 'video', w: 820, h: 560, caseStudy: 'places-to-be',
    src: u(new URL('../../images/art-interactive/places_to_be.mp4', import.meta.url))},
  {id: 'infinite-gallery', title: 'Infinite Gallery', icon: 'tunnel', type: 'video', w: 820, h: 560,
    src: u(new URL('../../images/infinite-gallery/frontpage.mp4', import.meta.url)), blurb: 'A 3D funnel for showcasing artwork or consumer products.'},
  {id: 'cloud-croissant', title: 'Cloud Croissant', icon: 'glyph', type: 'video', src: u(new URL('../../images/art-interactive/cloud-croissant.mp4', import.meta.url))},
  {id: 'mirror', title: 'Mirror — Central Park', icon: 'glyph', type: 'video', src: u(new URL('../../images/art-interactive/mirror-central-park-summer.mp4', import.meta.url))},
  {id: 'ascii-flow', title: 'ASCII Flow', icon: 'glyph', type: 'video', src: u(new URL('../../images/art-interactive/ascii-art-flow.mp4', import.meta.url))},
  {id: 'touch-me', title: 'Touch Me', icon: 'film', type: 'video', src: u(new URL('../../images/art-interactive/touch-me-motion.mp4', import.meta.url))},
  {id: 'scrap-01', title: 'Retro Computer 01', icon: 'film', type: 'video', w: 760, h: 520, src: scrap[0]},
  {id: 'scrap-02', title: 'Retro Computer 02', icon: 'film', type: 'video', w: 760, h: 520, src: scrap[1]},
  {id: 'scrap-03', title: 'Retro Computer 03', icon: 'film', type: 'video', w: 760, h: 520, src: scrap[2]},
  {id: 'scrap-04', title: 'Retro Computer 04', icon: 'film', type: 'video', w: 760, h: 520, src: scrap[3]},
  {id: 'palette-me', title: 'Palette Me', icon: 'tool', type: 'images', w: 860, h: 600, images: paletteMe},
  {id: 'bento-box', title: 'Bento Box', icon: 'tool', type: 'images', w: 860, h: 600, images: bentoBox},
  {id: 'trae-raffle', title: 'Trae Anniversary Raffle', icon: 'film', type: 'video', w: 820, h: 540,
    src: u(new URL('../../images/trae-raffle/trae-anniversary-raffle.mp4', import.meta.url))},
  {id: 'raffle-reveal', title: 'Raffle Reveal', icon: 'film', type: 'video', w: 820, h: 540,
    src: u(new URL('../../images/trae-raffle/raffle-reveal.mp4', import.meta.url))},
  ...films.map(f => ({id: `film-${f.id}`, title: f.title, icon: 'film', type: f.youtube ? 'iframe' : 'video', w: 860, h: 540,
    src: f.youtube ? `https://www.youtube-nocookie.com/embed/${f.youtube}?rel=0` : f.src, blurb: f.note})),
];
const byId = Object.fromEntries(apps.map(a => [a.id, a]));

// The desktop items, in the order they were declared.
const onDesktop = apps.filter(a => a.at);
// Finder opens onto whatever is on the desktop.
byId.finder.children = onDesktop.map(a => a.id);
const dockOrder = ['finder', 'photos', 'music', 'deskmate', 'newsletter'];

// ── Helpers ────────────────────────────────────────────────────
const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
const desktop = document.querySelector('#desktop'), layer = document.querySelector('#windows');
const mobile = () => matchMedia('(max-width: 720px)').matches;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
document.querySelector('#mark').innerHTML = flowerMark;
document.body.style.setProperty('--wallpaper', `url(${u(new URL('../../experiments/petal-study/flower.webp', import.meta.url))})`);

// Folders and documents wear the system art; the work keeps its peony line glyph.
const artFor = app => app.art || (app.type === 'folder' ? 'folder' : null);

function iconButton(app, small = false) {
  const b = el('button', small ? 'os-icon os-icon-small' : 'os-icon');
  b.type = 'button'; b.dataset.app = app.id;
  const name = artFor(app);
  const glyph = el('span', hasArt(name) ? 'os-glyph os-glyph-art' : 'os-glyph');
  glyph.innerHTML = hasArt(name) ? art(name) : (icons[app.icon] || icons.note);
  b.append(glyph, el('span', 'os-label', app.title));
  b.addEventListener('click', () => open(app.id, b));
  return b;
}

// ── Window manager ─────────────────────────────────────────────
let z = 10, cascade = 0;
const openWindows = new Map();
const minimized = new Set();

function focus(win) {
  win.style.zIndex = ++z;
  layer.querySelectorAll('.os-window').forEach(w => w.classList.toggle('is-focused', w === win));
}

function topWindow() {
  return [...openWindows.entries()]
    .filter(([id]) => !minimized.has(id))
    .map(([, w]) => w)
    .sort((a, b) => b.style.zIndex - a.style.zIndex)[0];
}

function close(id) {
  const win = openWindows.get(id); if (!win) return;
  win.querySelectorAll('video, audio').forEach(v => v.pause());
  win.remove(); openWindows.delete(id); minimized.delete(id);
  const top = topWindow();
  if (top) focus(top);
  win._opener?.focus({preventScroll: true});
  if (location.hash === `#${id}`) history.replaceState(null, '', location.pathname);
  syncDock();
}

function minimize(id) {
  const win = openWindows.get(id); if (!win || minimized.has(id)) return;
  win.querySelectorAll('video, audio').forEach(v => v.pause());
  minimized.add(id); win.classList.add('is-min');
  const top = topWindow(); if (top) focus(top);
  syncDock();
}

function restore(id) {
  const win = openWindows.get(id); if (!win) return;
  minimized.delete(id); win.classList.remove('is-min');
  focus(win); win.querySelector('.os-titlebar').focus({preventScroll: true});
  syncDock();
}

function body(app) {
  const b = el('div', `os-body os-body-${app.type}`);
  switch (app.type) {
    case 'text': b.innerHTML = app.html; break;
    case 'iframe': {
      const f = el('iframe'); f.src = app.src; f.title = app.title; f.loading = 'lazy';
      f.allow = 'autoplay; fullscreen; clipboard-write; camera; encrypted-media; picture-in-picture'; f.allowFullscreen = true;
      b.append(f); break;
    }
    case 'video': {
      const v = el('video'); v.src = app.src; v.controls = true; v.playsInline = true; v.autoplay = !reduced; v.loop = true; v.muted = true;
      if (app.poster) v.poster = app.poster; v.setAttribute('aria-label', app.title); b.append(v); break;
    }
    case 'images': {
      const stage = el('img', 'os-stage'); stage.alt = app.title; stage.src = app.images[0];
      const strip = el('div', 'os-strip');
      app.images.forEach((src, i) => {
        const t = el('button', 'os-thumb'); t.type = 'button'; t.setAttribute('aria-label', `Image ${i + 1}`);
        const im = el('img'); im.src = src; im.alt = ''; im.loading = 'lazy'; t.append(im);
        t.onclick = () => { stage.src = src; strip.querySelectorAll('.os-thumb').forEach(x => x.setAttribute('aria-pressed', String(x === t))); };
        t.setAttribute('aria-pressed', String(i === 0)); strip.append(t);
      });
      b.append(stage, strip); break;
    }
    case 'folder': {
      const path = el('div', 'os-pathbar');
      path.append(el('span', '', 'Amber HD'), el('span', 'os-sep', '›'), el('strong', '', app.title));
      const grid = el('div', 'os-folder');
      app.children.map(id => byId[id]).filter(Boolean).forEach(child => grid.append(iconButton(child, true)));
      b.append(path, grid); break;
    }
    case 'links': {
      const list = el('ul', 'os-links');
      app.links.forEach(l => { const li = el('li'), a = el('a'); a.href = l.href; a.append(el('strong', '', l.label)); if (l.sub) a.append(el('span', '', l.sub)); li.append(a); list.append(li); });
      b.append(list); break;
    }
    case 'music': {
      const art = el('div', 'os-music-art');
      const cover = el('img'); cover.src = paintingList[0]; cover.alt = ''; art.append(cover);
      const head = el('div', 'os-music-head');
      head.append(el('strong', '', music.title), el('span', 'os-dim', music.note));
      const list = el('ol', 'os-music-list');
      const playable = music.tracks.some(t => t.src);
      const status = el('p', 'os-music-status', playable ? 'Pick a track.' : 'No audio loaded yet — the playlist is here for the record.');
      status.setAttribute('aria-live', 'polite');
      const audio = el('audio'); audio.preload = 'none';
      music.tracks.forEach((track, i) => {
        const row = el('button', 'os-track'); row.type = 'button';
        row.append(el('span', 'os-track-n', String(i + 1).padStart(2, '0')),
          el('span', 'os-track-t', track.title),
          el('span', 'os-track-a', track.artist || ''),
          el('span', 'os-track-l', track.length || ''));
        if (!track.src) row.classList.add('is-quiet');
        row.onclick = () => {
          list.querySelectorAll('.os-track').forEach(x => x.classList.toggle('is-playing', x === row && Boolean(track.src)));
          if (!track.src) { status.textContent = `“${track.title}” has no audio file yet.`; return; }
          audio.src = track.src;
          audio.play().then(() => { status.textContent = `Playing — ${track.title}`; })
            .catch(() => { status.textContent = 'Press the row again to start audio.'; });
        };
        const li = el('li'); li.append(row); list.append(li);
      });
      b.append(art, head, list, status, audio); break;
    }
    case 'newsletter': {
      const urls = buttondownUrls(newsletter.buttondown);
      b.append(el('p', '', newsletter.blurb));
      const form = el('form', 'os-form'); form.method = 'post'; form.target = '_blank'; if (urls) form.action = urls.subscribe;
      const email = el('input'); email.type = 'email'; email.name = 'email'; email.required = true; email.placeholder = 'you@email.com'; email.setAttribute('aria-label', 'Email address');
      const hidden = el('input'); hidden.type = 'hidden'; hidden.name = 'embed'; hidden.value = '1';
      const go = el('button', '', 'Subscribe'); go.type = 'submit';
      const status = el('p', 'os-dim', newsletter.cadence); status.setAttribute('aria-live', 'polite');
      form.append(email, hidden, go);
      form.addEventListener('submit', e => { if (!urls) { e.preventDefault(); status.textContent = 'Launching soon. Follow along on X in the meantime.'; } else status.textContent = 'Check your inbox to confirm.'; });
      b.append(form, status); break;
    }
  }
  return b;
}

// place: [x%, y%] of the desktop. Without it, windows cascade from the middle.
function open(id, opener, place) {
  const app = byId[id]; if (!app) return;
  if (openWindows.has(id)) { minimized.has(id) ? restore(id) : (focus(openWindows.get(id)), openWindows.get(id).querySelector('.os-titlebar').focus()); return; }
  const win = el('section', 'os-window'); win._opener = opener;
  win.setAttribute('role', 'dialog'); win.setAttribute('aria-label', app.title); win.dataset.app = id;
  const bar = el('div', 'os-titlebar'); bar.tabIndex = 0;
  const closeBtn = el('button', 'os-close'); closeBtn.type = 'button'; closeBtn.setAttribute('aria-label', `Close ${app.title}`);
  const minBtn = el('button', 'os-min'); minBtn.type = 'button'; minBtn.setAttribute('aria-label', `Minimize ${app.title}`);
  const maxBtn = el('button', 'os-max'); maxBtn.type = 'button'; maxBtn.setAttribute('aria-label', 'Fill screen');
  const lights = el('div', 'os-lights'); lights.append(closeBtn, minBtn, maxBtn);
  bar.append(lights, el('h2', 'os-title', app.title));
  if (app.external) { const a = el('a', 'os-external', 'Open ↗'); a.href = app.external; a.target = '_blank'; a.rel = 'noopener noreferrer'; bar.append(a); }
  win.append(bar, body(app));
  const count = app.type === 'folder' ? `${app.children.filter(c => byId[c]).length} items` : '';
  if (app.blurb || count || app.caseStudy || app.more) {
    const foot = el('footer', 'os-footer');
    foot.append(el('span', '', app.blurb || count));
    const study = caseStudies.find(s => s.slug === app.caseStudy);
    if (study) { const a = el('a', '', 'Read the case study →'); a.href = `/work/${study.slug}/`; foot.append(a); }
    else if (app.more) { const a = el('a', '', 'More about it →'); a.href = app.more; foot.append(a); }
    win.append(foot);
  }
  // Size, then either the authored spot or the next cascade step.
  const W = innerWidth, H = desktop.clientHeight;
  const w = Math.min(app.w || 720, W - 140), h = Math.min(app.h || 520, H - 40);
  let x, y;
  if (place) { x = place[0] / 100 * W; y = place[1] / 100 * H; }
  else { x = (W - w) / 2 - 120 + cascade * 32; y = 40 + cascade * 32; cascade = (cascade + 1) % 6; }
  x = Math.max(20, Math.min(W - w - 20, x));
  // Keep the dock clear on open; windows can still be dragged under it.
  y = Math.max(16, Math.min(H - h - (mobile() ? 16 : 100), y));
  Object.assign(win.style, {left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px`});
  layer.append(win); openWindows.set(id, win); focus(win); syncDock();
  if (!reduced) win.animate([{opacity: 0, transform: 'scale(.96) translateY(8px)'}, {opacity: 1, transform: 'none'}], {duration: 220, easing: 'cubic-bezier(.22,1,.36,1)'});
  bar.focus({preventScroll: true});

  closeBtn.onclick = () => close(id);
  minBtn.onclick = () => minimize(id);
  const toggleMax = () => win.classList.toggle('is-max');
  maxBtn.onclick = toggleMax;
  bar.addEventListener('dblclick', e => { if (!e.target.closest('button,a')) toggleMax(); });
  win.addEventListener('pointerdown', () => focus(win), true);
  // Drag by the title bar.
  bar.addEventListener('pointerdown', e => {
    if (e.button !== 0 || e.target.closest('button,a') || mobile() || win.classList.contains('is-max')) return;
    const sx = e.clientX - win.offsetLeft, sy = e.clientY - win.offsetTop;
    bar.setPointerCapture(e.pointerId); document.body.classList.add('is-dragging');
    const move = ev => {
      win.style.left = `${Math.max(-w + 80, Math.min(innerWidth - 80, ev.clientX - sx))}px`;
      win.style.top = `${Math.max(0, Math.min(desktop.clientHeight - 40, ev.clientY - sy))}px`;
    };
    const up = () => { bar.removeEventListener('pointermove', move); document.body.classList.remove('is-dragging'); };
    bar.addEventListener('pointermove', move); bar.addEventListener('pointerup', up, {once: true}); bar.addEventListener('pointercancel', up, {once: true});
  });
  // Arrow keys nudge the focused title bar, for keyboard users.
  bar.addEventListener('keydown', e => {
    const step = e.shiftKey ? 40 : 10, d = {ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step]}[e.key];
    if (!d) return; e.preventDefault();
    win.style.left = `${win.offsetLeft + d[0]}px`; win.style.top = `${Math.max(0, win.offsetTop + d[1])}px`;
  });
  // Windows opened at boot keep the clean URL; only a deliberate open deep-links.
  if ((app.at || app.dock) && !place) history.replaceState(null, '', `#${id}`);
}

document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  const top = layer.querySelector('.os-window.is-focused'); if (top) close(top.dataset.app);
});

// ── Desktop icons ──────────────────────────────────────────────
const iconList = document.querySelector('#icons');
const placed = new Map();
onDesktop.forEach(app => {
  const li = el('li'); li.append(iconButton(app));
  li.style.left = `${app.at[0]}%`; li.style.top = `${app.at[1]}%`;
  iconList.append(li); placed.set(app.id, li);
  dragIcon(li, app);
});

// Icons can be dragged around the desktop, the way they can on a real one.
function dragIcon(li, app) {
  li.addEventListener('pointerdown', e => {
    if (e.button !== 0 || mobile()) return;
    const box = desktop.getBoundingClientRect();
    const sx = e.clientX - li.offsetLeft, sy = e.clientY - li.offsetTop;
    let moved = false;
    li.setPointerCapture(e.pointerId);
    const move = ev => {
      if (!moved && Math.hypot(ev.clientX - e.clientX, ev.clientY - e.clientY) < 4) return;
      moved = true; li.classList.add('is-dragging');
      const x = Math.max(0, Math.min(box.width - li.offsetWidth, ev.clientX - sx));
      const y = Math.max(0, Math.min(box.height - li.offsetHeight - 96, ev.clientY - sy));
      li.style.left = `${x / box.width * 100}%`; li.style.top = `${y / box.height * 100}%`;
    };
    const up = () => {
      li.removeEventListener('pointermove', move); li.classList.remove('is-dragging');
      if (moved) { app.at = [parseFloat(li.style.left), parseFloat(li.style.top)]; li._skipClick = true; setTimeout(() => { li._skipClick = false; }, 0); }
    };
    li.addEventListener('pointermove', move);
    li.addEventListener('pointerup', up, {once: true});
    li.addEventListener('pointercancel', up, {once: true});
  });
  li.addEventListener('click', e => { if (li._skipClick) { e.stopPropagation(); e.preventDefault(); } }, true);
}

// ── Dock ───────────────────────────────────────────────────────
const dockApps = document.querySelector('#dock-apps');
const dockMin = document.querySelector('#dock-min');
const dots = new Map();

dockOrder.map(id => byId[id]).filter(Boolean).forEach(app => {
  const li = el('li');
  const b = el('button', 'dock-app'); b.type = 'button'; b.setAttribute('aria-label', app.title);
  const glyph = el('span', 'dock-glyph'); glyph.innerHTML = art(app.dockArt) || icons[app.icon];
  b.append(glyph, el('span', 'dock-tip', app.title));
  b.onclick = () => open(app.id, b);
  const dot = el('span', 'dock-dot'); dot.setAttribute('aria-hidden', 'true');
  li.append(b, dot); dots.set(app.id, dot); dockApps.append(li);
});
{
  const app = byId.trash;
  const b = el('button', 'dock-app'); b.type = 'button'; b.setAttribute('aria-label', app.title);
  const glyph = el('span', 'dock-glyph'); glyph.innerHTML = art('trash');
  b.append(glyph, el('span', 'dock-tip', app.title));
  b.onclick = () => open('trash', b);
  const dot = el('span', 'dock-dot'); dot.setAttribute('aria-hidden', 'true');
  document.querySelector('#dock-trash').append(b, dot); dots.set('trash', dot);
}

function syncDock() {
  dots.forEach((dot, id) => dot.classList.toggle('is-running', openWindows.has(id)));
  dockMin.replaceChildren();
  minimized.forEach(id => {
    const app = byId[id]; if (!app) return;
    const li = el('li');
    const b = el('button', 'dock-app dock-app-min'); b.type = 'button'; b.setAttribute('aria-label', `Restore ${app.title}`);
    const line = !app.dockArt && !hasArt(artFor(app));
    const glyph = el('span', line ? 'dock-glyph dock-glyph-line' : 'dock-glyph');
    glyph.innerHTML = art(app.dockArt) || art(artFor(app)) || icons[app.icon] || icons.note;
    b.append(glyph, el('span', 'dock-tip', app.title));
    b.onclick = () => restore(id);
    li.append(b); dockMin.append(li);
  });
  dockMin.hidden = minimized.size === 0;
}
syncDock();

// ── Clock, boot, first windows ─────────────────────────────────
const clock = document.querySelector('#clock');
const tick = () => { const d = new Date(); clock.textContent = d.toLocaleString([], {weekday: 'short', hour: 'numeric', minute: '2-digit'}); clock.dateTime = d.toISOString(); };
tick(); setInterval(tick, 15000);

const boot = document.querySelector('#boot');
const dock = document.querySelector('#dock');
const ease = 'cubic-bezier(.22,1,.36,1)';
const start = location.hash.slice(1);

// The desktop wakes: icons settle in one after another, the dock rises, then
// the windows that were left open come back. Small moves, quick, then still.
function wake() {
  if (!reduced) {
    [...iconList.children].forEach((li, i) => li.animate(
      [{opacity: 0, transform: 'scale(.94)'}, {opacity: 1, transform: 'none'}],
      {duration: 300, delay: i * 34, easing: ease, fill: 'backwards'}));
    // The dock keeps its centring translate, so the phone layout fades instead.
    dock.animate(mobile()
      ? [{opacity: 0}, {opacity: 1}]
      : [{opacity: 0, transform: 'translate(-50%, 20px)'}, {opacity: 1, transform: 'translate(-50%, 0)'}],
      {duration: 420, delay: 150, easing: ease, fill: 'backwards'});
  }
  const later = (fn, ms) => setTimeout(fn, reduced ? 0 : ms);
  if (byId[start]) { later(() => open(start), 160); return; }
  if (mobile()) return;
  // Two folders and the readme, the way a desk gets left mid-thought.
  later(() => open('readme', null, [47, 6]), 280);
  later(() => open('small-tools', null, [40, 56]), 400);
  later(() => open('scraps', null, [56, 32]), 520);
}

setTimeout(() => {
  boot.classList.add('is-done'); wake();
  setTimeout(() => boot.remove(), 500);
}, reduced ? 0 : 460);
