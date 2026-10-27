// Reel: the homepage's scroll-story, for a list of works. Each step pins one piece on the stage;
// its title takes the marker, its tags circle the frame as torn scraps, ticks index the steps.
import {node, tear, scrap, still, phone} from './shared.js';

export function reel(mount, {heading, intro, items}) {
  const wrap = node('div', 'r-wrap');
  const stage = node('div', 'r-stage'), frame = node('a', 'r-frame'), stickers = node('div', 'r-stickers'), ticks = node('nav', 'r-ticks');
  stickers.setAttribute('aria-hidden', 'true'); ticks.setAttribute('aria-label', 'Pieces');
  const track = node('div', 'r-track');
  const head = node('header', 'r-intro');
  head.append(node('h1', '', heading)); if (intro) head.append(node('p', '', intro));
  track.append(head);

  const layers = items.map((item, i) => {
    const layer = node('div', 'r-layer');
    let media;
    if (item.video) {
      media = node('video'); media.muted = true; media.loop = true; media.playsInline = true; media.preload = 'none';
      if (item.poster) media.poster = item.poster;
    } else { media = node('img'); media.alt = ''; media.decoding = 'async'; }
    media.dataset.src = item.video || item.image;
    if (item.contain) layer.classList.add('is-contain');
    layer.append(media); frame.append(layer);
    const step = node('section', 'r-step'); step.dataset.index = i;
    const title = node('h2'); const link = node('a', 'marker', item.title); link.href = item.href || '#';
    title.append(link); step.append(title);
    if (item.line) step.append(node('p', 'r-line', item.line));
    track.append(step);
    const tick = node('button', 'r-tick'); tick.type = 'button'; tick.dataset.label = item.title; tick.setAttribute('aria-label', item.title);
    tick.addEventListener('click', () => scrollTo({top: scrollY + step.getBoundingClientRect().top - (phone.matches ? innerHeight * .5 : 88) + 2, behavior: still ? 'instant' : 'smooth'}));
    ticks.append(tick);
    return {item, layer, media, step, link, tick};
  });
  stage.append(frame, stickers, ticks);
  wrap.append(stage, track); mount.append(wrap);

  // Only the current piece and its neighbours load; only the current one plays.
  function load(i) { const l = layers[i]; if (l && !l.media.src) l.media.src = l.media.dataset.src; }
  let current = -1;
  function show(i) {
    if (i === current) return;
    current = i;
    layers.forEach((l, k) => {
      const on = k === i;
      l.layer.classList.toggle('is-on', on); l.link.classList.toggle('is-on', on);
      l.step.classList.toggle('is-active', on); l.tick.classList.toggle('is-active', on);
      if (l.media.tagName === 'VIDEO') { if (on && !still) l.media.play().catch(() => {}); else l.media.pause(); }
    });
    [i, i + 1, i - 1].forEach(load);
    const item = layers[i].item;
    frame.href = item.href || '#'; frame.setAttribute('aria-label', item.title);
    tags = item.tags || []; tagIndex = 0;
    for (const s of live) s.life = Math.min(s.life, (performance.now() - s.born) / 1000 + .5);
    if (layers[i].media.tagName === 'VIDEO' && !still) layers[i].media.play().catch(() => {});
  }

  /* Tags circling the frame, one torn scrap at a time. */
  let tags = [], tagIndex = 0, nextTag = 0;
  const live = [];
  function geometry() {
    const s = stage.getBoundingClientRect(), f = frame.getBoundingClientRect();
    return {cx: f.left - s.left + f.width / 2, cy: f.top - s.top + f.height / 2, rx: f.width * .56, ry: f.height * .56, w: s.width, h: s.height};
  }
  function spawn(t) {
    if (!tags.length) return;
    let best = 0, gap = -1;
    for (let k = 0; k < 12; k++) {
      const a = k / 12 * Math.PI * 2;
      const g = Math.min(9, ...live.map(s => Math.abs(Math.atan2(Math.sin(a - s.angle), Math.cos(a - s.angle)))));
      if (g > gap) { gap = g; best = a + (Math.random() - .5) * .3; }
    }
    const el = scrap(tags[tagIndex++ % tags.length]); stickers.append(el); tear(el.firstChild);
    live.push({el, angle: best, born: t, life: still ? 9 : 6 + Math.random() * 2, tilt: (Math.random() - .5) * 12, drift: (Math.random() < .5 ? -1 : 1) * (.03 + Math.random() * .03)});
  }
  let last = 0;
  function frameLoop(t) {
    const dt = Math.min(.05, (t - (last || t)) / 1000); last = t;
    const line = phone.matches ? innerHeight * .78 : 88 + (innerHeight - 88) * .5;
    let i = 0; layers.forEach((l, k) => { if (l.step.getBoundingClientRect().top < line) i = k; });
    show(i);
    const g = geometry(), max = Math.min(phone.matches ? 2 : 3, tags.length);
    if (t > nextTag && live.length < max) { spawn(t); nextTag = t + (still ? 2600 : 1500); }
    for (let k = live.length - 1; k >= 0; k--) {
      const s = live[k], age = (t - s.born) / 1000;
      if (age > s.life) { s.el.remove(); live.splice(k, 1); continue; }
      if (!still) s.angle += s.drift * dt;
      const w = s.el.offsetWidth, h = s.el.offsetHeight;
      const x = Math.max(w / 2 + 8, Math.min(g.w - w / 2 - (phone.matches ? 8 : 84), g.cx + Math.cos(s.angle) * g.rx));
      const y = Math.max(h / 2 + 8, Math.min(g.h - h / 2 - 8, g.cy + Math.sin(s.angle) * g.ry));
      const enter = Math.min(1, age / .45), exit = Math.min(1, (s.life - age) / .5);
      s.el.style.opacity = Math.min(enter, exit);
      s.el.style.transform = `translate(${x - w / 2}px,${y - h / 2}px) rotate(${s.tilt}deg) scale(${still ? 1 : .8 + .2 * enter})`;
    }
    requestAnimationFrame(frameLoop);
  }
  load(0); load(1);
  requestAnimationFrame(frameLoop);
}
