// Home: the whole introduction sits beside the flower on one screen. Pressing a word in it takes over the
// flower (by pressing study.js's own word buttons, so the five effects run unchanged), its tags circle the
// flower as torn paper, and a ghost brush plays when nobody does. Not used in the ?embed Bloom window.
import './home-story.css';

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
if (document.body.classList.contains('home-d')) {
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
const phone = matchMedia('(max-width: 600px)');
const headerHeight = () => document.querySelector('.site-header').offsetHeight;
const home = document.querySelector('#home-page');
const stage = document.querySelector('.d-stage'), flower = document.querySelector('#flower');
const layer = document.querySelector('.d-stickers');
stage.prepend(flower); stage.append(document.querySelector('#loading'));

/* ---------- Phones: study.js's touch hint sits under the flower until the visitor first touches it,
   so it reads as something to play with rather than a video. ---------- */
const hint = document.createElement('p'); hint.className = 'd-hint';
stage.append(hint);
const touchHint = document.querySelector('#touch-hint');
const syncHint = () => { hint.textContent = touchHint.textContent; };
new MutationObserver(syncHint).observe(touchHint, {childList: true, characterData: true, subtree: true}); syncHint();
let triedFlower = false;

let ghostPos = {x: .5, y: .5}, ghostTarget = {x: .3, y: .3}, ghostAt = 0;
let mode = null, modeAt = 0, touched = -1e9, ghosting = false, ghostDown = false;

/* ---------- The lines: the word playing takes the highlighter swipe ---------- */
const lines = [...document.querySelectorAll('.d-line')];
function setMode(next) {
  if (next === mode) return;
  mode = next; modeAt = performance.now();
  lines.forEach(l => {
    l.classList.toggle('is-active', l.dataset.mode === next);
    l.querySelector('.d-word')?.setAttribute('aria-pressed', l.dataset.mode === next);
  });
  ghost('pointerup'); choose(next);
  phrases = stickers[next] || []; phraseIndex = 0;
  for (const s of live) s.life = Math.min(s.life, (performance.now() - s.born) / 1000 + .6);
}
lines.forEach(l => l.querySelector('.d-word')?.addEventListener('click', () => setMode(l.dataset.mode)));

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
  if (t > nextSticker && live.length < max) { spawn(t, g); nextSticker = t + (still ? 2600 : 1300); }
  for (let i = live.length - 1; i >= 0; i--) {
    const s = live[i], age = (t - s.born) / 1000;
    if (age > s.life) s.life = Math.min(s.life, age + .6);
    if (age > s.life) { s.el.remove(); live.splice(i, 1); continue; }
    if (!still) s.angle += s.drift * dt;
    s.w = s.el.offsetWidth; s.h = s.el.offsetHeight; // fonts may still be arriving
    const x = Math.max(s.w / 2 + 8, Math.min(g.w - s.w / 2 - 8, g.cx + Math.cos(s.angle) * g.rx));
    const y = Math.max(s.h / 2 + 8, Math.min(g.h - s.h / 2 - (phone.matches ? 66 : 12), g.cy + Math.sin(s.angle) * g.ry));
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
// Chrome sends a pointermove after every scroll so hover can catch up. The pointer has not moved, so it is not
// a visitor playing, and counting it held the ghost back: art, which only moves under a brush, stayed whole.
let lastX = null, lastY = null;
for (const type of ['pointerdown', 'pointermove']) flower.addEventListener(type, e => {
  if (ghosting) return;
  const moved = Math.hypot(e.clientX - lastX, e.clientY - lastY) > 2 || lastX === null;
  lastX = e.clientX; lastY = e.clientY;
  if (type === 'pointerdown' || e.pointerType === 'mouse' && moved) { if (ghostDown) ghost('pointerup'); touched = performance.now(); }
  if (type === 'pointerdown') triedFlower = true;
});

/* ---------- Loop ---------- */
let last = 0;
function frame(t) {
  const dt = Math.min(.05, (t - (last || t)) / 1000); last = t;
  if (!home.hidden && stage.getBoundingClientRect().bottom > 0) {
    // The ghost waits 5s after a visitor's own strokes, except for the opening pass when a line is chosen: then
    // it only waits for the pointer to rest, so every effect starts at once rather than seconds later.
    const opening = t - modeAt < 2200;
    if (!still && (t - touched > 5000 || opening && t - touched > 400)) sweep(t);
    stickersFrame(t, dt);
    hint.classList.toggle('is-on', !triedFlower && mode !== 'bloom');
  }
  requestAnimationFrame(frame);
}
whenReady().then(() => { setMode('bloom'); requestAnimationFrame(frame); });
}
