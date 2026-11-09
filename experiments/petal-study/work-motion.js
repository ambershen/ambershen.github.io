// Motion for the Work overview: cards play a silent clip on hover (or, on touch screens, while they sit in
// the middle of the screen), and the Soft Matter cover plays its laundromat film on a loop.
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


// A cover that plays on its own, muted and looping, while it is on screen and not under the open panel.
// Reduced motion keeps the still.
export function loopCover(src, poster, label) {
  const video = Object.assign(document.createElement('video'), {src, poster, muted: true, loop: true, playsInline: true, preload: 'none'});
  video.className = 'work-media loop-cover'; video.setAttribute('muted', ''); video.setAttribute('aria-label', label);
  if (still) return video;
  let visible = false;
  const sync = () => visible && !document.body.classList.contains('case-open') ? video.play().catch(() => {}) : video.pause();
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync(); }, {threshold: .35}).observe(video);
  new MutationObserver(sync).observe(document.body, {attributes: true, attributeFilter: ['class']});
  return video;
}
