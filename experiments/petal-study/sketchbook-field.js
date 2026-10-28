// Sketchbook field: every piece laid out on an endless field you drag across. The surface bends and splits
// a little with drag speed, hover lifts a piece and plays it, click opens it. Drawn with three.js; one
// world unit is one CSS pixel. mountField() returns a handle whose destroy() frees the GPU and listeners.
import * as THREE from 'three';
import {videoPoster} from '../../src/data/video-posters.js';
import {sketchDates} from '../../src/data/portfolio.js';

// Shown first, centred and a little larger, in this order from the centre out.
const featuredTitles = ['Calligramme — Le Pont Mirabeau', 'The Persistence of Taste', 'Ferrari'];

const vertexShader = `
uniform float uArc;
varying vec2 vUv;
void main(){
  vUv = uv;
  vec4 w = modelMatrix * vec4(position, 1.);
  w.z -= (w.x * w.x + w.y * w.y) * uArc;
  gl_Position = projectionMatrix * viewMatrix * w;
}`;
const fragmentShader = `
uniform sampler2D uMap; uniform float uDim; uniform float uShift; uniform float uHover;
varying vec2 vUv;
void main(){
  vec4 c = texture2D(uMap, vUv);
  vec3 col = vec3(texture2D(uMap, vUv + vec2(uShift, 0.)).r, c.g, texture2D(uMap, vUv - vec2(uShift, 0.)).b);
  float g = dot(col, vec3(.299, .587, .114));
  col = mix(col, vec3(g) * .5, uDim);
  col *= 1. + uHover * .08;
  gl_FragColor = vec4(col, 1.);
  #include <colorspace_fragment>
}`;

