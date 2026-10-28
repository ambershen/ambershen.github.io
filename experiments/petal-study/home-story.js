// Home story: the introduction scrolls past a pinned flower. Each line takes over the flower (by pressing
// study.js's own word buttons, so the five effects run unchanged), its tags circle the flower as torn
// paper, a ghost brush plays when nobody does, and the last step drops the flower into water where the
// selected work surfaces. Not used in the ?embed Bloom window.
import './home-story.css';
import {createWater} from './home-water.js';

const button = id => id === 'play' ? document.querySelector('#play') : document.querySelector(`[data-mode="${id}"]`);
const choose = id => { const b = button(id); if (b && !b.disabled) b.click(); };
// Every effect can start once the pencil drawing and the portrait (loaded after the flower) are in.
const whenReady = () => new Promise(resolve => {
  const ids = ['bloom', 'art', 'narrative', 'code', 'chaos', 'play'];
  const check = () => ids.every(id => button(id) && !button(id).disabled) ? resolve() : setTimeout(check, 120);
  check();
});

/* ---------- Content: tags for what the introduction leaves unsaid; the greeting and chaos have none. ---------- */
const stickers = {
  bloom: [],
  art: ['painting', 'typography', 'digital media', 'visual experiments'],
  narrative: ['visual storytelling', 'branding', 'filming', 'voice design'],
  code: ['creative coding', 'agent building', 'design tools'],
  chaos: [],
  play: ['wearables', 'physical objects', 'everyday materials'],
};
const work = [
  {title: 'Natural Effects as the New Brush', href: '/work/natural-expressions/', image: new URL('../../images/natural-expressions/water-demo.jpg', import.meta.url).href},
  {title: 'Soft Matter', href: '/work/soft-matter/', image: new URL('../../images/soft-matter/tangle.png', import.meta.url).href, fit: 'contain', ground: '#131315'},
];

