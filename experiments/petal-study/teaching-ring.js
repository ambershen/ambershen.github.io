// Teaching ring: the videos on one curved strip. Drag, scroll or use the arrow keys to turn it; the one in
// the centre comes forward in colour, the rest wait in grey. Click the centre to play, a side one to bring
// it round. Drawn with three.js; one world unit is one CSS pixel. destroy() frees the GPU and listeners.
import * as THREE from 'three';

const vertexShader = `
uniform float uArc;
varying vec2 vUv;
void main(){
  vUv = uv;
  vec4 w = modelMatrix * vec4(position, 1.);
  w.z -= w.x * w.x * uArc;
  gl_Position = projectionMatrix * viewMatrix * w;
}`;
// uCrop trims letterbox bars from 4:3 YouTube fallbacks.
const fragmentShader = `
uniform sampler2D uMap; uniform float uDim; uniform float uShift; uniform float uCrop;
varying vec2 vUv;
void main(){
  vec2 uv = vec2(vUv.x, .5 + (vUv.y - .5) * uCrop);
  vec4 c = texture2D(uMap, uv);
  vec3 col = vec3(texture2D(uMap, uv + vec2(uShift, 0.)).r, c.g, texture2D(uMap, uv - vec2(uShift, 0.)).b);
  float g = dot(col, vec3(.299, .587, .114));
  col = mix(col, vec3(g) * .55, uDim);
  gl_FragColor = vec4(col, 1.);
  #include <colorspace_fragment>
}`;

