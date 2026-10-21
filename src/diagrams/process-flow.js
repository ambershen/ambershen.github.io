// Natural Expressions — process diagram.
// One field of particles moves through five formations, one per stage of the process.
// The pointer pushes particles aside like a finger through water.

const STAGES = [
  {label: 'Observe', title: 'Natural observation', text: 'Watching how a surface looks, moves, and responds to a hand: a ripple spreading, a crack branching, a trace fading.'},
  {label: 'Decompose', title: 'AI-assisted decomposition', text: 'Breaking the experience into texture, gesture, and material behavior, then translating patterns into rules for an interaction.'},
  {label: 'Iterate', title: 'Coding and iteration', text: 'Building prototypes with a coding agent and looping between build and test, tuning hand tracking, sound, gravity, friction, and resistance.'},
  {label: 'Modules', title: 'Reusable modules and skills', text: 'Capturing behaviors that work as code modules, and the design reasoning behind them as skills.'},
  {label: 'Recipes', title: 'Material recipes', text: 'Composing modules into adjustable surfaces: how much effort leaves a mark, when sound responds, what continues after contact.', status: 'Next step'},
];
const MODULES = ['ripple', 'fracture', 'condensation', 'grain', 'snowfall', 'sound'];
const COLORS = ['#d9b5a3', '#d9b5a3', '#d9b5a3', '#eee8e4', '#eee8e4', '#a58f7e'];
const STEP_MS = 7500;
const TAU = Math.PI * 2;

const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };

