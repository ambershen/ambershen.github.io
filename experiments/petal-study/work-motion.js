// Motion for the Work overview: cards play a silent clip on hover (or, on touch screens, while they sit in
// the middle of the screen), and the Soft Matter cover steps through its four materials.
import './work-motion.css';

const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
const touch = matchMedia('(hover: none)').matches;
// On touch screens only one card moves at a time: the one in view nearest the middle of the screen.
const inView = new Map(); // card -> {start, stop}
let awake = null, queued = 0;
function pickAwake() {
  queued = 0;
  let best = null, bestDistance = Infinity;
  for (const [card, wake] of inView) {
    if (!card.isConnected) { inView.delete(card); continue; }
    const r = card.getBoundingClientRect(), d = Math.abs(r.top + r.height / 2 - innerHeight / 2);
    if (d < bestDistance) { bestDistance = d; best = wake; }
  }
  if (best === awake) return;
  awake?.stop(); awake = best; awake?.start();
}
const repick = () => { if (!queued) queued = requestAnimationFrame(pickAwake); };
if (touch) addEventListener('scroll', repick, {passive: true, capture: true});

// Wake a card on hover or focus; on touch screens, while it is the card in view nearest the middle.
function wake(card, start, stop) {
  if (touch) {
    const entry = {start, stop};
    new IntersectionObserver(([e]) => {
      if (e.intersectionRatio > .5) inView.set(card, entry);
      else { inView.delete(card); if (awake === entry) { stop(); awake = null; } }
      repick();
    }, {threshold: [0, .5, 1]}).observe(card);
    return;
  }
  card.addEventListener('pointerenter', start);
  card.addEventListener('pointerleave', stop);
  card.addEventListener('focus', start);
  card.addEventListener('blur', stop);
}

// A muted loop laid over the card's still; it fades in once it is actually playing.
export function hoverClip(card, frame, src) {
  if (!src || still) return;
  let video = null;
  wake(card, () => {
    if (!video) {
      video = Object.assign(document.createElement('video'), {src, muted: true, loop: true, playsInline: true, preload: 'none'});
      video.className = 'hover-clip';
      video.setAttribute('aria-hidden', 'true');
      video.addEventListener('playing', () => video.classList.add('is-on'));
      frame.append(video);
    }
    video.play().catch(() => {});
  }, () => {
    if (!video) return;
    video.pause(); video.classList.remove('is-on');
  });
}

// One specimen at a time on a ground sampled from its own edge, so there are no bands around it.
export function specimenCover(card, specimens, title) {
  const cover = document.createElement('div');
  cover.className = 'specimen-cover';
  const label = document.createElement('span');
  label.className = 'specimen-label';
  const shots = specimens.map((s, i) => {
    const img = Object.assign(document.createElement('img'), {src: s.image, alt: i ? '' : `${title} material type specimen`, loading: 'lazy', decoding: 'async', crossOrigin: 'anonymous'});
    img.addEventListener('load', () => {
      try {
        const c = document.createElement('canvas'); c.width = c.height = 1;
        const g = c.getContext('2d'); g.drawImage(img, img.naturalWidth * .04, img.naturalHeight * .5, 1, 1, 0, 0, 1, 1); // just inside the edge, past any rounded corner
        const [r, gr, b] = g.getImageData(0, 0, 1, 1).data;
        s.ground = `rgb(${r},${gr},${b})`;
        if (i === at) cover.style.backgroundColor = s.ground;
      } catch {}
    }, {once: true});
    cover.append(img);
    return img;
  });
  cover.append(label);
  let at = 0, timer = 0;
  const show = i => {
    at = i;
    shots.forEach((img, k) => img.classList.toggle('is-on', k === i));
    label.textContent = specimens[i].kind || specimens[i].title || '';
    if (specimens[i].ground) cover.style.backgroundColor = specimens[i].ground;
  };
  show(0);
  if (!still && specimens.length > 1) wake(card, () => {
    if (timer) return;
    show((at + 1) % specimens.length);
    timer = setInterval(() => show((at + 1) % specimens.length), 900);
  }, () => { clearInterval(timer); timer = 0; if (!touch) show(0); });
  return cover;
}