export function mountField(host, items, {onOpen, isPaused = () => false} = {}) {
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touch = matchMedia('(pointer: coarse)').matches;
  const pieces = items.map(item => ({
    item, title: item.title, video: item.video, date: item.date || sketchDates[item.title] || '',
    still: item.image || item.poster || videoPoster(item.video), aspect: 4 / 3, meshes: [],
  })).filter(p => p.still);
  const featured = featuredTitles.map(t => pieces.find(p => p.title === t)).filter(Boolean);
  for (const p of featured) p.featured = true;
  const rest = pieces.filter(p => !p.featured);
  const order = [...featured, ...rest];

  const canvas = document.createElement('canvas');
  canvas.className = 'sb-field-canvas';
  canvas.tabIndex = 0;
  canvas.setAttribute('role', 'application');
  canvas.setAttribute('aria-label', 'Sketchbook. Drag or use the arrow keys to move around; the list after it opens each piece.');
  const hint = document.createElement('p');
  hint.className = 'sb-field-hint'; hint.setAttribute('aria-hidden', 'true');
  hint.textContent = touch ? 'Drag to wander · tap to open' : 'Drag to wander · click a piece to open';
  const label = document.createElement('div');
  label.className = 'sb-field-label'; label.setAttribute('aria-hidden', 'true');
  // The same pieces as plain buttons, for screen readers and keyboard users.
  const list = document.createElement('ul');
  list.className = 'sb-field-list';
  for (const p of order) {
    const li = document.createElement('li'), b = document.createElement('button');
    b.type = 'button'; b.textContent = [p.title, p.date].filter(Boolean).join(', ');
    b.onclick = () => onOpen?.(p.item, b);
    li.append(b); list.append(li);
  }
  host.append(canvas, hint, list);
  document.body.append(label);

  const renderer = new THREE.WebGLRenderer({canvas, antialias: true, alpha: true});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 1, 30000);
  const geometry = new THREE.PlaneGeometry(1, 1, 24, 24);
  const blank = new THREE.DataTexture(new Uint8Array([24, 21, 19, 255]), 1, 1); blank.needsUpdate = true;
  const shared = {uArc: {value: 0}, uShift: {value: 0}};
  let W = 0, H = 0, alive = true;

  function makeMesh(p) {
    const material = new THREE.ShaderMaterial({vertexShader, fragmentShader,
      uniforms: {...shared, uMap: {value: p.tex || blank}, uDim: {value: 0}, uHover: {value: 0}}});
    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData = {piece: p, hover: 0};
    p.meshes.push(mesh); scene.add(mesh);
    return mesh;
  }

  const loader = new THREE.TextureLoader(); loader.setCrossOrigin('anonymous');
  for (const p of pieces) loader.load(p.still, tex => {
    if (!alive) { tex.dispose(); return; }
    tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
    p.tex = tex; p.aspect = tex.image.width / tex.image.height;
    for (const m of p.meshes) if (m.material.uniforms.uMap.value === blank) m.material.uniforms.uMap.value = tex;
    layout();
  });

  let playing = null;
  function play(p) {
    if (playing === p) return;
    stop(playing); playing = p;
    if (!p?.video || still) return;
    if (!p.videoEl) {
      const v = p.videoEl = document.createElement('video');
      Object.assign(v, {crossOrigin: 'anonymous', muted: true, loop: true, playsInline: true, preload: 'auto', src: p.video});
      v.addEventListener('playing', () => {
        if (playing !== p || !alive) return;
        if (!p.videoTex) { p.videoTex = new THREE.VideoTexture(v); p.videoTex.colorSpace = THREE.SRGBColorSpace; }
        for (const m of p.meshes) m.material.uniforms.uMap.value = p.videoTex;
      });
    }
    p.videoEl.play().catch(() => {});
  }
  function stop(p) {
    if (!p) return;
    p.videoEl?.pause();
    for (const m of p.meshes) m.material.uniforms.uMap.value = p.tex || blank;
  }

  /* Field layout: a wrapped grid of slots, nearest-the-centre slots hold the featured pieces. */
  let cell = 0, cellH = 0, cols = 0, rows = 0, blockW = 0, blockH = 0, slots = [], hovered = null;
  const off = {x: 0, y: 0}, target = {x: 0, y: 0};
  const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const wrap = (v, m) => ((v % m) + m) % m - m / 2;
  function layout() {
    if (!W || !pieces.length) return;
    cell = Math.min(380, Math.max(170, Math.min(W * .24, H * .56))); cellH = cell * .92;
    const c = Math.max(6, Math.ceil((W + cell * 2) / cell)), r = Math.max(5, Math.ceil((H + cellH * 2) / cellH));
    if (c !== cols || r !== rows) {
      for (const s of slots) { scene.remove(s.mesh); s.mesh.material.dispose(); }
      for (const p of pieces) p.meshes = [];
      cols = c; rows = r; slots = [];
      for (let k = 0; k < cols * rows; k++) slots.push({k});
    }
    blockW = cols * cell; blockH = rows * cellH;
    for (const s of slots) {
      const col = s.k % cols, row = Math.floor(s.k / cols);
      s.x = col * cell + (hash(s.k) - .5) * cell * .18;
      s.y = row * cellH + (col % 2 ? cellH * .46 : 0) + (hash(s.k + 9) - .5) * cellH * .14;
    }
    if (!slots[0].mesh) {
      const dist = s => Math.hypot(wrap(s.x, blockW), wrap(s.y, blockH) * 1.4);
      const pool = rest.length ? rest : featured;
      const near = [...slots].sort((a, b) => dist(a) - dist(b));
      near.forEach((s, i) => { s.mesh = makeMesh(i < featured.length ? featured[i] : pool[(i - featured.length) % pool.length]); });
      // Open with the featured group in the middle of the view.
      const lead = near.slice(0, Math.max(1, featured.length));
      off.x = target.x = -lead.reduce((sum, s) => sum + wrap(s.x, blockW), 0) / lead.length;
      off.y = target.y = -lead.reduce((sum, s) => sum + wrap(s.y, blockH), 0) / lead.length;
    }
    for (const s of slots) {
      const p = s.mesh.userData.piece;
      const fit = p.featured ? .86 : .74 * (.86 + hash(s.k + 4) * .28), mw = cell * fit, mh = cellH * fit;
      const w = p.aspect >= mw / mh ? mw : mh * p.aspect;
      s.mesh.scale.set(w, w / p.aspect, 1);
    }
  }
  function resize() {
    const rect = host.getBoundingClientRect();
    W = Math.round(rect.width); H = Math.round(rect.height);
    if (!W || !H) return;
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.position.set(0, 0, (H / 2) / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
    camera.updateProjectionMatrix(); layout();
  }

  /* Input */
  const pointer = {x: 0, y: 0, cx: 0, cy: 0, inside: false, down: false, moved: 0, startX: 0, startY: 0, lastX: 0, lastY: 0};
  let lastInput = 0;
  const raycaster = new THREE.Raycaster();
  const pick = (x, y) => {
    raycaster.setFromCamera({x: x / W * 2 - 1, y: -(y / H) * 2 + 1}, camera);
    return raycaster.intersectObjects(scene.children)[0]?.object || null; // flat planes; close enough once the bend settles
  };
  const local = e => { const r = canvas.getBoundingClientRect(); pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top; pointer.cx = e.clientX; pointer.cy = e.clientY; };
  const interacted = () => { lastInput = performance.now(); hint.classList.add('is-gone'); };
  const on = (el, type, fn, opts) => { el.addEventListener(type, fn, opts); return () => el.removeEventListener(type, fn, opts); };
  const off$ = [
    on(canvas, 'pointerdown', e => {
      local(e); pointer.down = true; pointer.moved = 0;
      pointer.startX = pointer.lastX = e.clientX; pointer.startY = pointer.lastY = e.clientY;
      if (e.isTrusted) canvas.setPointerCapture(e.pointerId);
      interacted();
    }),
    on(canvas, 'pointermove', e => {
      local(e); pointer.inside = true;
      if (!pointer.down) return;
      const dx = e.clientX - pointer.lastX, dy = e.clientY - pointer.lastY;
      pointer.lastX = e.clientX; pointer.lastY = e.clientY;
      pointer.moved = Math.max(pointer.moved, Math.hypot(e.clientX - pointer.startX, e.clientY - pointer.startY));
      if (pointer.moved > 4) host.classList.add('is-dragging');
      target.x += dx; target.y += dy; interacted();
    }),
    on(canvas, 'pointerleave', () => { if (!pointer.down) pointer.inside = false; }),
    on(canvas, 'pointerup', e => {
      if (!pointer.down) return;
      local(e); pointer.down = false; host.classList.remove('is-dragging');
      if (pointer.moved < 6) { const m = pick(pointer.x, pointer.y); if (m) { stop(playing); playing = null; onOpen?.(m.userData.piece.item, canvas); } }
      if (e.pointerType !== 'mouse') pointer.inside = false;
    }),
    on(canvas, 'pointercancel', () => { pointer.down = false; pointer.inside = false; host.classList.remove('is-dragging'); }),
    on(canvas, 'wheel', e => { e.preventDefault(); target.x -= e.deltaX; target.y -= e.deltaY; interacted(); }, {passive: false}),
    on(canvas, 'keydown', e => {
      const step = cell * .9, d = {ArrowLeft: [step, 0], ArrowRight: [-step, 0], ArrowUp: [0, step], ArrowDown: [0, -step]}[e.key];
      if (!d) return; e.preventDefault(); target.x += d[0]; target.y += d[1]; interacted();
    }),
  ];
  const observer = new ResizeObserver(resize); observer.observe(host);
  resize();

  let last = performance.now();
  renderer.setAnimationLoop(now => {
    const dt = Math.min(3, (now - last) / 16.67); last = now;
    if (isPaused() || !W) return;
    // A slow drift while nobody steers; the first one waits so the opening pieces can be seen.
    if (!still && !pointer.down && now - lastInput > (lastInput ? 2500 : 7000)) { target.x -= .22 * dt; target.y -= .1 * dt; }
    const ease = still ? 1 : 1 - Math.pow(.86, dt), px = off.x, py = off.y;
    off.x += (target.x - off.x) * ease; off.y += (target.y - off.y) * ease;
    const speed = still ? 0 : Math.min(Math.hypot(off.x - px, off.y - py) / dt, 60);
    shared.uArc.value = speed * .0000048;
    shared.uShift.value = speed * .00005;
    for (const s of slots) {
      const m = s.mesh, u = m.userData;
      m.position.x = wrap(s.x + off.x, blockW);
      m.position.y = -wrap(s.y + off.y, blockH);
      u.hover += ((m === hovered ? 1 : 0) - u.hover) * (still ? 1 : .15);
      m.position.z = u.hover * 40;
      m.material.uniforms.uHover.value = u.hover;
      m.material.uniforms.uDim.value = hovered && m !== hovered ? .25 * u.hover + .18 : 0;
    }
    // Hover only when the field is nearly still, so a fast drag doesn't flicker titles.
    const next = !pointer.down && pointer.inside && speed < 6 ? pick(pointer.x, pointer.y) : null;
    if (next !== hovered) {
      hovered = next;
      host.classList.toggle('is-pointing', !!hovered);
      label.classList.toggle('is-on', !!hovered);
      if (hovered) {
        const p = hovered.userData.piece;
        label.replaceChildren(p.title);
        if (p.date) label.append(Object.assign(document.createElement('span'), {textContent: p.date}));
      }
      play(hovered?.userData.piece || null);
    }
    if (hovered) label.style.transform = `translate(${pointer.cx + 18}px,${pointer.cy + 14}px)`;
    renderer.render(scene, camera);
  });

  return {
    destroy() {
      if (!alive) return; alive = false;
      renderer.setAnimationLoop(null);
      off$.forEach(f => f()); observer.disconnect();
      for (const p of pieces) {
        if (p.videoEl) { p.videoEl.pause(); p.videoEl.removeAttribute('src'); p.videoEl.load(); }
        p.videoTex?.dispose(); p.tex?.dispose();
      }
      for (const s of slots) s.mesh?.material.dispose();
      geometry.dispose(); blank.dispose(); renderer.dispose(); renderer.forceContextLoss();
      label.remove(); canvas.remove(); hint.remove(); list.remove();
    },
  };
}