export function processFlow() {
  const root = el('div', 'pf');
  const stage = el('div', 'pf-stage');
  const canvas = el('canvas');
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'Animated diagram of the process: natural observation, AI-assisted decomposition, coding and iteration, reusable modules and skills, material recipes.');
  stage.append(canvas, el('span', 'pf-hint', 'Move through the surface'));

  const steps = el('ol', 'pf-steps');
  const buttons = STAGES.map((s, i) => {
    const li = el('li'), b = el('button');
    b.type = 'button';
    b.append(el('span', 'pf-num', String(i + 1).padStart(2, '0')), el('span', 'pf-label', s.label));
    const bar = el('span', 'pf-bar'); bar.append(el('i')); b.append(bar);
    b.addEventListener('click', () => go(i, true));
    li.append(b); steps.append(li); return b;
  });
  const detail = el('div', 'pf-detail'); detail.setAttribute('aria-live', 'polite');
  root.append(stage, steps, detail);

  const ctx = canvas.getContext('2d');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W = 0, H = 0, dpr = 1, current = 0, stageStart = performance.now(), timer = 0, raf = 0, visible = false, t = 0, last = 0;
  const pointer = {x: -1e4, y: -1e4};

  const N = matchMedia('(max-width: 760px)').matches ? 380 : 600;
  const ps = Array.from({length: N}, (_, i) => ({
    i, x: 0, y: 0, vx: 0, vy: 0, a: 1,
    r1: Math.random(), r2: Math.random(), r3: Math.random(),
    c: COLORS[i % COLORS.length], k: 0.004 + Math.random() * 0.004,
  }));

  // Target position (and alpha) of particle p in a formation at time t.
  function target(n, p, t) {
    const cx = W / 2, cy = H / 2, s = Math.min(W, H * 1.5);
    const {i, r1, r2, r3} = p;
    if (n === 0) { // ripples on a water surface, seen in perspective
      const k = i % 5, phase = (k + t * 0.14) % 5, R = s * (0.03 + 0.095 * phase);
      const a = r1 * TAU, j = (r2 - 0.5) * 4;
      return [cx + Math.cos(a) * (R + j), cy + Math.sin(a) * (R + j) * 0.42, Math.max(0, 1 - phase / 5) * (0.5 + r3 * 0.5)];
    }
    if (n === 1) { // texture · gesture · behavior
      const g = i % 3, gx = W * [0.2, 0.5, 0.8][g], top = cy - s * 0.17;
      if (g === 0) { const a = r1 * TAU, d = Math.sqrt(r2) * s * 0.12; return [gx + Math.cos(a) * d + Math.sin(t * 0.8 + i) * 0.4, cy - 8 + Math.sin(a) * d, 0.55 + r3 * 0.45]; }
      if (g === 1) { const q = r1; return [gx + (q - 0.5) * s * 0.3, cy - 8 + Math.sin(q * TAU * 1.4 - t * 0.6) * s * 0.06 * Math.sin(q * Math.PI) + (r2 - 0.5) * 5, 0.4 + Math.sin(q * Math.PI) * 0.6]; }
      const f = (r1 + t * 0.05) % 1; return [gx + (r2 - 0.5) * s * 0.16 * (1 - f * 0.6), top + f * f * s * 0.32, 1 - f * 0.7];
    }
    if (n === 2) { // build ↔ test loop
      const th = r1 * TAU + t * 0.16, d = 1 + Math.sin(th) ** 2, A = Math.min(W * 0.4, s * 0.48);
      const j = (r2 - 0.5) * 9;
      return [cx + (A * Math.cos(th)) / d + j * 0.4, cy - 6 + (A * Math.sin(th) * Math.cos(th)) / d + j, 0.35 + r3 * 0.65];
    }
    if (n === 3) { // modules snap into blocks
      const m = i % 6, col = m % 3, row = (m / 3) | 0, q = Math.min(W * 0.2, s * 0.21), gap = q * 0.22;
      const ox = cx + (col - 1) * (q + gap), oy = cy - 8 + (row - 0.5) * (q * 0.78 + gap), hw = q / 2, hh = q * 0.39;
      const pulse = 1 + 0.015 * Math.max(0, Math.sin(t * 0.6 - m * 0.9));
      if (r3 < 0.78) { // on the outline
        const per = r1 * 4, side = per | 0, u = per - side;
        const pts = [[-hw + u * 2 * hw, -hh], [hw, -hh + u * 2 * hh], [hw - u * 2 * hw, hh], [-hw, hh - u * 2 * hh]][side];
        return [ox + pts[0] * pulse, oy + pts[1] * pulse, 0.85];
      }
      return [ox + (r1 - 0.5) * hw * 1.6, oy + (r2 - 0.5) * hh * 1.4, 0.18];
    }
    // recipes: modules composed into a bloom
    const L = i % 4, petals = [5, 5, 7, 9][L], R = s * [0.07, 0.13, 0.2, 0.27][L];
    const th = r1 * TAU + t * 0.025 * (L % 2 ? 1 : -1) + L * 0.4;
    const r = R * (0.45 + 0.55 * Math.abs(Math.sin((petals * th) / 2))) * (0.92 + r2 * 0.1) * (1 + Math.sin(t * 0.5 - L) * 0.01);
    return [cx + Math.cos(th) * r, cy - 6 + Math.sin(th) * r * 0.92, 0.45 + (1 - L / 4) * 0.45];
  }

  function labels(n, alpha) {
    if (alpha <= 0) return;
    const cx = W / 2, cy = H / 2, s = Math.min(W, H * 1.5);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = `500 ${W < 520 ? 10 : 11}px Manrope, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#a99b8f';
    if ('letterSpacing' in ctx) ctx.letterSpacing = '1.4px';
    const put = (txt, x, y) => ctx.fillText(txt.toUpperCase(), x, y);
    if (n === 0) put('a hand meets a surface', cx, cy + s * 0.3);
    if (n === 1) ['texture', 'gesture', 'behavior'].forEach((txt, g) => put(txt, W * [0.2, 0.5, 0.8][g], cy + s * 0.21));
    if (n === 2) { const A = Math.min(W * 0.4, s * 0.48); put('build', cx - A * 0.7, cy + s * 0.21); put('test', cx + A * 0.7, cy + s * 0.21); }
    if (n === 3) {
      const q = Math.min(W * 0.2, s * 0.21), gap = q * 0.22;
      MODULES.forEach((m, k) => put(m, cx + ((k % 3) - 1) * (q + gap), cy - 4 + (((k / 3) | 0) - 0.5) * (q * 0.78 + gap)));
    }
    if (n === 4) {
      const rows = [['effort', 'mark'], ['contact', 'sound'], ['release', 'what remains']];
      rows.forEach(([a, b], k) => put(`${a} → ${b}`, W * [0.17, 0.5, 0.83][k], H - 22));
    }
    ctx.restore();
  }

  function resize() {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(devicePixelRatio || 1, 2); W = r.width; H = r.height;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!ps[0].x) for (const p of ps) { const [x, y] = target(current, p, t); p.x = x; p.y = y; }
    if (reduced) draw(performance.now());
  }

  function draw(now) {
    const dt = Math.min(48, now - (last || now)); last = now;
    if (!reduced) t += dt / 1000;
    ctx.fillStyle = '#0c0b0a';
    ctx.fillRect(0, 0, W, H);
    ctx.lineCap = 'round';
    for (const p of ps) {
      const [tx, ty, ta] = target(current, p, t);
      if (reduced) { p.x = tx; p.y = ty; }
      else {
        p.vx += (tx - p.x) * p.k; p.vy += (ty - p.y) * p.k;
        const dx = p.x - pointer.x, dy = p.y - pointer.y, d2 = dx * dx + dy * dy, R = 56;
        if (d2 < R * R) { const d = Math.sqrt(d2) || 1, f = (1 - d / R) * 0.6; p.vx += (dx / d) * f; p.vy += (dy / d) * f; }
        p.vx *= 0.9; p.vy *= 0.9; p.x += p.vx; p.y += p.vy;
      }
      p.a += (ta - p.a) * 0.04;
      // Each particle is drawn as a streak along its velocity: motion blur without trails.
      ctx.globalAlpha = p.a * 0.8;
      ctx.strokeStyle = p.c;
      ctx.lineWidth = p.r3 > 0.9 ? 1.9 : 1.2;
      ctx.beginPath();
      ctx.moveTo(p.x - p.vx * 1.5 - 0.3, p.y - p.vy * 1.5);
      ctx.lineTo(p.x + 0.3, p.y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    labels(current, reduced ? 1 : Math.min(1, Math.max(0, (now - stageStart - 1400) / 1400)));
  }

  function loop(now) { draw(now); raf = visible ? requestAnimationFrame(loop) : 0; }

  function go(n, manual) {
    current = n; stageStart = performance.now();
    buttons.forEach((b, i) => {
      b.setAttribute('aria-pressed', String(i === n));
      b.classList.toggle('is-done', i < n);
      const bar = b.querySelector('.pf-bar i');
      bar.style.transition = 'none'; bar.style.width = i < n ? '100%' : '0%';
    });
    const s = STAGES[n];
    detail.replaceChildren(el('h4', '', s.title), el('p', '', s.text));
    if (s.status) detail.firstChild.append(el('span', 'pf-status', s.status));
    clearTimeout(timer);
    if (!reduced && visible) {
      const bar = buttons[n].querySelector('.pf-bar i');
      bar.getBoundingClientRect();
      bar.style.transition = `width ${STEP_MS}ms linear`; bar.style.width = '100%';
      timer = setTimeout(() => go((n + 1) % STAGES.length), STEP_MS);
    }
    if (reduced) draw(performance.now());
    if (manual) buttons[n].focus({preventScroll: true});
  }

  const move = e => { const r = canvas.getBoundingClientRect(); pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top; };
  canvas.addEventListener('pointermove', move);
  canvas.addEventListener('pointerdown', move);
  canvas.addEventListener('pointerleave', () => { pointer.x = pointer.y = -1e4; });

  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(([entry]) => {
    const was = visible; visible = entry.isIntersecting;
    if (visible && !was) { last = 0; if (!reduced && !raf) raf = requestAnimationFrame(loop); go(current); }
    if (!visible) { clearTimeout(timer); }
  }, {threshold: 0.25}).observe(root);

  go(0);
  return root;
}