export function mountRing(host, videos, {onFocus, onOpen, isPaused = () => false, start = 0} = {}) {
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const N = videos.length;
  const canvas = document.createElement('canvas');
  canvas.className = 'ring-canvas';
  canvas.tabIndex = 0;
  canvas.setAttribute('role', 'application');
  canvas.setAttribute('aria-label', 'Teaching videos. Use the left and right arrow keys to turn, Enter to play.');
  host.append(canvas);

  const renderer = new THREE.WebGLRenderer({canvas, antialias: true, alpha: true});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 1, 30000);
  const geometry = new THREE.PlaneGeometry(1, 1, 32, 1);
  const blank = new THREE.DataTexture(new Uint8Array([24, 21, 19, 255]), 1, 1); blank.needsUpdate = true;
  const shared = {uArc: {value: 0}, uShift: {value: 0}};
  let W = 0, H = 0, alive = true;

  const meshes = videos.map(v => {
    const material = new THREE.ShaderMaterial({vertexShader, fragmentShader,
      uniforms: {...shared, uMap: {value: blank}, uDim: {value: .8}, uCrop: {value: 1}}});
    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData = {video: v, dim: .8};
    scene.add(mesh);
    return mesh;
  });

  // Full-size YouTube thumbnails where they exist, otherwise the 4:3 one with its bars cropped away.
  const loader = new THREE.TextureLoader(); loader.setCrossOrigin('anonymous');
  const textures = [];
  const apply = (mesh, tex, crop) => {
    if (!alive) { tex.dispose(); return; }
    tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4; textures.push(tex);
    mesh.material.uniforms.uMap.value = tex; mesh.material.uniforms.uCrop.value = crop;
  };
  meshes.forEach(mesh => {
    const v = mesh.userData.video;
    if (!v.youtube) { if (v.poster) loader.load(v.poster, tex => apply(mesh, tex, 1)); return; }
    const fallback = () => loader.load(`https://i.ytimg.com/vi/${v.youtube}/hqdefault.jpg`, tex => apply(mesh, tex, .75));
    if (v.smallThumb) { fallback(); return; } // YouTube has no full-size thumbnail for this one
    loader.load(`https://i.ytimg.com/vi/${v.youtube}/maxresdefault.jpg`, tex => {
      if (tex.image.width < 400) { tex.dispose(); fallback(); } else apply(mesh, tex, 1);
    }, undefined, fallback);
  });

  let S = 0, total = 0, scroll = 0, target = 0, focus = -1;
  function layout() {
    S = W < 700 ? W * .8 : Math.min(620, Math.max(300, W * .36)); total = N * S;
    const w = Math.min(S * .88, (H * .78) * 16 / 9);
    for (const m of meshes) m.scale.set(w, w * 9 / 16, 1);
    shared.uArc.value = 1 / (2 * W * 1.1);
  }
  function resize() {
    const rect = host.getBoundingClientRect();
    W = Math.round(rect.width); H = Math.round(rect.height);
    if (!W || !H) return;
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.position.set(0, 0, (H / 2) / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
    camera.updateProjectionMatrix();
    layout();
    scroll = target = (focus < 0 ? start : focus) * S; // keep the same video in the centre
  }

  /* Input */
  const pointer = {x: 0, y: 0, inside: false, down: false, moved: 0, startX: 0, lastX: 0};
  let lastInput = 0;
  const raycaster = new THREE.Raycaster();
  const pick = (x, y) => {
    raycaster.setFromCamera({x: x / W * 2 - 1, y: -(y / H) * 2 + 1}, camera);
    return raycaster.intersectObjects(meshes)[0]?.object || null;
  };
  const local = e => { const r = canvas.getBoundingClientRect(); pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top; };
  const on = (el, type, fn, opts) => { el.addEventListener(type, fn, opts); return () => el.removeEventListener(type, fn, opts); };
  const step = d => { target = Math.round(target / S) * S + d * S; lastInput = performance.now(); };
  const activate = m => {
    const i = meshes.indexOf(m);
    if (i === focus) onOpen?.(videos[i], canvas); else { target += m.position.x; lastInput = performance.now(); }
  };
  const off$ = [
    on(canvas, 'pointerdown', e => {
      local(e); pointer.down = true; pointer.moved = 0; pointer.startX = pointer.lastX = e.clientX;
      if (e.isTrusted) canvas.setPointerCapture(e.pointerId);
      lastInput = performance.now();
    }),
    on(canvas, 'pointermove', e => {
      local(e); pointer.inside = true;
      if (!pointer.down) return;
      const dx = e.clientX - pointer.lastX; pointer.lastX = e.clientX;
      pointer.moved = Math.max(pointer.moved, Math.abs(e.clientX - pointer.startX));
      if (pointer.moved > 4) host.classList.add('is-dragging');
      target -= dx * 1.4; lastInput = performance.now();
    }),
    on(canvas, 'pointerleave', () => { if (!pointer.down) pointer.inside = false; }),
    on(canvas, 'pointerup', e => {
      if (!pointer.down) return;
      local(e); pointer.down = false; host.classList.remove('is-dragging');
      if (pointer.moved < 6) { const m = pick(pointer.x, pointer.y); if (m) activate(m); }
      if (e.pointerType !== 'mouse') pointer.inside = false;
    }),
    on(canvas, 'pointercancel', () => { pointer.down = false; pointer.inside = false; host.classList.remove('is-dragging'); }),
    // Sideways scrolling turns the ring; up and down is left to the page.
    on(canvas, 'wheel', e => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault(); target += e.deltaX * .9; lastInput = performance.now();
    }, {passive: false}),
    on(canvas, 'keydown', e => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); step(e.key === 'ArrowLeft' ? -1 : 1); }
      else if ((e.key === 'Enter' || e.key === ' ') && focus >= 0) { e.preventDefault(); onOpen?.(videos[focus], canvas); }
    }),
  ];
  const observer = new ResizeObserver(resize); observer.observe(host);
  resize();

  let last = performance.now();
  renderer.setAnimationLoop(now => {
    const dt = Math.min(3, (now - last) / 16.67); last = now;
    if (isPaused() || !W) return;
    if (!pointer.down && now - lastInput > 160) target += (Math.round(target / S) * S - target) * (still ? 1 : .12); // settle on one
    const before = scroll;
    scroll += (target - scroll) * (still ? 1 : 1 - Math.pow(.88, dt));
    const vel = (scroll - before) / dt;
    shared.uShift.value = still ? 0 : Math.min(Math.abs(vel), 60) * .00004;
    const f = ((Math.round(scroll / S) % N) + N) % N;
    meshes.forEach((m, i) => {
      const u = m.userData;
      m.position.x = (((i * S - scroll) % total) + total * 1.5) % total - total / 2;
      u.dim += ((i === f ? 0 : .8) - u.dim) * (still ? 1 : .1);
      m.position.z = (1 - u.dim / .8) * 60;
      m.material.uniforms.uDim.value = u.dim;
    });
    if (f !== focus) { focus = f; onFocus?.(videos[f], f); }
    host.classList.toggle('is-pointing', !pointer.down && pointer.inside && !!pick(pointer.x, pointer.y));
    renderer.render(scene, camera);
  });

  return {
    step,
    destroy() {
      if (!alive) return; alive = false;
      renderer.setAnimationLoop(null);
      off$.forEach(f => f()); observer.disconnect();
      textures.forEach(t => t.dispose());
      meshes.forEach(m => m.material.dispose());
      geometry.dispose(); blank.dispose(); renderer.dispose(); renderer.forceContextLoss();
      canvas.remove();
    },
  };
}