if (document.body.classList.contains('home-d')) {
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
const phone = matchMedia('(max-width: 600px)');
const headerHeight = () => document.querySelector('.site-header').offsetHeight;
const home = document.querySelector('#home-page');
const stage = document.querySelector('.d-stage'), flower = document.querySelector('#flower');
const steps = [...document.querySelectorAll('.d-step')];
const layer = document.querySelector('.d-stickers'), links = document.querySelector('.d-links');
const waterCanvas = document.querySelector('.d-water');
stage.prepend(flower); stage.append(document.querySelector('#loading'));

let ghostPos = {x: .5, y: .5}, ghostTarget = {x: .3, y: .3}, ghostAt = 0;
let ready = false, mode = null, modeAt = 0, touched = -1e9, ghosting = false, ghostDown = false;

/* ---------- Ticks: a quiet chapter index on the right edge ---------- */
const ticks = document.querySelector('.d-ticks');
// On phones a step is current only while its line sits in the band under the flower, so tags never outlive their sentence.
const phoneLine = () => innerHeight * .92;
const jump = s => scrollTo({top: scrollY + s.getBoundingClientRect().top + 2 - (phone.matches ? phoneLine() - 40 : headerHeight()), behavior: still ? 'instant' : 'smooth'});
const tickButtons = steps.map(s => {
  const b = document.createElement('button'); b.type = 'button'; b.className = 'd-tick';
  b.setAttribute('aria-label', s.dataset.label); b.dataset.label = s.dataset.label;
  b.addEventListener('click', () => jump(s));
  ticks.append(b); return b;
});
steps.forEach(s => s.querySelector('.d-word')?.addEventListener('click', () => jump(s)));
// 'my featured work' scrolls to the Selected work step instead of leaving the page.
document.querySelectorAll('[data-jump]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); jump(steps.find(s => s.dataset.mode === a.dataset.jump)); }));

/* ---------- Which step is current ---------- */
function current() {
  const line = phone.matches ? phoneLine() : headerHeight() + (innerHeight - headerHeight()) * .5;
  let index = 0;
  steps.forEach((s, i) => { if (s.getBoundingClientRect().top < line) index = i; });
  const r = steps[index].getBoundingClientRect();
  return {index, progress: Math.max(0, Math.min(1, (line - r.top) / r.height))};
}
function setMode(next) {
  if (next === mode) return;
  const leaving = mode;
  mode = next; modeAt = performance.now();
  steps.forEach(s => s.classList.toggle('is-active', s.dataset.mode === next));
  if (next === 'work') enterWork();
  else {
    if (leaving === 'work') leaveWork();
    ghost('pointerup'); choose(next);
  }
  phrases = stickers[next] || []; phraseIndex = 0;
  for (const s of live) s.life = Math.min(s.life, (performance.now() - s.born) / 1000 + .6);
}

/* ---------- Stickers circling the flower ---------- */
let phrases = [], phraseIndex = 0, nextSticker = 0, paperIndex = 0;
const live = [];
function flowerGeometry() {
  const s = stage.getBoundingClientRect(), f = flower.getBoundingClientRect();
  const r = Math.min(f.width, f.height) * .4;
  return {cx: f.left - s.left + f.width / 2, cy: f.top - s.top + f.height * .45, rx: r * (phone.matches ? 1.02 : 1.2), ry: r * 1.02, w: s.width, h: s.height};
}
function spawn(t, g) {
  if (!phrases.length) return;
  const text = phrases[phraseIndex++ % phrases.length];
  // Pick the free-est spot on the orbit.
  let best = 0, bestGap = -1;
  for (let k = 0; k < 16; k++) {
    const angle = k / 16 * Math.PI * 2;
    const gap = Math.min(9, ...live.map(s => Math.abs(Math.atan2(Math.sin(angle - s.angle), Math.cos(angle - s.angle)))));
    if (gap > bestGap) { bestGap = gap; best = angle + (Math.random() - .5) * .3; }
  }
  const el = document.createElement('span');
  el.className = 'd-sticker';
  const paper = document.createElement('span'); paper.className = 'd-paper'; paper.textContent = text;
  el.append(paper); layer.append(el);
  tear(paper);
  live.push({el, angle: best, born: t, life: still ? 9 : 6.5 + Math.random() * 2, tilt: (Math.random() - .5) * 14, drift: (Math.random() < .5 ? -1 : 1) * (.04 + Math.random() * .04), w: el.offsetWidth, h: el.offsetHeight});
}
function stickersFrame(t, dt) {
  const g = flowerGeometry(), max = Math.min(phone.matches ? 3 : 5, phrases.length);
  if (mode !== 'work' && t > nextSticker && live.length < max) { spawn(t, g); nextSticker = t + (still ? 2600 : 1300); }
  for (let i = live.length - 1; i >= 0; i--) {
    const s = live[i], age = (t - s.born) / 1000;
    if (age > s.life || mode === 'work' && age > .1 && s.life > age + .6) s.life = Math.min(s.life, age + .6);
    if (age > s.life) { s.el.remove(); live.splice(i, 1); continue; }
    if (!still) s.angle += s.drift * dt;
    s.w = s.el.offsetWidth; s.h = s.el.offsetHeight; // fonts may still be arriving
    const x = Math.max(s.w / 2 + 8, Math.min(g.w - s.w / 2 - 8, g.cx + Math.cos(s.angle) * g.rx));
    const y = Math.max(s.h / 2 + 8, Math.min(g.h - s.h / 2 - 12, g.cy + Math.sin(s.angle) * g.ry));
    const enter = Math.min(1, age / .45), exit = Math.min(1, (s.life - age) / .6);
    const pop = still ? 1 : .7 + .3 * (1 - (1 - enter) ** 3) + Math.sin(enter * Math.PI) * .06;
    s.el.style.opacity = Math.min(enter, exit);
    s.el.style.transform = `translate(${x - s.w / 2}px,${y - s.h / 2}px) rotate(${s.tilt + (still ? 0 : Math.sin(age * .8) * 1.5)}deg) scale(${pop})`;
  }
}

/* A torn scrap: ragged left and right edges, slightly uneven top and bottom, a soft fold. */
function tear(paper) {
  const w = paper.offsetWidth, h = paper.offsetHeight, pts = [], j = (a) => (Math.random() * a).toFixed(1);
  for (let x = 0; x <= w; x += 9) pts.push(`${x}px ${j(1.6)}px`);
  for (let y = 0; y <= h; y += 4) pts.push(`calc(100% - ${j(4)}px) ${y}px`);
  for (let x = w; x >= 0; x -= 9) pts.push(`${x}px calc(100% - ${j(1.6)}px)`);
  for (let y = h; y >= 0; y -= 4) pts.push(`${j(4)}px ${y}px`);
  paper.style.clipPath = `polygon(${pts.join(",")})`;
  paper.style.setProperty("--fold", `${20 + Math.random() * 60}%`);
  paper.style.setProperty("--fold-angle", `${80 + Math.random() * 40}deg`);
}

/* ---------- Ghost brush: plays the current effect while nobody touches the flower ---------- */
function ghost(type, x = .5, y = .5) {
  if (type === 'pointerup' && !ghostDown) return;
  const r = flower.getBoundingClientRect(), s = Math.min(r.width, r.height);
  ghosting = true;
  flower.dispatchEvent(new PointerEvent(type, {bubbles: true, isPrimary: true, pointerId: 77, pointerType: 'mouse', buttons: ghostDown || type === 'pointerdown' ? 1 : 0,
    clientX: r.left + r.width / 2 + (x - .5) * s * .8, clientY: r.top + r.height * .45 + (y - .5) * s * .8}));
  ghosting = false;
  if (type === 'pointerdown') ghostDown = true; if (type === 'pointerup') ghostDown = false;
}
function sweep(t) {
  const k = (t - modeAt) / 1000;
  if (mode === 'bloom' && k < 4 || mode === 'chaos' || mode === 'play' && k < 7.5) return;
  // Short passes with rests between them, so the flower has time to grow back.
  if (mode !== 'code' && mode !== 'narrative' && k % 9 > 2.2) return;
  // Wander: head for a random point on the flower, pick another on arrival, with a little hand tremor.
  const dt = Math.min(.05, (t - (ghostAt || t)) / 1000); ghostAt = t;
  const dx = ghostTarget.x - ghostPos.x, dy = ghostTarget.y - ghostPos.y, d = Math.hypot(dx, dy);
  if (d < .04) ghostTarget = {x: .2 + Math.random() * .6, y: .18 + Math.random() * .62};
  const speed = mode === 'narrative' ? 1.5 : mode === 'code' ? .6 : 1.1; // code: a slow pass that only lifts petals, never drags them
  ghostPos.x += dx / (d || 1) * Math.min(d, speed * dt) + (Math.random() - .5) * .012;
  ghostPos.y += dy / (d || 1) * Math.min(d, speed * dt) + (Math.random() - .5) * .012;
  const x = ghostPos.x, y = ghostPos.y;
  ghost('pointermove', x, y);
}
for (const type of ['pointerdown', 'pointermove']) flower.addEventListener(type, e => {
  if (ghosting) return;
  if (type === 'pointerdown' || e.pointerType === 'mouse') { if (ghostDown) ghost('pointerup'); touched = performance.now(); }
});

/* ---------- Selected work: the flower sinks into water and the covers surface ---------- */
const water = createWater(waterCanvas);
const picture = document.createElement('canvas'), pc = picture.getContext('2d');
const snapshot = document.createElement('canvas'), covers = document.createElement('canvas');
let blend = 0, blendTarget = 0, tiles = [], dpr = 1;
let coversLoading = false;
function loadCovers() {
  if (coversLoading) return; coversLoading = true;
  for (const item of work) { item.img = new Image(); item.img.crossOrigin = 'anonymous'; item.img.onload = paintCovers; item.img.src = item.image; }
}
function layoutTiles(w, h) {
  const cols = phone.matches ? 1 : 2, rows = Math.ceil(work.length / cols);
  const box = phone.matches ? {x: w * .06, y: h * .04, w: w * .88, h: h * .9} : {x: w * .32, y: h * .14, w: w * .62, h: h * .66};
  const gap = phone.matches ? 12 : 22, label = phone.matches ? 26 : 38;
  const tw = (box.w - gap * (cols - 1)) / cols, th = (box.h - gap * (rows - 1)) / rows - label;
  return work.map((item, i) => ({item, x: box.x + (i % cols) * (tw + gap), y: box.y + Math.floor(i / cols) * (th + label + gap), w: tw, h: th, label}));
}
function paintCovers() {
  const w = stage.clientWidth, h = stage.clientHeight;
  covers.width = w * dpr; covers.height = h * dpr;
  const c = covers.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0);
  tiles = layoutTiles(w, h);
  for (const t of tiles) {
    const img = t.item.img;
    c.fillStyle = t.item.ground || '#15120f'; c.fillRect(t.x, t.y, t.w, t.h);
    if (img && (img.naturalWidth || img.videoWidth)) {
      const iw = img.naturalWidth || img.videoWidth, ih = img.naturalHeight || img.videoHeight, k = (t.item.fit === 'contain' ? Math.min : Math.max)(t.w / iw, t.h / ih) * (t.item.fit === 'contain' ? .9 : 1);
      c.save(); c.beginPath(); c.rect(t.x, t.y, t.w, t.h); c.clip();
      c.drawImage(img, t.x + (t.w - iw * k) / 2, t.y + (t.h - ih * k) / 2, iw * k, ih * k); c.restore();
    }
    c.fillStyle = document.documentElement.dataset.theme === 'light' ? '#2a211c' : '#eee8e4'; c.font = `400 ${phone.matches ? 17 : 24}px 'Cormorant Garamond', serif`; c.textBaseline = 'top';
    c.fillText(t.item.title, t.x, t.y + t.h + (phone.matches ? 6 : 10));
  }
  links.replaceChildren(...tiles.map(t => {
    const a = document.createElement('a'); a.href = t.item.href; a.setAttribute('aria-label', t.item.title);
    Object.assign(a.style, {left: t.x + 'px', top: t.y + 'px', width: t.w + 'px', height: t.h + t.label + 'px'});
    return a;
  }));
  if (mode === 'work') composeWater();
}
function composeWater() {
  pc.setTransform(1, 0, 0, 1, 0, 0); pc.clearRect(0, 0, picture.width, picture.height);
  pc.globalAlpha = 1 - blend; pc.drawImage(snapshot, 0, 0);
  pc.globalAlpha = blend; pc.drawImage(covers, 0, 0); pc.globalAlpha = 1;
  water?.source(picture);
}
function sizeWater() {
  dpr = Math.min(1.5, devicePixelRatio || 1);
  const w = stage.clientWidth, h = stage.clientHeight;
  for (const c of [waterCanvas, picture, snapshot]) { c.width = w * dpr; c.height = h * dpr; }
  water?.resize(w, h); paintCovers();
}
function enterWork() {
  ghost('pointerup');
  const s = stage.getBoundingClientRect(), f = flower.getBoundingClientRect(), sc = snapshot.getContext('2d');
  sc.clearRect(0, 0, snapshot.width, snapshot.height);
  sc.drawImage(flower, (f.left - s.left) * dpr, (f.top - s.top) * dpr, f.width * dpr, f.height * dpr);
  stage.classList.add('is-work'); blend = 0; blendTarget = 1; composeWater();
  if (water) { const g = flowerGeometry(); water.drop(g.cx / g.w, g.cy / g.h, 18, 14); }
}
function leaveWork() {
  stage.classList.remove('is-work'); blendTarget = 0;
}
stage.addEventListener('pointermove', e => {
  if (mode !== 'work' || !water) return;
  const r = stage.getBoundingClientRect();
  water.drop((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height, phone.matches ? 4 : 3, e.pointerType === 'mouse' ? 1.6 : 3);
});
stage.addEventListener('pointerdown', e => {
  if (mode !== 'work' || !water) return;
  const r = stage.getBoundingClientRect();
  water.drop((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height, 6, 8);
});

/* ---------- Loop ---------- */
let last = 0, idleDrop = 0;
function frame(t) {
  const dt = Math.min(.05, (t - (last || t)) / 1000); last = t;
  const onScreen = !home.hidden && stage.getBoundingClientRect().bottom > 0;
  if (ready && onScreen) {
    const {index, progress} = current();
    if (index >= steps.length - 3) loadCovers();
    setMode(steps[index].dataset.mode);
    tickButtons.forEach((b, i) => b.classList.toggle('is-active', i === index));
    if (mode !== 'work' && !still && t - touched > 5000) sweep(t);
    stickersFrame(t, dt);
    if (mode === 'work' && water) {
      if (blend < blendTarget) { blend = Math.min(1, blend + dt / 1.4); composeWater(); }
      idleDrop -= dt;
      if (!still && idleDrop < 0) { idleDrop = 2 + Math.random() * 2; water.drop(Math.random(), Math.random(), 4, 2.5); }
      water.step(); water.render();
    }
  }
  requestAnimationFrame(frame);
}
new ResizeObserver(sizeWater).observe(stage);
// Titles are painted into the water picture, so repaint them when the theme changes.
new MutationObserver(paintCovers).observe(document.documentElement, {attributes: true, attributeFilter: ['data-theme']});
whenReady().then(() => { ready = true; sizeWater(); requestAnimationFrame(frame); });
}
