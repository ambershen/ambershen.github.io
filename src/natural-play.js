// Playable Water / Sand / Ice tiles: small versions of the Natural Effects studies.
// Sand and ice run the original study code (src/natural-effects, from the naturaleffects prototype);
// water is a light ripple field over the pool photo. One speaker toggle governs every tile's sound.
// Used on the home feature card, the Work overview and the case-study hero.
import './natural-play.css';
import {SandSurface} from './natural-effects/SandSurface';
import {GranularRenderer} from './natural-effects/GranularRenderer';
import {MaterialSound} from './natural-effects/MaterialSound';
import {IceFractures} from './natural-effects/IceFractures';
import {IceWriting} from './natural-effects/IceWriting';
import {IceSound} from './natural-effects/IceSound';
import {WaterSoundscape} from './natural-effects/WaterSoundscape';

const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
const hover = matchMedia('(hover: hover)').matches;
const hints = {water: hover ? 'Move to ripple' : 'Touch to ripple', sand: 'Draw in the sand', ice: 'Press and hold'};
const waterSrc = new URL('../images/natural-expressions/water.jpg', import.meta.url).href;

/* ---------- Sound: each tile carries its own speaker; browsers allow sound only after a touch ---------- */
const speaker = on => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/>${on
  ? '<path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>'
  : '<path d="M16 9.5l5 5M21 9.5l-5 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>'}</svg>`;

const seen = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
  for (const e of entries) e.target._np?.visible(e.isIntersecting);
}, {rootMargin: '100px 0px'}) : null;

export function naturalTile(id, title = id) {
  const tile = document.createElement('div');
  tile.className = 'np-tile'; tile.dataset.material = id;
  const canvas = document.createElement('canvas');
  canvas.setAttribute('role', 'img'); canvas.setAttribute('aria-label', `Interactive ${title.toLowerCase()} surface`);
  const hint = document.createElement('span'); hint.className = 'np-hint'; hint.textContent = hints[id];
  const toggle = document.createElement('button'); toggle.type = 'button'; toggle.className = 'np-sound';
  tile.append(canvas, hint, toggle);
  const sim = {water, sand, ice}[id](canvas);
  let soundOn = true;
  const paint = () => { toggle.innerHTML = speaker(soundOn); toggle.setAttribute('aria-pressed', String(soundOn)); toggle.setAttribute('aria-label', `${soundOn ? 'Mute' : 'Play'} ${title.toLowerCase()} sound`); };
  paint();
  toggle.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); soundOn = !soundOn; if (soundOn) { sim.unmute(); sim.unlock(); } else sim.mute(); paint(); });
  let shown = !seen, raf = 0, last = 0, played = false, ptr = null;

  function frame(t) {
    raf = 0;
    const dt = Math.min(.05, (t - (last || t)) / 1000); last = t;
    if (sim.step(dt, ptr, t) && shown) raf = requestAnimationFrame(frame); else last = 0;
  }
  const wake = () => { if (!raf && shown) raf = requestAnimationFrame(frame); };
  sim.wake = wake;
  function size() {
    const r = tile.getBoundingClientRect();
    if (r.width < 8 || r.height < 8) return;
    sim.resize(r.width, r.height); wake();
  }
  tile._np = {visible(v) { shown = v; if (v) wake(); else sim.release(); }};
  seen?.observe(tile);
  new ResizeObserver(size).observe(tile);

  const at = e => { const r = canvas.getBoundingClientRect(); return {x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height}; };
  canvas.addEventListener('pointerdown', e => {
    e.preventDefault(); canvas.setPointerCapture?.(e.pointerId);
    if (soundOn) sim.unlock();
    ptr = {...at(e), down: true}; sim.press(ptr, e);
    if (!played) { played = true; tile.classList.add('is-played'); }
    wake();
  });
  canvas.addEventListener('pointermove', e => {
    const p = at(e);
    if (ptr?.down) { sim.drag(ptr, p, e); Object.assign(ptr, p); }
    else if (e.pointerType === 'mouse') { sim.hover?.(ptr, p); ptr = {...p, down: false}; }
    wake();
  });
  // A touch pointerdown is not a user activation on mobile; pointerup is, so unlock sound there too.
  const up = e => { if (e.type === 'pointerup' && soundOn) sim.unlock(); if (ptr) ptr.down = false; sim.release(); };
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', up);
  canvas.addEventListener('pointerleave', () => { if (!ptr?.down) ptr = null; });
  // The tiles sit inside links: playing must not navigate or start a link drag.
  tile.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); });
  tile.addEventListener('dragstart', e => e.preventDefault());
  return tile;
}

/* ---------- Water: a damped wave field refracting a photo of a pool, with the study's pond recordings ---------- */
function water(canvas) {
  const ctx = canvas.getContext('2d', {willReadFrequently: true});
  const photo = new Image(); photo.src = waterSrc;
  const sound = new WaterSoundscape();
  let w = 0, h = 0, a, b, src, out, idle = 0, touching = false, muted = false;
  function bake() {
    if (!w || !photo.complete || !photo.naturalWidth) return;
    // Crop above the prototype toolbar baked into the poster.
    const sw = photo.naturalWidth - 24, sh = photo.naturalHeight * .78, k = Math.max(w / sw, h / sh);
    const cw = w / k, ch = h / k;
    ctx.drawImage(photo, 24 + (sw - cw) / 2, (sh - ch) / 2, cw, ch, 0, 0, w, h);
    src = ctx.getImageData(0, 0, w, h).data; out = ctx.createImageData(w, h);
  }
  photo.onload = () => { bake(); api.wake?.(); };
  function drop(x, y, r, s) {
    const cx = x * w, cy = y * h;
    for (let j = Math.max(1, cy - r | 0); j < Math.min(h - 1, cy + r + 1); j++)
      for (let i = Math.max(1, cx - r | 0); i < Math.min(w - 1, cx + r + 1); i++) {
        const d = Math.hypot(i - cx, j - cy) / r;
        if (d < 1) a[j * w + i] += s * (.5 + .5 * Math.cos(d * Math.PI));
      }
  }
  const listen = p => { if (!muted) sound.touch(p.x, p.y, performance.now()); };
  const api = {
    unlock() { muted = false; if (!sound.active) void sound.enable().catch(() => {}); else sound.unlock(); },
    mute() { muted = true; sound.mute(); },
    unmute() { muted = false; },
    resize(cw, chh) {
      const scale = Math.min(.6, 340 / cw);
      w = Math.max(40, cw * scale | 0); h = Math.max(40, chh * scale | 0);
      canvas.width = w; canvas.height = h;
      a = new Float32Array(w * h); b = new Float32Array(w * h); bake();
    },
    hover(prev, p) {
      if (prev) { const v = Math.min(1, Math.hypot(p.x - prev.x, p.y - prev.y) * 40); drop(p.x, p.y, 3.5, 2.2 * v); }
      listen(p); idle = 0;
    },
    press(p) { drop(p.x, p.y, 6, 9); idle = 0; touching = true; listen(p); },
    drag(prev, p) { const v = Math.min(1, Math.hypot(p.x - prev.x, p.y - prev.y) * 40); drop(p.x, p.y, 4, 2.6 + 3 * v); listen(p); },
    release() { if (touching) { touching = false; sound.release(); } },
    step(dt, ptr, now) {
      if (!src) return false;
      sound.tick(now);
      idle += dt;
      if (!still && idle > 2.4) { idle = Math.random() * 1.2; drop(.15 + Math.random() * .7, .15 + Math.random() * .7, 4, 4); }
      let e = 0;
      for (let j = 1; j < h - 1; j++) for (let i = 1, k = j * w + 1; i < w - 1; i++, k++) {
        const v = ((a[k - 1] + a[k + 1] + a[k - w] + a[k + w]) * .5 - b[k]) * .985;
        b[k] = v; e += v * v;
      }
      [a, b] = [b, a];
      const o = out.data;
      for (let j = 0; j < h; j++) for (let i = 0, k = j * w; i < w; i++, k++) {
        const dx = i > 0 && i < w - 1 ? a[k - 1] - a[k + 1] : 0, dy = j > 0 && j < h - 1 ? a[k - w] - a[k + w] : 0;
        const sx = Math.min(w - 1, Math.max(0, i + dx * 1.6 | 0)), sy = Math.min(h - 1, Math.max(0, j + dy * 1.6 | 0));
        const s = (sy * w + sx) * 4, l = 1 + (dx + dy) * .035, q = k * 4;
        o[q] = src[s] * l; o[q + 1] = src[s + 1] * l; o[q + 2] = src[s + 2] * l; o[q + 3] = 255;
      }
      ctx.putImageData(out, 0, 0);
      return !still || e / (w * h) > 1e-4 || ptr;
    },
  };
  return api;
}

/* ---------- Sand: the study's SandSurface + GranularRenderer, with one stroke already traced ---------- */
function sand(canvas) {
  let renderer = null;
  try { renderer = new GranularRenderer(canvas); } catch { canvas.parentElement?.classList.add('np-flat'); }
  const sound = new MaterialSound([{file: 'sand-pour.mp3', from: 8, to: 15, lowpass: 3600}]);
  const R = 9; // fingertip radius in CSS px, a little under the full-screen study's 13
  let surface, w = 1, h = 1, contact = null, dirty = true, settlingUntil = 0;
  function stamp(x, y, r, load, amount, mx = 0, my = 0) {
    const s = surface.width / w;
    surface.touch(x * s, y * surface.height / h, r * s, load, amount, mx, my);
    dirty = true; settlingUntil = performance.now() + 4100;
  }
  function trace(x0, y0, x1, y1, load, mx, my) {
    const steps = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / Math.max(2, R * .22)));
    for (let i = 1; i <= steps; i++) stamp(x0 + (x1 - x0) * i / steps, y0 + (y1 - y0) * i / steps, R, load, .42, mx, my);
  }
  return {
    unlock() { void sound.unlock().catch(() => {}); },
    mute() { sound.enabled = false; sound.quiet(); },
    unmute() { sound.enabled = true; },
    resize(cw, ch) {
      if (!renderer) return;
      w = cw; h = ch;
      const dpr = Math.min(1.5, devicePixelRatio || 1, 1800 / Math.max(w, h));
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      const scale = Math.min(1, 560 / Math.max(w, h));
      surface = new SandSurface(Math.max(24, Math.round(w * scale)), Math.max(24, Math.round(h * scale)));
      // One unhurried stroke across the dune, settled before it is shown.
      let px, py;
      for (let t = 0; t <= 1.0001; t += .02) {
        const m = Math.min(w, h), x = w / 2 + m * (.6 * t - .3), y = h * .55 + m * (.08 - .22 * Math.sin(t * Math.PI * 1.15) + .08 * t);
        if (px !== undefined) trace(px, py, x, y, .35, x - px, y - py);
        px = x; py = y;
      }
      for (let i = 0; i < 80; i++) surface.settle(.05);
      contact = null; dirty = true; settlingUntil = 0;
    },
    press(p, e) {
      if (!surface) return;
      const x = p.x * w, y = p.y * h, pen = e.pointerType === 'pen' ? e.pressure : 0;
      contact = {x, y, load: .08, pen, lastMove: performance.now(), speed: 0};
      stamp(x, y, R, Math.max(.08, pen), .45);
    },
    drag(prev, p, e) {
      const c = contact; if (!c) return;
      const now = performance.now(), x = p.x * w, y = p.y * h, d = Math.hypot(x - c.x, y - c.y);
      c.pen = e.pointerType === 'pen' ? e.pressure : 0;
      if (d <= .7) return;
      const elapsed = Math.max(8, now - c.lastMove);
      c.speed = Math.min(1800, d / elapsed * 1000);
      if (c.speed > 25) c.load = Math.max(.08, c.load - elapsed / 1000 * 1.8);
      trace(c.x, c.y, x, y, Math.max(c.load, c.pen), x - c.x, y - c.y);
      c.x = x; c.y = y; c.lastMove = now;
    },
    release() { contact = null; sound.quiet(); },
    step(dt, ptr, now) {
      if (!renderer || !surface) return false;
      const c = contact;
      if (c) {
        // Holding still sinks deeper, as in the study.
        const held = now - c.lastMove > 85;
        if (held || c.speed < 18) { c.load = Math.min(1, c.load + dt * .28); stamp(c.x, c.y, R, Math.max(c.load, c.pen), 1 - Math.exp(-dt * 14)); }
        const speed = held ? 0 : c.speed;
        sound.set(0, speed > 3 ? Math.min(.22, .022 + speed / 2200) : 0, c.x / w);
      }
      if (dirty || now < settlingUntil) { surface.settle(dt); renderer.render(surface, w, h); dirty = false; }
      return Boolean(c) || now < settlingUntil;
    },
  };
}

/* ---------- Ice: the study's frost, plates, writing and fractures, drawn at a smaller scale ---------- */
function ice(canvas) {
  const ctx = canvas.getContext('2d');
  const surface = document.createElement('canvas'), frost = surface.getContext('2d');
  const writing = new IceWriting(), fractures = new IceFractures(), sound = new IceSound();
  const rand = (a, b) => a + Math.random() * (b - a);
  let W = 1, H = 1, k = 1, hand = null, idle = 0;
  // The study's surface, as written there: gradient, clouding, trapped bubbles, abrasion, crystals and sheen.
  function paint(w, h) {
    const g = frost, grad = g.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#e6e7e5'); grad.addColorStop(.35, '#c4c7c5'); grad.addColorStop(.7, '#989e9c'); grad.addColorStop(1, '#d6d8d5');
    g.fillStyle = grad; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 35; i++) {
      const x = rand(0, w), y = rand(0, h), r = rand(40, Math.max(80, w * .4));
      const glow = g.createRadialGradient(x, y, 0, x, y, r);
      glow.addColorStop(0, i % 3 ? '#f7f8f516' : '#454b4820'); glow.addColorStop(1, '#eff0ed00');
      g.fillStyle = glow; g.fillRect(x - r, y - r, r * 2, r * 2);
    }
    for (let i = 0; i < w * h / 900; i++) {
      const x = rand(0, w), y = rand(0, h), r = rand(.3, 2.8);
      g.beginPath(); g.ellipse(x, y, r, r * .6, -.4, 0, Math.PI * 2);
      g.strokeStyle = '#fafbf835'; g.lineWidth = .7; g.stroke();
    }
    for (let i = 0; i < 500; i++) {
      const x = rand(0, w), y = rand(0, h);
      g.strokeStyle = '#f7f8f50b'; g.lineWidth = .5; g.beginPath(); g.moveTo(x, y); g.lineTo(x + rand(5, 90), y - rand(2, 30)); g.stroke();
    }
    for (let i = 0; i < w * h / 7; i++) {
      const x = rand(0, w), y = rand(0, h), r = rand(.3, 1.2);
      const density = (Math.sin(x * .013 + y * .006) + Math.sin(y * .018 - x * .008) + 2) / 4;
      g.globalAlpha = .08 + density * .28; g.fillStyle = i % 5 ? '#fffffa' : '#707973'; g.fillRect(x, y, r, r);
    }
    g.globalAlpha = 1;
    const sheen = g.createLinearGradient(0, 0, w, h);
    sheen.addColorStop(0, '#fafbf800'); sheen.addColorStop(.25, '#fafbf800'); sheen.addColorStop(.36, '#fafbf838'); sheen.addColorStop(.43, '#fafbf808'); sheen.addColorStop(1, '#fafbf800');
    g.fillStyle = sheen; g.fillRect(0, 0, w, h);
  }
  return {
    unlock() { void sound.unlock().catch(() => {}); },
    mute() { sound.enabled = false; sound.quiet(); },
    unmute() { sound.enabled = true; },
    resize(cw, ch) {
      // Simulate at study scale (about 640px on the long side), then draw it down into the tile.
      k = Math.max(1, 640 / Math.max(cw, ch)); W = cw * k; H = ch * k;
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(cw * dpr); canvas.height = Math.round(ch * dpr);
      ctx.setTransform(dpr / k, 0, 0, dpr / k, 0, 0);
      surface.width = W; surface.height = H; writing.resize(W, H); paint(W, H);
      hand = null; sound.quiet(); writing.reset(); fractures.reset(W, H); idle = 0;
    },
    press(p, e) {
      const x = p.x * W, y = p.y * H;
      hand = {id: e.pointerId, x, y, px: x, py: y, vx: 0, vy: 0, t: performance.now(), stress: 0, pressure: e.pointerType === 'pen' ? e.pressure : 0};
    },
    drag(prev, p, e) {
      if (!hand) return;
      const now = performance.now(), x = p.x * W, y = p.y * H, dx = x - hand.x, dy = y - hand.y, dt = Math.max(8, now - hand.t) / 1000;
      if (Math.hypot(dx, dy) > 1) { writing.rub(hand.x, hand.y, x, y, Math.min(.15, dt)); hand.stress = Math.max(0, hand.stress - Math.hypot(dx, dy) * .015); }
      hand.vx = dx / dt; hand.vy = dy / dt; hand.x = x; hand.y = y; hand.t = now;
      hand.pressure = e.pointerType === 'pen' ? e.pressure : 0;
    },
    release() { if (hand) { fractures.release(hand.id); sound.release(hand.id); hand = null; } },
    step(dt, ptr, now) {
      dt = Math.min(.04, dt);
      ctx.drawImage(surface, 0, 0, W, H);
      const p = hand;
      if (p) {
        const held = now - p.t > 180 || Math.hypot(p.vx, p.vy) < 8;
        if (held) p.stress = Math.min(4, p.stress + dt * (1 + p.pressure));
        const growth = fractures.press(p.id, p, p.stress, dt);
        sound.fracture(p.id, growth, p.x / W, now);
        if (now - p.t < 90) sound.motion(Math.hypot(p.vx, p.vy), p.x / W, now);
        const follow = 1 - Math.exp(-dt * 19); p.px += (p.x - p.px) * follow; p.py += (p.y - p.py) * follow;
      }
      fractures.draw(ctx, surface, dt);
      writing.draw(ctx, now, dt);
      if (p) {
        const r = 24 + p.stress * 3, wet = ctx.createRadialGradient(p.px, p.py, 0, p.px, p.py, r);
        wet.addColorStop(0, 'rgba(72,82,75,.09)'); wet.addColorStop(1, 'rgba(72,82,75,0)'); ctx.fillStyle = wet; ctx.fillRect(p.px - r, p.py - r, r * 2, r * 2);
        const shine = ctx.createRadialGradient(p.px - 6, p.py - 7, 0, p.px - 6, p.py - 7, r * .75);
        shine.addColorStop(0, 'rgba(255,255,250,.10)'); shine.addColorStop(1, 'rgba(255,255,250,0)'); ctx.fillStyle = shine; ctx.fillRect(p.px - r, p.py - r, r * 2, r * 2);
      }
      sound.tick(now);
      // Keep running while seams settle and rubbed frost refreezes, then rest.
      idle = p ? 0 : idle + dt;
      return idle < 20;
    },
  };
}
