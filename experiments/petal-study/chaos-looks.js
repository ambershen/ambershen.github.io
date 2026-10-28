// The chaos step: the flower breaks into square pixels where it stands, the pixels slide in order into the
// whole photograph, and the sharp photograph takes over. Moving over it breaks the picture back into pixels
// around the pointer and nudges them aside; a click scatters them all. Works in the flower's 640-unit space
// and is drawn inside study.js's transform.
const smooth = v => { const t = Math.max(0, Math.min(1, v)); return t * t * (3 - 2 * t); };
const rand = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// The whole photograph, centred in the flower's frame.
function portraitRect(portrait) {
  const fit = Math.min(510 / portrait.naturalWidth, 580 / portrait.naturalHeight);
  const w = portrait.naturalWidth * fit, h = portrait.naturalHeight * fit;
  return {x: (640 - w) / 2, y: (640 - h) / 2, w, h};
}

export function createChaosPortrait(portrait, flower, groups, N, reduced) {
  const CELL = 8, r = portraitRect(portrait);
  const cols = Math.floor(r.w / CELL), rows = Math.floor(r.h / CELL);
  const cw = r.w / cols, ch = r.h / rows;
  // Average colour per cell, from the portrait drawn small.
  const small = document.createElement('canvas'); small.width = cols; small.height = rows;
  const sc = small.getContext('2d', {willReadFrequently: true});
  sc.drawImage(portrait, 0, 0, cols, rows);
  const colour = sc.getImageData(0, 0, cols, rows).data;
  // Flower pixels in reading order map onto photo cells in reading order, so each square travels a short,
  // orderly way and the shape reads as one thing changing, not a cloud.
  const from = groups.flatMap(g => g.particles).sort((a, b) => a.y - b.y || a.x - b.x);
  const cells = [];
  const total = cols * rows;
  for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) {
    const i = row * cols + col, src = from[Math.floor(i / total * from.length)];
    const m = /rgb\((\d+),(\d+),(\d+)\)/.exec(src.color);
    cells.push({hx: r.x + col * cw, hy: r.y + row * ch, sx: src.x, sy: src.y, x: src.x, y: src.y, vx: 0, vy: 0,
      r: colour[i * 4], g: colour[i * 4 + 1], b: colour[i * 4 + 2], fr: +m[1], fg: +m[2], fb: +m[3],
      delay: row / rows * .5});
  }
  // The photograph on top, with a soft hole wherever the pointer has been stirring.
  const top = document.createElement('canvas'); top.width = top.height = N;
  const tc = top.getContext('2d');
  let start = 0, last = null, stir = 0, stirAt = null, elapsed = 0;
  const FLY = 1.6, SETTLE = .5 + FLY, CLEAR = .7;

  return {
    reset(now) {
      start = now; last = null; stir = 0;
      for (const p of cells) { p.x = p.sx; p.y = p.sy; p.vx = p.vy = 0; }
    },
    move(pointer) {
      const dx = last ? pointer.x - last.x : 0, dy = last ? pointer.y - last.y : 0;
      last = pointer; stirAt = pointer;
      const speed = Math.min(Math.hypot(dx, dy), 30);
      stir = Math.min(1, stir + speed / 30);
      const R = 64;
      for (const p of cells) {
        const ex = p.hx + 4 - pointer.x, ey = p.hy + 4 - pointer.y, d = Math.hypot(ex, ey);
        if (d > R || d < .01) continue;
        const push = (1 - d / R) * speed * .5;
        p.vx += ex / d * push * 10; p.vy += ey / d * push * 10;
      }
    },
    burst() {
      stir = 1; stirAt = null;
      for (const p of cells) {
        const a = rand(p.hx * 3 + p.hy + performance.now()) * Math.PI * 2, s = 120 + rand(p.hy + p.hx) * 240;
        p.vx += Math.cos(a) * s; p.vy += Math.sin(a) * s;
      }
    },
    leave() { last = null; },
    get formed() { return Math.min(1, elapsed / (SETTLE + CLEAR)); },
    draw(ctx, dt, now) {
      const t = reduced ? 99 : now - start;
      elapsed = t;
      // The flower gives way as its squares appear.
      const fade = 1 - smooth(t / .5);
      if (fade > 0) { ctx.save(); ctx.globalAlpha = fade; ctx.drawImage(flower, 0, 0); ctx.restore(); }
      for (const p of cells) {
        const f = smooth((t - p.delay) / FLY);
        if (f < 1) {
          p.x = p.sx + (p.hx - p.sx) * f; p.y = p.sy + (p.hy - p.sy) * f;
        } else {
          // Settled squares spring home after a nudge, without wobbling.
          p.vx += ((p.hx - p.x) * 30 - p.vx * 11) * dt; p.vy += ((p.hy - p.y) * 30 - p.vy * 11) * dt;
          p.x += p.vx * dt; p.y += p.vy * dt;
        }
        const size = (CELL - 1) * (.55 + .45 * smooth(t / .5));
        ctx.fillStyle = `rgb(${p.fr + (p.r - p.fr) * f | 0},${p.fg + (p.g - p.fg) * f | 0},${p.fb + (p.b - p.fb) * f | 0})`;
        ctx.fillRect(p.x, p.y, size, size);
      }
      // Then the sharp photograph, whole, except where the pointer is stirring the pixels.
      const clear = reduced ? 1 : smooth((t - SETTLE) / CLEAR);
      stir = Math.max(0, stir - dt * 1.2);
      if (clear > 0) {
        tc.clearRect(0, 0, N, N);
        tc.globalCompositeOperation = 'source-over';
        tc.drawImage(portrait, r.x, r.y, r.w, r.h);
        if (stir > .01 && stirAt) {
          const R = 40 + 40 * stir;
          const g = tc.createRadialGradient(stirAt.x, stirAt.y, R * .35, stirAt.x, stirAt.y, R);
          g.addColorStop(0, `rgba(0,0,0,${stir})`); g.addColorStop(1, 'rgba(0,0,0,0)');
          tc.globalCompositeOperation = 'destination-out'; tc.fillStyle = g; tc.fillRect(0, 0, N, N);
        }
        if (stir > .01 && !stirAt) { tc.globalCompositeOperation = 'destination-out'; tc.fillStyle = `rgba(0,0,0,${stir})`; tc.fillRect(0, 0, N, N); }
        ctx.save(); ctx.globalAlpha = clear; ctx.drawImage(top, 0, 0); ctx.restore();
      }
    },
  };
}
